# Synchro GitHub automatique, toutes les 2 minutes : tes changements partent, ceux des autres arrivent.
# Lancé en arrière-plan à l'ouverture de Windows (voir installer.cmd). -Once : un seul passage.
# Après chaque changement, sync-stamp.json est mis à jour : l'extension le voit et se recharge toute seule.
param([switch]$Once)

$repo = Split-Path -Parent $PSScriptRoot
$stamp = Join-Path $repo "sync-stamp.json"

# Un seul exemplaire à la fois.
$mutex = New-Object Threading.Mutex($false, "RobloxCustomizerSynchro")
if (-not $mutex.WaitOne(0)) { exit }

$env:GIT_TERMINAL_PROMPT = "0"
$env:GCM_INTERACTIVE = "never"

# Git fourni avec GitHub Desktop (cherché à chaque passage : son dossier change à chaque mise à jour).
function Find-Git {
  Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*" -Directory -ErrorAction SilentlyContinue |
    Sort-Object { [version]($_.Name -replace '^app-', '') } -Descending |
    ForEach-Object { Join-Path $_.FullName "resources\app\git\cmd\git.exe" } |
    Where-Object { Test-Path $_ } | Select-Object -First 1
}

function G { & $script:git -C $repo -c credential.helper=manager @args 2>$null; $LASTEXITCODE }

do {
  $err = ""
  $script:git = Find-Git
  if (-not $script:git) {
    $err = "GitHub Desktop introuvable"
  } elseif (Test-Path (Join-Path $repo ".git\rebase-merge")) {
    $err = "conflit à régler dans GitHub Desktop"
  } else {
    if (& $script:git -C $repo status --porcelain 2>$null) {
      [void](G add -A)
      [void](G commit -q -m "Auto : $env:USERNAME, $(Get-Date -Format 'dd/MM HH:mm')")
    }
    if ((G fetch -q origin) -ne 0) {
      $err = "GitHub injoignable (connexion, ou relance installer.cmd)"
    } elseif ((G pull -q --rebase --autostash) -ne 0) {
      # Même lignes modifiées des deux côtés : on n'écrase rien, c'est à régler à la main.
      [void](G rebase --abort)
      $err = "conflit avec les changements de l'autre : ouvre GitHub Desktop"
    } elseif ([int](& $script:git -C $repo rev-list --count '@{u}..HEAD' 2>$null) -gt 0) {
      if ((G push -q) -ne 0) { $err = "envoi impossible (connexion, ou relance installer.cmd)" }
    }
  }
  $head = if ($script:git) { & $script:git -C $repo rev-parse HEAD 2>$null } else { "" }
  $json = (@{ head = "$head"; err = $err } | ConvertTo-Json -Compress)
  # Écrit seulement si ça change : l'extension ne recharge que pour un vrai changement.
  if (-not (Test-Path $stamp) -or [IO.File]::ReadAllText($stamp) -ne $json) {
    [IO.File]::WriteAllText($stamp, $json)
  }
  if (-not $Once) { Start-Sleep -Seconds 120 }
} while (-not $Once)

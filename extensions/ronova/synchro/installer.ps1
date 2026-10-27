# Connecte la synchro GitHub à ton compte (une seule fois par PC), puis la lance.
$repo = Split-Path -Parent $PSScriptRoot
$script = Join-Path $PSScriptRoot "synchro.ps1"

$git = Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*" -Directory -ErrorAction SilentlyContinue |
  Sort-Object { [version]($_.Name -replace '^app-', '') } -Descending |
  ForEach-Object { Join-Path $_.FullName "resources\app\git\cmd\git.exe" } |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $git) { Write-Host "Installe d'abord GitHub Desktop (desktop.github.com)." -ForegroundColor Red; exit 1 }

Write-Host "Connexion à GitHub : si une fenêtre s'ouvre, choisis « Sign in with your browser »."
& $git -C $repo -c credential.helper=manager fetch origin
if ($LASTEXITCODE -ne 0) { Write-Host "Connexion à GitHub ratée : relance installer.cmd." -ForegroundColor Red; exit 1 }

Start-Process powershell.exe -WindowStyle Hidden -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$script`""
Write-Host "C'est fait : la synchro tourne toutes les 2 minutes, jusqu'à l'extinction du PC." -ForegroundColor Green

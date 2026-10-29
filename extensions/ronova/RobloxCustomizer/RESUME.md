# RoNova (ex-Roblox Customizer) : où on en est

Nom affiché depuis le 26 octobre 2026 : **RoNova**. Les noms internes (clés de stockage `rbxCustomizer…`, dossier, serveur) n'ont pas changé, pour garder les réglages de tout le monde.

Résumé du travail fait avec Claude, pour reprendre plus tard ou pour quelqu'un qui rejoint le projet.
Dernière mise à jour : 26 octobre 2026.

## L'extension en bref

- C'est une extension Chrome / Opera GX (Manifest V3) qui personnalise roblox.com : thèmes, image de fond, badges, titres, Premium, etc.
- Elle est chargée **non empaquetée** depuis ce dossier, dans `opera://extensions` → Charger l'extension non empaquetée.
- Elle se compose d'environ 21 scripts dans `js/`, chargés dans l'ordre du `manifest.json`. `js/layout.js` est chargé en dernier et complète ou corrige les autres.
  - Pour étendre une fonction d'un autre fichier, on l'enveloppe : `const prev = fn; fn = function () { ... prev() ... }`.
  - Les réglages enregistrés sont dans `rbxSaved`. Ce qui est réellement appliqué est `rbxState = rbxEffective(rbxSaved)`.
  - On modifie les réglages avec `rbxSet`, `rbxSave` et `rbxNotify`, et on réagit aux changements avec `rbxOnChange`.
- Le serveur est un Cloudflare Worker « rbx-banners » (`worker/banner-worker.js`), à l'adresse `rbx-banners.rbx-customizer-nyrozz.workers.dev`.
  - Il sert aux bannières publiques, aux titres, à la modération des images et textes (Workers AI) et à la livraison rapide des badges et du Premium.
  - Il utilise une base KV `BANNERS` et l'IA `AI`. Son secret est `ADMIN_KEY`.
  - `worker/banner-worker-COPIER.txt` est une copie du code à coller dans Cloudflare. Elle n'est pas partagée sur GitHub.
- La liste Premium est un gist GitHub (compte itssnyrozz). Pour donner Premium, un badge ou la certif, il faut un token GitHub connecté dans l'extension (Admin → Licences → Premium automatique).

## Ce qui a été fait

- **Image / GIF de fond**
  - Elle s'affiche à nouveau. Le bug venait de `core.js` : avec Premium actif, `rbxEffective` modifiait directement les réglages enregistrés, ce qui effaçait le fond. Il renvoie maintenant une copie.
  - L'image est vérifiée par la modération avant de s'afficher. La ligne sous le bouton indique où ça en est, ou l'erreur.
  - Le fichier est enregistré **en morceaux de 512 Ko**, parce qu'Opera GX perdait sans erreur les gros GIF enregistrés d'un seul bloc.
- **Thème adapté à l'image** : il est activé par défaut (« Adapter les couleurs du thème à l'image »). Le fond, les cartes et l'accent sont calculés à partir des couleurs de l'image.
- **Certif**
  - Le bloc pour la donner a été remis : Admin → Badges → « Badge certifié à donner ».
  - Une nouvelle clé de modération (`ADMIN_KEY`) a été générée. Elle n'est **pas** dans ce dossier.
- **Premium, certif, badges et titres arrivent en quelques secondes**
  - Chaque extension interroge le serveur toutes les 10 s, seulement quand l'onglet est visible (route `/ping/:uid`).
  - Quand l'admin donne quelque chose, le serveur prévient le joueur concerné, qui recharge alors ses badges.
  - Pour les titres, le serveur renvoie un numéro de version, et l'extension ne les recharge que s'il a changé.
- **`.gitignore`** : il exclut la copie `COPIER.txt`, `worker/.wrangler/` et `node_modules/`.

## Ce qui reste à faire (nyroz)

1. **Déployer la dernière version du serveur.** Colle le contenu de `worker/banner-worker-COPIER.txt` dans Cloudflare → rbx-banners → Edit code, puis Deploy. Pour vérifier que c'est la bonne version, fais Ctrl+F `titlesVersion` : ce mot doit être présent.
2. **Mettre la clé de modération à deux endroits** : dans Cloudflare (Settings → Variables and Secrets → `ADMIN_KEY`) et dans l'extension (Admin → En ligne → Modération).
3. **Reconnecter GitHub**
   - Crée un nouveau token sur le compte itssnyrozz, avec une autorisation « gist » et un nom nouveau, par exemple « Roblox Customizer 2 ».
   - Colle-le dans Admin → Licences → Premium automatique.
4. **Remettre le GIF de fond.** Après avoir rechargé l'extension (↻), choisis le GIF Noot Noot à nouveau.
5. **Mettre le projet sur GitHub pour travailler à deux** (voir plus bas).

## Travailler à deux (GitHub Desktop)

- **Toi, une seule fois**
  1. Installe GitHub Desktop.
  2. Fais File → Add local repository → ce dossier → create a repository.
  3. Clique sur Publish repository en laissant la case **Private** cochée.
  4. Sur github.com, ouvre le dépôt, puis Settings → Collaborators → ajoute le pseudo de ton pote.
- **Ton pote, une seule fois**
  1. Il accepte l'invitation.
  2. Dans GitHub Desktop, il fait File → Clone repository.
  3. Il charge le dossier cloné dans `opera://extensions`.
- **Chaque jour**
  - Avant de coder : Fetch origin, puis Pull.
  - Après avoir codé : Commit, puis Push.
  - Dans les deux cas, recharge ensuite l'extension avec ↻.
  - Évitez de modifier le même fichier en même temps.
- **Les secrets ne sont jamais dans le dossier.** Clé admin, clé de modération et token GitHub restent dans le navigateur de chacun. Ton pote n'est donc pas admin, sauf si tu lui donnes la clé.
- **Idée pour plus tard** : un message « Nouvelle version disponible » dans l'extension, qui prévient quand l'autre a fait un Push.

## Astuces pour déboguer

- Le navigateur utilisé est **Opera GX**, et la console F12 marche mal. Lis plutôt les lignes d'état du panneau, par exemple celle sous « Image de fond ».
- Les réglages enregistrés sont dans `%APPDATA%\Opera Software\Opera GX Stable\Default\Local Extension Settings\<id de l'extension>`.
  - Ce sont des fichiers LevelDB `.log` et `.ldb`.
  - Ouvre-les en lecture partagée, puis cherche les clés `rbxCustomizerSettings` et `rbxCustomizerBgFile`.
- Pour tester, teste toujours **avec Premium et admin actifs**. Plusieurs bugs n'apparaissaient que dans ce cas.

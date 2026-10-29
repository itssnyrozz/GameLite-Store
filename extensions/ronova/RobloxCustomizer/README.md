# Roblox Customizer

Extension Chrome (Manifest V3) qui personnalise roblox.com avec un panneau de réglages intégré.

## Installation

1. Ouvrir `chrome://extensions` et activer le mode développeur.
2. « Charger l'extension non empaquetée » et choisir ce dossier.
3. Après une modification : bouton Recharger sur la carte de l'extension, puis recharger l'onglet Roblox.

## Organisation

- `manifest.json` : déclaration de l'extension. L'ordre des fichiers dans `content_scripts` compte.
- `background.js` : service worker. Fait les requêtes vers les API Roblox pour les scripts de page (liste blanche d'URL).
- `js/` : scripts injectés dans les pages Roblox, chargés dans cet ordre :
  - `core.js` : réglages par défaut, stockage, licences, planificateur `rbxEvery`, copie `rbxClip`, requêtes `rbxBgFetch`.
  - `theme.js` : génération du CSS des thèmes et couleurs.
  - `panel.js` : panneau de réglages (onglets, champs, actions).
  - `features.js` : barre d'infos sur les profils, jeux, objets, groupes ; navigateur de serveurs ; temps de jeu.
  - `social.js` à `social8.js` : couches successives (amis, best friends, tenues, styles, activité, design moderne…).
    Chaque couche ajoute ses réglages à `RBX_DEFAULTS` et peut remplacer une fonction d'une couche précédente
    en gardant l'ancienne dans une constante (`const xPrev = x; x = function () { … xPrev() … }`).
  - `friends.js` : onglet Amis > Mes amis (grille avec statut en direct, filtres, recherche, best friends).
  - `badges.js` : badge Créateur (compte du créateur inscrit dans `RBX_CREATOR`, visible par tous) et badge certifié local (réservé à l'abonnement secret).
  - `cloud.js` : Premium automatique. L'admin donne le Premium depuis l'onglet Admin ; la liste (clés signées) est stockée dans un GitHub Gist (`RBX_PREMIUM_GIST`) que chaque extension relit toutes les 5 min. Outils admin (stats, recherche joueur, maintenance).
  - `modern.js` : animations et design moderne de Roblox (apparition des cartes, en-tête en verre, menus animés), fermeture animée du panneau.
  - `extras.js` : dernière couche (amis en commun, historique de prix, aide des raccourcis, en-têtes d'onglets).
  - `tools.js` : alertes quand un ami se connecte ou lance un jeu (gratuit), annonces du créateur (fichier `rbx-announce.json` du Gist, lu par `rbxCloudSync`), entretien de la liste en ligne dans Admin (retirer les expirés, sauvegarde, restauration), jeux récents (onglet Outils), Note privée gratuite, best friends 2.0 (étoile au survol, anneau et nom dorés via `data-rx-bf`, compteur en ligne, date d'ajout), miniatures en fondu, bannières publiques (fichier `rbx-banners.json` du Gist, publiées depuis Admin, affichées par `rbxSocBannerEl` dans `social8.js` via `rbxSharedBannerFor`).
  - `perks.js` : badge certifié (le créateur l'a toujours ; il le donne depuis Admin > Chercher un joueur, clé signée `t: "cert"` dans le Gist, les anciens dons `secret` comptent aussi ; dernier état gardé dans localStorage « rbxcCert »), pseudo stylé (Premium, noms marqués `data-rx-myname`), curseurs de souris (gratuit).
- `css/` : styles, un fichier par couche, chargés dans le même ordre.
- `worker/` : serveur des bannières publiques (Cloudflare Worker + KV). Chaque joueur vérifie son compte en collant un code dans sa description Roblox, puis sa bannière est publiée automatiquement. Adresse à renseigner dans `RBX_BANNER_API` (js/tools.js). Chaque bannière est vérifiée par une IA de vision (Workers AI, liaison `AI`) avant publication. Ce dossier n'est pas chargé par l'extension.


## Règles utiles

- Les tâches répétitives passent par `rbxEvery(fn, ms)` (dans `core.js`) et non `setInterval` ; elles tournent quand le navigateur est libre (`requestIdleCallback`), sont mises en pause pendant le défilement, et les passages qui parcourent la page sautent leur tour via `rbxDomChanged(clé)` si rien n'a changé :
  elles s'arrêtent quand l'onglet est en arrière-plan.
- Un réglage Premium se déclare dans `RBX_PREMIUM_OFF` (valeur forcée sans licence) ou `RBX_LOCK_ONLY` (champ grisé).
- Nouvelle URL POST : l'ajouter à la liste blanche de `background.js` et à `RBX_POST_OK`.

# Sponsors de Vexa

Vexa affiche quelques tuiles « Sponsorisé » (liens d'affiliation) sur la page d'accueil et dans le Vexa Store, et peut afficher la bannière d'une régie publicitaire sur l'accueil. Tout se règle dans **`sponsors.json`**, sans republier Vexa : chaque Vexa relit ce fichier au lancement puis toutes les 6 heures.

## Règles

- Jamais de pub sur les sites web, jamais de son, d'animation ou de fenêtre surgissante.
- 6 tuiles au maximum ; chacune est marquée « Sponsorisé ».
- Les tuiles ne contiennent aucun script : juste un nom, une couleur, une lettre et un lien.
- Quand on clique, Vexa ouvre l'adresse écrite dans ce fichier (jamais une adresse venant d'une page). Son bloqueur de pubs laisse passer la redirection d'affiliation.

## Ajouter un lien d'affiliation

1. Inscris-toi au programme d'affiliation de la boutique (exemples : Instant Gaming, Eneba, Humble Bundle, Kinguin, Fanatical). Chacun donne un lien personnel ou un identifiant.
2. Dans `sponsors.json`, mets ce lien dans `url` (il doit commencer par `https://`), puis passe `"enabled": true`.
3. `where` : `"home"` pour l'accueil, `"store"` pour le Vexa Store, ou les deux.
4. `id` : en minuscules, chiffres et tirets seulement (ex. `instant-gaming`).
5. Enregistre : la synchro publie le fichier. Sur vos PC (créateurs), Vexa lit directement la copie locale, donc le changement se voit au prochain lancement.

## Bannière d'une régie publicitaire

1. Crée un compte chez une régie (sa validation peut prendre quelques jours).
2. Colle le code de la bannière dans `network.html`, règle `network.height` (en pixels, 50 à 300), puis passe `network.enabled` à `true`.
3. La bannière s'affiche dans un cadre isolé de l'accueil, marqué « Publicité ». Le bloqueur de Vexa la laisse passer, mais une extension comme uBlock peut la bloquer.
4. Avant d'activer une régie, mets à jour `CONFIDENTIALITE.md` avec son nom et ce qu'elle collecte.

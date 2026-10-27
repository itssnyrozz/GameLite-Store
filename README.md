# GameLite Store

Le catalogue d'extensions de **GameLite**, le navigateur léger pour les joueurs.
Les extensions utilisent le format des extensions Chrome (Manifest V3).

- `extensions.json` : les extensions publiées, une par ligne. GameLite lit ce fichier.
- `exemples/` : les extensions officielles de l'équipe.

## Publier une extension (gratuit)

Il n'y a pas de compte développeur payant : un compte GitHub gratuit suffit.

1. Crée ton extension. Dans GameLite, « Extensions → Publier → Créer un modèle d'extension » te donne une base.
2. Mets-la dans un dépôt GitHub **public**.
3. Dans GameLite, va dans « Extensions → Publier » :
   - colle le lien du dépôt ;
   - clique sur « Vérifier », puis sur « Envoyer la demande ».

   Un ticket « [Extension] … » s'ouvre ici, déjà rempli.

L'équipe relit le code, puis valide. L'extension est **figée sur le commit vérifié** : pour publier une mise à jour, envoie une nouvelle demande.

## Valider une demande (équipe GameLite)

Dans GameLite, va dans « Extensions → Modération ». Cet onglet n'apparaît que si ce dépôt est cloné à côté de GameLite.

1. « Voir le code », puis « Tester ».
2. « Approuver » : l'extension est ajoutée à `extensions.json`, et la synchro l'envoie.
3. Ferme le ticket.

# Démineur

Le démineur classique : ouvre toutes les cases qui ne cachent pas de mine, en t'aidant des chiffres. Trois niveaux et un plateau sur mesure, un mode « sans hasard » où tout se résout par la logique, des indices et des records par niveau.

*English version: [README.en.md](README.en.md)*

## Commandes

- **Clic** : ouvrir une case. Le **premier clic n'est jamais une mine**.
- **Clic droit** : poser un drapeau, puis un « ? », puis rien.
- **Clic sur un chiffre** dont tous les drapeaux sont posés (ou **clic molette**, ou les **deux boutons** à la fois) : ouvre toutes ses voisines d'un coup.
- **Clic sur le visage** : nouvelle partie.

## Les règles

- Chaque chiffre indique le nombre de mines parmi les 8 cases qui l'entourent. Une case sans mine autour s'ouvre en grand, avec toutes ses voisines.
- Tu gagnes quand toutes les cases sans mine sont ouvertes ; ouvrir une mine fait perdre la partie (« Boum ! »).
- Le compteur en haut indique les mines restantes (mines moins drapeaux posés) et le chrono ton temps.

## Niveaux

- **Débutant** : 9 × 9, 10 mines.
- **Intermédiaire** : 16 × 16, 40 mines.
- **Expert** : 30 × 16, 99 mines.
- **Perso** : choisis largeur, hauteur et nombre de mines (de 5 à 40 colonnes, de 5 à 30 lignes), par exemple `24 x 18 x 70`.

## Les aides

- **Sans hasard** : le plateau est tiré de façon à toujours se résoudre par la logique, sans jamais devoir deviner entre deux cases.
- **Indice** : ouvre une case sûre, au prix de 10 secondes de pénalité ; une partie avec indice ne compte pas pour le record.
- **Taille du plateau** : agrandit ou réduit l'affichage des cases.

## Statistiques

L'en-tête montre ton meilleur temps à chaque niveau, et pour le niveau en cours tes parties gagnées sur jouées et ta série de victoires.

## Données et synchronisation

Tes meilleurs temps et tes statistiques sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Démineur → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).

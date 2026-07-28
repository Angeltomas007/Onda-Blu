# Onda Blu

Site vitrine pour **Onda Blu**, un service de conciergerie de déplacements (VTC, taxi, van) pour la clientèle yacht en Méditerranée.

🔗 Site en ligne : https://angeltomas007.github.io/Onda-Blu/

## Structure du dépôt

```
index.html          Page principale du site
css/style.css        Styles (palette blanc/bleu marine, police Cinzel)
js/i18n.js            Dictionnaire de traductions (EN/FR/IT) et logique du sélecteur de langue
js/main.js            Interactions (menu, formulaire, chips de destinations, etc.)
assets/img/qr-contact.svg   QR code WhatsApp utilisé dans les documents imprimés

poster.html          Affiche A5 avec QR code WhatsApp (document imprimé, hors site)
carte-visite.html    Carte de visite 85×55mm, recto/verso (document imprimé, hors site)
prospectus.html      Flyer A5 : services, destinations, contact (document imprimé, hors site)
```

## Le site (index.html)

- **Langues** : anglais par défaut, sélecteur EN/FR/IT dans le menu (`js/i18n.js`).
- **Services** : VTC/Taxi, Vans & Groupes, Aéroports & Gares, Sur mesure, Transport héliporté (marqué "Bientôt disponible").
- **Destinations** : deux mini-cartes illustrées (Saint-Tropez & le Golfe / Costa Smeralda Sardaigne) et une rangée de boutons rapides (Monaco, Calvi, Portofino, Itinéraire personnalisé, Elsewhere) qui pré-remplissent le formulaire de contact.
- **Réservation** : formulaire avec menus déroulants pour le point de départ et d'arrivée.
- **Contact** : WhatsApp comme canal principal (bulle flottante + bulle ronde dans la section contact).

## Documents imprimés

Ces fichiers sont indépendants du site (pas de lien depuis `index.html`) et sont destinés à être imprimés :

- `poster.html` — petite affiche avec QR code WhatsApp.
- `carte-visite.html` — carte de visite standard 85×55mm.
- `prospectus.html` — flyer A5 présentant services, destinations et contact.

Ouvrez-les dans un navigateur puis utilisez "Imprimer" (Ctrl/Cmd+P) pour générer un PDF ou imprimer directement.

## Déploiement (GitHub Pages)

Le site est publié via **GitHub Pages** (Settings → Pages → Deploy from branch → `main` → `/root`).

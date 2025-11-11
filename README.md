# 🧃 Juice Finder France

Une application web moderne pour rechercher, filtrer et visualiser sur carte les restaurants, bars et cafés de France.

**🆕 Version MySQL** : Tous les établissements sont maintenant stockés localement dans une base de données MySQL pour des performances optimales et une autonomie complète.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MySQL](https://img.shields.io/badge/MySQL-8-orange)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)

## ✨ Fonctionnalités

- 🗃️ **Base de données locale** : Tous les restaurants stockés en MySQL
- 🔄 **Synchronisation API** : Bouton pour mettre à jour depuis OpenDataSoft
- 🔍 **Recherche instantanée** : Requêtes optimisées avec index
- 🗺️ **Carte interactive** avec MapLibre GL JS
- 🎯 **Filtres dynamiques** par type, région et département
- 📊 **Pagination infinie** avec TanStack Query
- 💾 **Export CSV** des résultats
- 📱 **Responsive design** (mobile, tablette, desktop)
- ⚡ **Cache intelligent** pour des performances optimales

## 🛠️ Stack technique

- **Framework:** Next.js 14 (App Router)
- **Langage:** TypeScript
- **Base de données:** MySQL / MariaDB
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **State & Cache:** TanStack Query (React Query)
- **Carte:** MapLibre GL JS
- **HTTP Client:** Axios

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- MySQL ou MAMP/XAMPP avec MySQL

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/juice-finder.git
cd juice-finder

# Installer les dépendances
npm install

# Configurer la base de données (MAMP)
# Assurez-vous que MySQL est démarré sur le port 8889

# Le fichier .env est déjà configuré pour MAMP :
# DATABASE_URL="mysql://root:root@127.0.0.1:8889/juice_finder"

# Créer la base de données
./setup-database.sh

# OU manuellement :
npx prisma generate
npx prisma migrate dev --name init

# Lancer l'application
npm run dev
```

### Synchronisation des données

1. Ouvrez http://localhost:3000
2. Cliquez sur le bouton bleu "Mettre à jour depuis l'API" en bas à droite
3. Attendez la synchronisation (5-10 minutes pour ~50 000 établissements)
4. Rafraîchissez la page pour voir tous les résultats !

## 📁 Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── restaurants/
│   │   │   ├── route.ts          # GET restaurants depuis MySQL
│   │   │   └── update/
│   │   │       └── route.ts      # POST sync avec OpenDataSoft
│   │   └── regions/
│   │       └── route.ts          # GET liste des régions
│   ├── components/
│   │   ├── SearchBar.tsx         # Barre de recherche
│   │   ├── Filters.tsx           # Filtres dynamiques
│   │   ├── MapView.tsx           # Carte MapLibre
│   │   ├── ResultsList.tsx       # Liste avec pagination
│   │   ├── RestaurantCard.tsx    # Carte établissement
│   │   ├── UpdateButton.tsx      # Bouton de sync
│   │   └── Loader.tsx            # Loader
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── db.ts                     # Client Prisma
│   ├── api.ts                    # Fonctions API
│   ├── types.ts                  # Types TypeScript
│   └── utils.ts                  # Utilitaires
├── hooks/
│   └── useRestaurantSearch.ts    # Hook TanStack Query
└── prisma/
    └── schema.prisma             # Schéma base de données
```

## 🔌 API

L'application utilise l'API publique OpenDataSoft :
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records
```

### Paramètres supportés :
- `q` : Recherche textuelle
- `where` : Filtres (type, region, department)
- `limit` : Nombre de résultats par page (défaut: 20)
- `offset` : Pagination
- `order_by` : Tri (défaut: name)

## 🎨 Fonctionnalités avancées

### Recherche intelligente
- Debounce de 300ms pour éviter trop de requêtes
- Cache automatique de 5 minutes
- Retry automatique en cas d'erreur

### Carte interactive
- Markers personnalisés selon le type d'établissement
- Popups avec informations détaillées
- Zoom automatique sur les résultats
- Focus sur l'établissement sélectionné

### Export de données
- Export CSV avec toutes les informations
- Format compatible Excel
- Encodage UTF-8 avec BOM

## 🚀 Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint
```

## 🌐 Déploiement

### Vercel (recommandé)
```bash
npm install -g vercel
vercel
```

### Autre plateforme
```bash
npm run build
npm start
```

## 📝 Mentions légales

- **Données :** © OpenStreetMap contributors
- **API :** OpenDataSoft
- **Fond de carte :** CartoDB Positron

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Créé avec ❤️ pour découvrir les meilleurs établissements de France

---

**Note :** Ce projet utilise des données ouvertes d'OpenStreetMap. La qualité et la complétude des données dépendent des contributions de la communauté OSM.

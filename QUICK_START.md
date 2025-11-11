# 🚀 Démarrage rapide - Juice Finder France (MySQL)

## ✅ Configuration terminée !

Votre projet est maintenant configuré avec :
- ✅ Base de données MySQL créée
- ✅ Tables Prisma migrées
- ✅ Client Prisma généré
- ✅ Build réussi

---

## 🏃 Étapes pour démarrer

### 1️⃣ Vérifier que MAMP est démarré

Assurez-vous que MySQL est actif dans MAMP (port 8889).

### 2️⃣ Démarrer l'application

```bash
cd /Users/brayan/Sites/juice-finder
npm run dev
```

L'application sera accessible sur **http://localhost:3000** (ou 3001 si le port est occupé).

### 3️⃣ Synchroniser les données

1. **Ouvrez l'application** dans votre navigateur
2. **Cliquez sur le bouton bleu en bas à droite** : "Mettre à jour depuis l'API"
3. **Attendez** (5-10 minutes) que tous les restaurants soient synchronisés
4. **Rafraîchissez la page** pour voir les résultats

---

## 📊 Vérifier les données en base

### Voir le nombre de restaurants

```bash
/Applications/MAMP/Library/bin/mysql80/bin/mysql -u root -proot --socket=/Applications/MAMP/tmp/mysql/mysql.sock juice_finder -e "SELECT COUNT(*) as total FROM restaurants;"
```

### Voir quelques restaurants

```bash
/Applications/MAMP/Library/bin/mysql80/bin/mysql -u root -proot --socket=/Applications/MAMP/tmp/mysql/mysql.sock juice_finder -e "SELECT name, type, city, region FROM restaurants LIMIT 10;"
```

### Statistiques par type

```bash
/Applications/MAMP/Library/bin/mysql80/bin/mysql -u root -proot --socket=/Applications/MAMP/tmp/mysql/mysql.sock juice_finder -e "SELECT type, COUNT(*) as count FROM restaurants GROUP BY type ORDER BY count DESC;"
```

---

## 🔧 Configuration

### Variables d'environnement (.env)

```env
DATABASE_URL="mysql://root:root@127.0.0.1:8889/juice_finder"
NEXT_PUBLIC_API_BASE_URL="https://public.opendatasoft.com/api/explore/v2.1"
```

### Port MySQL MAMP

Par défaut, MAMP utilise le port **8889** pour MySQL (pas 3306).

---

## 🛠️ Commandes utiles

### Démarrage
```bash
npm run dev          # Mode développement
npm run build        # Build production
npm start            # Démarrer en production
```

### Prisma
```bash
npx prisma studio    # Interface graphique pour voir les données
npx prisma generate  # Regénérer le client Prisma
npx prisma migrate dev --name nom_migration  # Nouvelle migration
```

### Base de données
```bash
# Se connecter à MySQL
/Applications/MAMP/Library/bin/mysql80/bin/mysql -u root -proot --socket=/Applications/MAMP/tmp/mysql/mysql.sock juice_finder

# Voir toutes les tables
SHOW TABLES;

# Voir la structure de la table restaurants
DESCRIBE restaurants;

# Compter les restaurants
SELECT COUNT(*) FROM restaurants;
```

---

## 🎯 Fonctionnalités disponibles

### ✅ Recherche
- Recherche par nom dans la barre de recherche
- Debounce de 300ms pour optimiser les requêtes

### ✅ Filtres
- Type : Restaurant, Bar, Café, Fast Food, Pub
- Région : Liste dynamique depuis la base
- Département : Recherche textuelle

### ✅ Carte
- Affichage de tous les restaurants avec coordonnées
- Markers personnalisés par type
- Popups avec informations détaillées
- Zoom automatique sur les résultats

### ✅ Liste
- Pagination infinie (20 résultats par page)
- Cartes détaillées pour chaque établissement
- Actions : Copier téléphone, Appeler, Site web
- Export CSV

### ✅ Synchronisation
- Bouton en bas à droite
- Import de tous les établissements depuis OpenDataSoft
- Statistiques après sync
- Mise à jour incrémentielle (upsert)

---

## 🐛 Résolution de problèmes

### Problème : La base est vide

**Solution :** Cliquez sur le bouton "Mettre à jour depuis l'API" en bas à droite.

### Problème : "Can't connect to database"

**Solutions :**
1. Vérifier que MAMP est démarré
2. Vérifier le port (8889 pour MAMP)
3. Vérifier le mot de passe (root par défaut)

### Problème : La synchronisation ne fonctionne pas

**Solution :**
Regardez la console du terminal où `npm run dev` tourne. Vous verrez les logs de synchronisation en temps réel.

### Problème : Pas de données sur la carte

**Solutions :**
1. Attendre que la synchronisation soit terminée
2. Rafraîchir la page
3. Vérifier que les restaurants ont des coordonnées GPS

---

## 📈 Performances

### Recherche
- **Instantanée** grâce aux index MySQL
- Cache TanStack Query de 5 minutes
- Debounce de 300ms sur la recherche

### Carte
- Affichage optimisé avec MapLibre GL JS
- Zoom automatique sur les résultats
- Gestion de milliers de markers

### Base de données
- Index sur : type, region, department, city, name
- Upsert pour éviter les doublons
- Stockage de ~50 000+ établissements

---

## 🎨 Personnalisation

### Modifier les types d'établissements

Fichier : `src/app/components/Filters.tsx`

```typescript
const TYPES = [
  { value: '', label: 'Tous', emoji: '🍽️' },
  { value: 'restaurant', label: 'Restaurants', emoji: '🍴' },
  // Ajoutez vos types ici
];
```

### Modifier le nombre de résultats par page

Fichier : `src/app/page.tsx`

```typescript
useRestaurantSearch({
  // ...
  limit: 50, // Au lieu de 20
});
```

### Changer le style de la carte

Fichier : `src/app/components/MapView.tsx`

```typescript
style: 'https://votre-style-maplibre.json',
```

---

## 📚 Documentation complète

- `README.md` - Vue d'ensemble du projet
- `MIGRATION_MYSQL.md` - Guide de migration détaillé
- `DOCUMENTATION.md` - Architecture technique
- `EXAMPLES.md` - Exemples d'utilisation

---

## 🎉 C'est parti !

Votre application est prête. Lancez simplement :

```bash
npm run dev
```

Puis ouvrez **http://localhost:3000** et cliquez sur "Mettre à jour depuis l'API" !

---

**Bon développement ! 🚀**


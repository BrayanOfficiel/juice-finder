# 🚀 Guide de Migration vers MySQL - Juice Finder France

## 📋 Ce qui a changé

### ✅ Nouvelle architecture
- **Base de données MySQL** : Tous les restaurants sont stockés localement
- **Synchronisation API** : Bouton pour mettre à jour depuis OpenDataSoft
- **Performance améliorée** : Recherche instantanée dans la base locale
- **Autonomie** : Ne dépend plus de l'API externe en temps réel

### 🔧 Stack mise à jour
- Next.js 14 (App Router)
- TypeScript
- **Prisma ORM** ⬅️ NOUVEAU
- **MySQL / MariaDB** ⬅️ NOUVEAU
- TailwindCSS
- TanStack Query
- MapLibre GL JS

---

## 🛠️ Installation (Étape par étape)

### 1️⃣ Prérequis

**MySQL doit être installé et démarré.**

Vous pouvez utiliser :
- **MAMP** (déjà installé chez vous ✅)
- **XAMPP**
- **MySQL Community Server**
- **Docker** : `docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8`

**Vérification :**
```bash
mysql --version
```

### 2️⃣ Installation des dépendances

```bash
cd /Users/brayan/Sites/juice-finder
npm install
```

Les nouvelles dépendances installées :
- `prisma` - CLI Prisma
- `@prisma/client` - Client Prisma pour Node.js

### 3️⃣ Configuration de la base de données

**Option A : Script automatique (recommandé)**
```bash
./setup-database.sh
```

Ce script va :
1. Créer la base `juice_finder`
2. Configurer le fichier `.env`
3. Générer le client Prisma
4. Créer les tables

**Option B : Configuration manuelle**

1. **Créer la base de données :**
```bash
# Via MySQL CLI
mysql -u root -p
CREATE DATABASE juice_finder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

2. **Configurer `.env` :**
```env
DATABASE_URL="mysql://root:@localhost:3306/juice_finder"
```
*(Ajustez user/password selon votre config)*

3. **Générer Prisma Client :**
```bash
npx prisma generate
```

4. **Créer les tables :**
```bash
npx prisma migrate dev --name init
```

### 4️⃣ Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

### 5️⃣ Synchroniser les données

**IMPORTANT :** La base est vide au départ !

1. **Ouvrir l'application** dans le navigateur
2. **Cliquer sur le bouton bleu en bas à droite** : "Mettre à jour depuis l'API"
3. **Attendre la synchronisation** (5-10 minutes pour récupérer tous les établissements)
4. **Voir les statistiques** : Nombre de restaurants synchronisés

---

## 🗃️ Structure de la base de données

### Table `restaurants`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT | Clé primaire auto-incrémentée |
| `name` | VARCHAR(500) | Nom de l'établissement |
| `type` | VARCHAR(100) | Type (restaurant, bar, cafe, etc.) |
| `phone` | VARCHAR(50) | Téléphone |
| `website` | VARCHAR(500) | Site web |
| `email` | VARCHAR(255) | Email |
| `cuisine` | VARCHAR(200) | Type de cuisine |
| `street` | VARCHAR(500) | Rue |
| `housenumber` | VARCHAR(50) | Numéro de rue |
| `postcode` | VARCHAR(20) | Code postal |
| `city` | VARCHAR(255) | Ville |
| `department` | VARCHAR(255) | Département |
| `region` | VARCHAR(255) | Région |
| `lat` | FLOAT | Latitude |
| `lon` | FLOAT | Longitude |
| `meta_osm_id` | VARCHAR(100) | ID OpenStreetMap (unique) |
| `meta_osm_type` | VARCHAR(50) | Type OSM |
| `opening_hours` | TEXT | Horaires d'ouverture |
| `wheelchair` | VARCHAR(20) | Accessibilité PMR |
| `delivery` | VARCHAR(20) | Livraison |
| `takeaway` | VARCHAR(20) | À emporter |
| `outdoor_seating` | VARCHAR(20) | Terrasse |
| `last_update` | DATETIME | Dernière mise à jour |
| `created_at` | DATETIME | Date de création |

**Index créés sur :** `type`, `region`, `department`, `city`, `name`

---

## 🔄 API Routes (Next.js)

### GET `/api/restaurants`

Récupère les restaurants depuis la base MySQL.

**Paramètres :**
- `search` : Recherche textuelle dans le nom
- `type` : Filtre par type (restaurant, bar, cafe, etc.)
- `region` : Filtre par région
- `department` : Filtre par département
- `limit` : Nombre de résultats (défaut: 20)
- `offset` : Pagination (défaut: 0)

**Exemple :**
```
GET /api/restaurants?search=pizza&type=restaurant&region=Île-de-France&limit=50
```

**Réponse :**
```json
{
  "total_count": 1234,
  "results": [
    {
      "id": "1",
      "name": "Pizza Luigi",
      "type": "restaurant",
      "city": "Paris",
      ...
    }
  ]
}
```

### GET `/api/regions`

Récupère la liste unique des régions depuis la base.

**Réponse :**
```json
{
  "regions": [
    "Auvergne-Rhône-Alpes",
    "Bretagne",
    "Île-de-France",
    ...
  ],
  "count": 13
}
```

### POST `/api/restaurants/update`

Synchronise la base avec l'API OpenDataSoft.

**⚠️ Attention :** Cette opération peut prendre 5-10 minutes !

**Réponse :**
```json
{
  "success": true,
  "message": "Synchronisation réussie",
  "stats": {
    "fetched": 50000,
    "updated": 50000,
    "total": 50000
  }
}
```

---

## 🎨 Nouveau composant : UpdateButton

Le bouton de synchronisation s'affiche en **bas à droite** de la page.

**Fonctionnalités :**
- ✅ Affiche un loader pendant la synchronisation
- ✅ Affiche les statistiques après sync
- ✅ Gère les erreurs avec messages clairs
- ✅ Timeout de 10 minutes

---

## 🚀 Avantages de cette nouvelle architecture

### ⚡ Performance
- **Recherche instantanée** : Pas d'attente API
- **Pagination rapide** : Requêtes MySQL optimisées
- **Filtres réactifs** : Index sur les colonnes principales

### 🔒 Fiabilité
- **Autonomie** : Ne dépend plus de la disponibilité de l'API
- **Pas de rate limiting** : Toutes les données sont locales
- **Contrôle total** : Vous gérez vos données

### 📊 Scalabilité
- **Ajout de champs** : Facile avec Prisma
- **Caching** : Possible avec Redis
- **Analytics** : Requêtes SQL personnalisées

### 🛠️ Maintenabilité
- **Prisma Studio** : Interface graphique pour voir les données
- **Migrations** : Évolution du schéma versionnée
- **Backup** : Dump MySQL standard

---

## 🧪 Commandes Prisma utiles

### Générer le client
```bash
npx prisma generate
```

### Créer une migration
```bash
npx prisma migrate dev --name nom_migration
```

### Appliquer les migrations en production
```bash
npx prisma migrate deploy
```

### Ouvrir Prisma Studio (interface graphique)
```bash
npx prisma studio
```

### Réinitialiser la base (⚠️ Efface tout)
```bash
npx prisma migrate reset
```

### Voir le schéma
```bash
npx prisma db pull
```

---

## 🔧 Résolution de problèmes

### Problème : "Can't connect to MySQL server"

**Solutions :**
1. Vérifier que MySQL est démarré (MAMP/XAMPP)
2. Vérifier le port (3306 par défaut)
3. Tester la connexion :
```bash
mysql -u root -p -h localhost -P 3306
```

### Problème : "Table doesn't exist"

**Solution :**
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Problème : "Prisma Client not generated"

**Solution :**
```bash
npx prisma generate
```

### Problème : Synchronisation trop longue

**Normal !** La première synchronisation récupère ~50 000+ établissements.

**Suivez la progression** dans la console du terminal :
```bash
npm run dev
# Dans un autre terminal :
tail -f .next/server.log
```

### Problème : "Out of memory" pendant la sync

**Solution :**
Augmenter la limite Node.js :
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

---

## 📊 Monitoring

### Voir le nombre de restaurants en base
```bash
mysql -u root juice_finder -e "SELECT COUNT(*) as total FROM restaurants;"
```

### Voir la répartition par type
```bash
mysql -u root juice_finder -e "SELECT type, COUNT(*) as count FROM restaurants GROUP BY type ORDER BY count DESC;"
```

### Voir la répartition par région
```bash
mysql -u root juice_finder -e "SELECT region, COUNT(*) as count FROM restaurants GROUP BY region ORDER BY count DESC;"
```

### Taille de la base
```bash
mysql -u root juice_finder -e "SELECT table_name AS 'Table', ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)' FROM information_schema.TABLES WHERE table_schema = 'juice_finder';"
```

---

## 🎯 Prochaines étapes

### Court terme
- [x] ✅ Migration vers MySQL
- [x] ✅ API Next.js avec Prisma
- [x] ✅ Synchronisation depuis OpenDataSoft
- [x] ✅ Bouton de mise à jour
- [ ] Tâche CRON pour sync automatique hebdomadaire

### Moyen terme
- [ ] Cache Redis pour les recherches fréquentes
- [ ] Export CSV depuis la base
- [ ] Filtres avancés (horaires, accessibilité)
- [ ] Statistiques et analytics

### Long terme
- [ ] API publique pour les développeurs
- [ ] Application mobile (React Native)
- [ ] Backend admin pour modération
- [ ] Système de reviews et notes

---

## 📞 Support

### Documentation Prisma
- [Documentation officielle](https://www.prisma.io/docs)
- [Guides](https://www.prisma.io/docs/guides)

### Documentation MySQL
- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)

### Fichiers de documentation du projet
- `README.md` - Vue d'ensemble
- `DOCUMENTATION.md` - Architecture technique
- `MIGRATION_MYSQL.md` - Ce fichier

---

## ✅ Checklist de migration

- [ ] MySQL installé et démarré
- [ ] Base de données `juice_finder` créée
- [ ] Fichier `.env` configuré
- [ ] Prisma Client généré
- [ ] Tables créées (migration)
- [ ] Application démarrée (`npm run dev`)
- [ ] Première synchronisation lancée
- [ ] Données visibles dans l'interface
- [ ] Recherche fonctionnelle
- [ ] Filtres fonctionnels
- [ ] Carte affichant tous les markers

---

**🎉 Félicitations ! Vous avez migré vers l'architecture MySQL avec succès !**

*Dernière mise à jour : 11 novembre 2025*


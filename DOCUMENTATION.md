# 📚 Documentation Technique - Juice Finder France

## Architecture de l'application

### Vue d'ensemble

```
┌─────────────────────────────────────────┐
│          Client (Browser)               │
│  ┌───────────────────────────────────┐  │
│  │    Next.js 14 (App Router)        │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   React Components          │  │  │
│  │  │  - SearchBar                │  │  │
│  │  │  - Filters                  │  │  │
│  │  │  - MapView (MapLibre)       │  │  │
│  │  │  - ResultsList              │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   TanStack Query            │  │  │
│  │  │  - Cache management         │  │  │
│  │  │  - Infinite pagination      │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │
                 │ HTTP Requests (Axios)
                 │
                 ▼
┌─────────────────────────────────────────┐
│   API OpenDataSoft                      │
│   (OpenStreetMap Data)                  │
└─────────────────────────────────────────┘
```

## Flux de données

### 1. Recherche d'établissements

```typescript
User Input → SearchBar → debounce(300ms) → setSearchTerm
                                              ↓
                                    useRestaurantSearch
                                              ↓
                                    TanStack Query (cache check)
                                              ↓
                                    fetchRestaurants (API call)
                                              ↓
                                    Results → MapView + ResultsList
```

### 2. Filtrage

```typescript
User clicks filter → setFilters → useRestaurantSearch (new query)
                                         ↓
                                   Cache invalidation
                                         ↓
                                   New API call with filters
                                         ↓
                                   Updated results
```

### 3. Pagination infinie

```typescript
User scrolls to bottom → IntersectionObserver triggers
                                ↓
                          fetchNextPage()
                                ↓
                    TanStack Query loads next page
                                ↓
                      Append to existing results
```

## Composants clés

### SearchBar.tsx

**Responsabilités:**
- Capture de l'input utilisateur
- Debounce de 300ms pour optimiser les appels API
- Bouton de réinitialisation

**Props:**
```typescript
interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}
```

**Optimisations:**
- `useEffect` avec debounce pour éviter trop d'appels
- Gestion d'état local pour la réactivité instantanée

---

### Filters.tsx

**Responsabilités:**
- Filtrage par type (restaurant, bar, café, etc.)
- Sélection de région et département
- Export CSV des résultats
- Réinitialisation des filtres

**Props:**
```typescript
interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  restaurants: Restaurant[];
  totalCount: number;
}
```

**Fonctionnalités:**
- Toggle mobile pour économiser l'espace
- Chargement dynamique des régions depuis l'API
- Compteur de résultats en temps réel

---

### MapView.tsx

**Responsabilités:**
- Affichage de la carte avec MapLibre GL JS
- Placement des markers selon les coordonnées
- Gestion des popups
- Zoom automatique sur les résultats

**Props:**
```typescript
interface MapViewProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant;
  onRestaurantSelect: (restaurant: Restaurant) => void;
}
```

**Optimisations:**
- Nettoyage des anciens markers avant d'en créer de nouveaux
- `useEffect` pour la synchronisation carte ↔ sélection
- Fonction globale `window.selectRestaurant` pour les popups

**Icônes des markers:**
- 🍴 Restaurant
- 🍺 Bar
- ☕ Café
- 🍔 Fast Food
- 🍻 Pub
- 📍 Autre

---

### ResultsList.tsx

**Responsabilités:**
- Affichage de la liste des établissements
- Pagination infinie avec IntersectionObserver
- Gestion des états (loading, error, empty)

**Props:**
```typescript
interface ResultsListProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  selectedRestaurantId?: string;
}
```

---

### RestaurantCard.tsx

**Responsabilités:**
- Affichage détaillé d'un établissement
- Actions rapides (copier tél, appeler, site web)
- Badges (livraison, à emporter, PMR)

**Fonctionnalités:**
- Copie du numéro dans le presse-papier
- Lien direct `tel:` pour les appels
- Liens vers site web et OpenStreetMap
- Indication visuelle de sélection

---

## Hooks personnalisés

### useRestaurantSearch

**Fichier:** `src/hooks/useRestaurantSearch.ts`

**Utilisation:**
```typescript
const {
  data,                 // Pages de résultats
  isLoading,            // Premier chargement
  isFetchingNextPage,   // Chargement page suivante
  hasNextPage,          // Y a-t-il une page suivante ?
  fetchNextPage,        // Fonction pour charger la page suivante
} = useRestaurantSearch({
  searchTerm: 'pizza',
  type: 'restaurant',
  region: 'Île-de-France',
  limit: 20,
});
```

**Configuration du cache:**
- `staleTime`: 5 minutes
- `retry`: 2 tentatives
- `refetchOnWindowFocus`: désactivé

---

## API et types

### Endpoints utilisés

1. **Recherche d'établissements**
```
GET /api/explore/v2.1/catalog/datasets/osm-france-food-service/records
Params: limit, offset, where, q, order_by
```

2. **Liste des régions**
```
GET /api/explore/v2.1/catalog/datasets/osm-france-food-service/records
Params: select=region, group_by=region, limit=100
```

### Types principaux

```typescript
interface Restaurant {
  id: string;
  name: string;
  type: string;
  cuisine?: string;
  phone?: string;
  website?: string;
  email?: string;
  street?: string;
  city?: string;
  region?: string;
  department?: string;
  meta_geo_point?: GeoPoint;
  // ... autres champs
}

interface ApiResponse {
  total_count: number;
  results: Restaurant[];
}
```

---

## Utilitaires

### Fonctions de formatage

**`formatPhoneNumber(phone: string)`**
- Formate les numéros français (ex: 01 23 45 67 89)
- Gère les numéros à 9 et 10 chiffres

**`formatAddress(restaurant: Restaurant)`**
- Combine rue, code postal et ville
- Retourne une adresse complète

**`translateType(type: string)`**
- Traduit les types anglais en français
- Ex: "fast_food" → "Fast Food"

**`exportToCSV(restaurants: Restaurant[])`**
- Génère un fichier CSV avec encodage UTF-8 BOM
- Colonnes: Nom, Type, Téléphone, Adresse, etc.
- Nom du fichier: `juice-finder-export-YYYY-MM-DD.csv`

---

## Performance et optimisation

### Cache Strategy

1. **TanStack Query Cache**
   - 5 minutes de `staleTime` pour les recherches
   - 1 heure pour les régions/départements
   - Invalidation automatique lors du changement de filtres

2. **Debounce**
   - 300ms sur la recherche textuelle
   - Évite les appels API excessifs

3. **Pagination infinie**
   - Chargement par lots de 20 résultats
   - Intersection Observer pour détecter le scroll
   - Pas de rechargement des pages déjà chargées

### Optimisations MapLibre

- Nettoyage systématique des markers avant mise à jour
- Clustering automatique pour grandes quantités de markers
- Bounds fitting pour afficher tous les résultats

---

## Gestion des erreurs

### Niveaux d'erreur

1. **Erreurs API (axios)**
   ```typescript
   - Error 4xx/5xx: Affichage du message d'erreur
   - Timeout: Message de connexion
   - Network error: Message de vérification internet
   ```

2. **Retry automatique**
   - 2 tentatives automatiques
   - Backoff exponentiel

3. **Fallbacks**
   - Régions: tableau vide si échec
   - Départements: tableau vide si échec
   - Affichage d'un message utilisateur clair

---

## Variables d'environnement

Aucune variable d'environnement requise ! L'API OpenDataSoft est publique.

**Optionnel (pour personnaliser):**
```env
NEXT_PUBLIC_API_BASE_URL=https://public.opendatasoft.com/api/explore/v2.1
```

---

## Tests recommandés

### Tests unitaires
- [ ] Formatage des numéros de téléphone
- [ ] Formatage des adresses
- [ ] Export CSV
- [ ] Debounce de recherche

### Tests d'intégration
- [ ] Recherche avec différents critères
- [ ] Pagination infinie
- [ ] Filtrage par type/région
- [ ] Sélection d'un établissement

### Tests E2E
- [ ] Parcours complet utilisateur
- [ ] Export CSV avec données réelles
- [ ] Responsive (mobile/desktop)

---

## Améliorations futures

### Fonctionnalités
- [ ] Géolocalisation "Autour de moi"
- [ ] Favoris (localStorage)
- [ ] Partage de recherche (URL params)
- [ ] Mode sombre
- [ ] Filtres avancés (horaires, accessibilité)
- [ ] Notifications toast

### Technique
- [ ] Tests automatisés (Jest, React Testing Library)
- [ ] Storybook pour les composants
- [ ] Monitoring (Sentry)
- [ ] Analytics (Plausible ou GA4)
- [ ] PWA (Progressive Web App)
- [ ] i18n (internationalisation)

---

## Ressources

- **API Documentation:** https://public.opendatasoft.com/explore/dataset/osm-france-food-service
- **MapLibre GL JS:** https://maplibre.org/maplibre-gl-js-docs/api/
- **TanStack Query:** https://tanstack.com/query/latest
- **Next.js 14:** https://nextjs.org/docs
- **OpenStreetMap:** https://www.openstreetmap.org/

---

**Dernière mise à jour:** 11 novembre 2025


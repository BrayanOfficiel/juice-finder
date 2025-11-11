# 🔍 Exemples d'utilisation de l'API

## Exemples de requêtes OpenDataSoft

### 1. Recherche simple

**Tous les restaurants à Paris:**
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records?where=city='Paris' AND type='restaurant'&limit=20
```

**Tous les bars en Île-de-France:**
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records?where=region='Île-de-France' AND type='bar'&limit=20
```

### 2. Recherche textuelle

**Recherche de "pizza":**
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records?q=pizza&limit=20
```

**Recherche combinée (pizza à Lyon):**
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records?q=pizza&where=city='Lyon'&limit=20
```

### 3. Pagination

**Page 1 (résultats 0-19):**
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records?limit=20&offset=0
```

**Page 2 (résultats 20-39):**
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records?limit=20&offset=20
```

### 4. Tri

**Par nom (ordre alphabétique):**
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records?order_by=name&limit=20
```

### 5. Sélection de champs

**Uniquement nom et coordonnées:**
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records?select=name,meta_geo_point&limit=20
```

### 6. Groupement

**Liste des régions:**
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records?select=region&group_by=region&limit=100
```

**Nombre d'établissements par type:**
```
https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records?select=type,count(*)&group_by=type
```

---

## Exemples d'utilisation dans le code

### Hook useRestaurantSearch

```typescript
import { useRestaurantSearch } from '@/hooks/useRestaurantSearch';

function MyComponent() {
  // Recherche simple
  const { data, isLoading } = useRestaurantSearch({
    searchTerm: 'sushi',
    limit: 20,
  });

  // Avec filtres
  const { data: filtered } = useRestaurantSearch({
    searchTerm: 'bar',
    type: 'bar',
    region: 'Provence-Alpes-Côte d\'Azur',
    limit: 20,
  });

  // Avec pagination infinie
  const {
    data: paginated,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRestaurantSearch({
    searchTerm: 'restaurant',
    limit: 10,
  });

  // Charger la page suivante
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Accès aux résultats
  const allResults = paginated?.pages.flatMap(page => page.results) || [];

  return (
    <div>
      {allResults.map(restaurant => (
        <div key={restaurant.id}>{restaurant.name}</div>
      ))}
      {hasNextPage && (
        <button onClick={handleLoadMore}>
          Charger plus
        </button>
      )}
    </div>
  );
}
```

### Appel direct à l'API

```typescript
import { fetchRestaurants } from '@/lib/api';

// Recherche simple
const results = await fetchRestaurants({
  searchTerm: 'café',
  limit: 20,
});

console.log(`${results.total_count} résultats trouvés`);
console.log(results.results); // Tableau de restaurants

// Avec filtres
const filtered = await fetchRestaurants({
  type: 'restaurant',
  region: 'Nouvelle-Aquitaine',
  department: 'Gironde',
  limit: 50,
});

// Gestion d'erreur
try {
  const data = await fetchRestaurants({ searchTerm: 'test' });
} catch (error) {
  console.error('Erreur:', error.message);
}
```

### Fonctions utilitaires

```typescript
import {
  formatPhoneNumber,
  formatAddress,
  translateType,
  exportToCSV,
  copyToClipboard,
} from '@/lib/utils';

// Formatage téléphone
const phone = formatPhoneNumber('0123456789');
// → "01 23 45 67 89"

// Formatage adresse
const address = formatAddress({
  housenumber: '123',
  street: 'Rue de Rivoli',
  postcode: '75001',
  city: 'Paris',
});
// → "123 Rue de Rivoli, 75001 Paris"

// Traduction type
const type = translateType('fast_food');
// → "Fast Food"

// Export CSV
const restaurants = [/* ... */];
exportToCSV(restaurants);
// → Télécharge "juice-finder-export-2025-11-11.csv"

// Copie dans presse-papier
await copyToClipboard('01 23 45 67 89');
```

### Utilisation de MapLibre

```typescript
import maplibregl from 'maplibre-gl';

// Créer une carte
const map = new maplibregl.Map({
  container: containerRef.current,
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [2.3522, 48.8566], // Paris
  zoom: 12,
});

// Ajouter un marker
const marker = new maplibregl.Marker()
  .setLngLat([2.3522, 48.8566])
  .addTo(map);

// Ajouter un popup
const popup = new maplibregl.Popup()
  .setLngLat([2.3522, 48.8566])
  .setHTML('<h3>Restaurant</h3>')
  .addTo(map);

// Voler vers une position
map.flyTo({
  center: [2.3522, 48.8566],
  zoom: 15,
  duration: 2000,
});

// Adapter aux bounds
const bounds = new maplibregl.LngLatBounds();
restaurants.forEach(r => {
  if (r.meta_geo_point) {
    bounds.extend([r.meta_geo_point.lon, r.meta_geo_point.lat]);
  }
});
map.fitBounds(bounds, { padding: 50 });
```

---

## Cas d'usage courants

### 1. Recherche géographique

```typescript
// Restaurants dans un rayon (nécessite calcul côté client)
const parisCenter = { lat: 48.8566, lon: 2.3522 };
const radius = 5; // km

const results = await fetchRestaurants({
  region: 'Île-de-France',
  limit: 100,
});

const nearby = results.results.filter(r => {
  if (!r.meta_geo_point) return false;
  const distance = calculateDistance(
    parisCenter,
    r.meta_geo_point
  );
  return distance <= radius;
});
```

### 2. Recherche multi-critères

```typescript
// Restaurants italiens avec terrasse à Nice
const { data } = useRestaurantSearch({
  searchTerm: 'italien',
  type: 'restaurant',
  city: 'Nice',
  limit: 20,
});

// Filtrage supplémentaire côté client
const withTerrace = data?.pages
  .flatMap(p => p.results)
  .filter(r => r.outdoor_seating === 'yes') || [];
```

### 3. Agrégation de données

```typescript
// Statistiques par type
const allTypes = await fetchRestaurants({ limit: 1000 });

const stats = allTypes.results.reduce((acc, r) => {
  acc[r.type] = (acc[r.type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log(stats);
// { restaurant: 450, bar: 230, cafe: 180, ... }
```

### 4. Export personnalisé

```typescript
// Export avec filtres spécifiques
const restaurants = await fetchRestaurants({
  type: 'restaurant',
  region: 'Bretagne',
  limit: 200,
});

// Filtrage supplémentaire
const withPhone = restaurants.results.filter(r => r.phone);

// Export
exportToCSV(withPhone);
```

---

## Astuces et bonnes pratiques

### Optimisation des requêtes

1. **Limiter les résultats**
   ```typescript
   // ✅ Bon
   fetchRestaurants({ limit: 20 })
   
   // ❌ Mauvais (trop de données)
   fetchRestaurants({ limit: 1000 })
   ```

2. **Utiliser le cache**
   ```typescript
   // Le cache TanStack Query évite les appels redondants
   const { data } = useRestaurantSearch({ searchTerm: 'pizza' });
   // Deuxième appel avec mêmes params = pas de requête HTTP
   ```

3. **Pagination progressive**
   ```typescript
   // Charger par petits lots
   { limit: 10, offset: 0 }  // Page 1
   { limit: 10, offset: 10 } // Page 2
   ```

### Gestion d'erreur robuste

```typescript
const { data, isError, error } = useRestaurantSearch({
  searchTerm: 'test',
});

if (isError) {
  // Afficher un message utilisateur clair
  return <ErrorMessage message={error.message} />;
}

if (!data) {
  return <Loader />;
}

// Render normal
```

### Debounce pour la recherche

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedTerm, setDebouncedTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedTerm(searchTerm);
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchTerm]);

// Utiliser debouncedTerm pour la recherche
const { data } = useRestaurantSearch({ searchTerm: debouncedTerm });
```

---

## Limites de l'API

- **Rate limiting:** Pas de limite officielle, mais éviter les requêtes excessives
- **Pagination max:** Pas de limite officielle sur `offset`
- **Filtres complexes:** Les filtres `where` sont limités aux champs indexés
- **Géolocalisation:** Pas de recherche par rayon native (nécessite filtrage client)

---

**Note:** Pour plus d'informations, consultez la documentation officielle OpenDataSoft.


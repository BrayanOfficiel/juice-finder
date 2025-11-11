# 📋 Mapping des champs API OpenDataSoft → Base de données

## 🔗 Structure de l'API OpenDataSoft

L'API OpenDataSoft retourne des données avec une structure spécifique où les informations géographiques sont préfixées par `meta_`.

### ✅ Mapping correct des champs

| Champ API OpenDataSoft | Champ BDD | Type | Description |
|------------------------|-----------|------|-------------|
| `name` | `name` | string | Nom de l'établissement |
| `type` | `type` | string | Type (restaurant, cafe, bar, etc.) |
| `phone` | `phone` | string | Numéro de téléphone |
| `website` | `website` | string | Site web |
| `email` | `email` | string | Email |
| `cuisine` | `cuisine` | string | Type de cuisine (peut être un tableau) |
| `street` | `street` | string | Nom de la rue |
| `housenumber` | `housenumber` | string | Numéro dans la rue |
| **`meta_code_com`** ⭐ | `postcode` | string | **Code postal** (ex: "75001", "13001") |
| `meta_name_com` | `city` | string | Nom de la commune (ex: "Paris 1er Arrondissement") |
| `meta_code_dep` | - | string | Code du département (ex: "75", "13") |
| `meta_name_dep` | `department` | string | Nom du département (ex: "Paris", "Bouches-du-Rhône") |
| `meta_code_reg` | - | string | Code de la région (ex: "11") |
| `meta_name_reg` | `region` | string | Nom de la région (ex: "Île-de-France") |
| `meta_geo_point.lat` | `lat` | float | Latitude |
| `meta_geo_point.lon` | `lon` | float | Longitude |
| `meta_osm_id` | `meta_osm_id` | string | Identifiant unique OpenStreetMap |
| `meta_osm_url` | - | string | URL vers OpenStreetMap |
| `opening_hours` | `opening_hours` | string | Horaires d'ouverture |
| `wheelchair` | `wheelchair` | string | Accessibilité PMR (yes/no) |
| `delivery` | `delivery` | string | Livraison disponible (yes/no) |
| `takeaway` | `takeaway` | string | À emporter disponible (yes/no) |
| `outdoor_seating` | `outdoor_seating` | string | Terrasse disponible (yes/no) |

## ⚠️ Points importants

### 1. Code postal (postcode)
**ATTENTION:** Le champ `postcode` dans l'API OpenDataSoft est rarement rempli !
- ❌ **NE PAS utiliser** : `record.postcode`
- ✅ **UTILISER** : `record.meta_code_com` (code postal de la commune)

```typescript
// ❌ MAUVAIS
postcode: record.postcode

// ✅ BON
postcode: record.meta_code_com || record.postcode || null
```

### 2. Nom de la commune vs ville
- `meta_name_com` contient le nom complet : "Paris 11e Arrondissement", "Marseille 1er Arrondissement"
- C'est ce qui doit être stocké dans le champ `city` de notre BDD

### 3. Cuisine (peut être un tableau)
La cuisine peut être soit une string, soit un tableau de strings :
```typescript
const cuisineStr = record.cuisine 
  ? (Array.isArray(record.cuisine) ? record.cuisine.join(', ') : record.cuisine)
  : null;
```

### 4. Régions DOM-TOM à exclure
Liste des régions à filtrer :
- Guadeloupe
- Martinique
- Guyane
- La Réunion
- Mayotte
- Saint-Pierre-et-Miquelon
- Wallis-et-Futuna
- Polynésie française
- Nouvelle-Calédonie
- Saint-Barthélemy
- Saint-Martin
- Terres australes et antarctiques françaises

## 📝 Exemple de données de l'API

```json
{
  "name": "Enjoy Corsica",
  "type": "fast_food",
  "phone": null,
  "website": null,
  "meta_code_com": "75111",  // ⭐ Code postal à utiliser !
  "meta_name_com": "Paris 11e Arrondissement",
  "meta_code_dep": "75",
  "meta_name_dep": "Paris",
  "meta_code_reg": "11",
  "meta_name_reg": "Île-de-France",
  "meta_geo_point": {
    "lon": 2.37848065434187,
    "lat": 48.8660027719132
  },
  "meta_osm_id": "9006747487",
  "meta_osm_url": "https://www.openstreetmap.org/node/9006747487"
}
```

## 🔧 Fichiers modifiés

Les corrections ont été apportées dans :
1. `/src/app/api/restaurants/import-json/route.ts`
2. `/src/app/api/restaurants/update/route.ts`
3. `/src/app/api/restaurants/test-update/route.ts`

Tous ces fichiers utilisent maintenant correctement `meta_code_com` pour le code postal.


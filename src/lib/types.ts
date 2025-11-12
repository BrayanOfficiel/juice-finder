/**
 * Types TypeScript pour l'application Juice Finder France
 * Basés sur l'API OpenDataSoft OSM France Food Service
 */

export interface GeoPoint {
  lon: number;
  lat: number;
}

export interface Restaurant {
  id: string;
  name: string;
  type: string;
  cuisine?: string;
  phone?: string;
  website?: string;
  email?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  region?: string;
  department?: string;
  opening_hours?: string;
  wheelchair?: string;
  delivery?: string;
  takeaway?: string;
  outdoor_seating?: string;
  meta_geo_point?: GeoPoint;
  osm_id?: string;
  osm_type?: string;
}

export interface ApiResponse {
  total_count: number;
  results: Restaurant[];
}

export interface SearchParams {
  searchTerm?: string;
  type?: string;
  location?: string; // Ville ou département
  arrondissement?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  userLat?: number;
  userLon?: number;
}

export type RestaurantType = 'restaurant' | 'bar' | 'cafe' | 'fast_food' | 'pub' | '';

export type SortBy = 'distance' | 'name' | 'none';

export interface FilterState {
  type: RestaurantType;
  location?: string; // Ville ou département
  arrondissement?: string;
  limit?: number; // Limite du nombre de résultats à récupérer (ex: 100/250/500/1000/2500/5000)
  sortBy?: SortBy; // Tri par distance ou nom
}

export interface Marker {
  id: string;
  coordinates: [number, number];
  restaurant: Restaurant;
}

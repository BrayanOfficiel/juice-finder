/**
 * Fonctions pour interagir avec notre API Next.js (base MySQL)
 */

import axios from 'axios';
import type { ApiResponse, SearchParams } from './types';

/**
 * Récupère les restaurants depuis notre API interne (base MySQL)
 */
export async function fetchRestaurants(params: SearchParams): Promise<ApiResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.searchTerm) queryParams.append('search', params.searchTerm);
    if (params.type) queryParams.append('type', params.type);
    if (params.region) queryParams.append('region', params.region);
    if (params.department) queryParams.append('department', params.department);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.userLat) queryParams.append('userLat', params.userLat.toString());
    if (params.userLon) queryParams.append('userLon', params.userLon.toString());
    
    const url = `/api/restaurants?${queryParams.toString()}`;
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000,
    });
    
    return {
      total_count: response.data.total_count || 0,
      results: response.data.results || [],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`Erreur API (${error.response.status}): ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Impossible de contacter l\'API. Vérifiez votre connexion internet.');
      }
    }
    
    throw new Error('Une erreur inattendue s\'est produite lors de la recherche.');
  }
}

/**
 * Récupère les régions disponibles depuis notre API interne
 */
export async function fetchRegions(): Promise<string[]> {
  try {
    const response = await axios.get('/api/regions');
    return response.data.regions || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des régions:', error);
    return [];
  }
}

/**
 * Récupère les départements disponibles pour une région
 */
export async function fetchDepartments(region?: string): Promise<string[]> {
  try {
    const queryParams = new URLSearchParams();
    if (region) queryParams.append('region', region);
    
    const response = await axios.get(`/api/restaurants?${queryParams.toString()}`);
    
    // Extraction des départements uniques
    const departments = new Set<string>();
    response.data.results.forEach((restaurant: { department?: string }) => {
      if (restaurant.department) {
        departments.add(restaurant.department);
      }
    });
    
    return Array.from(departments).sort();
  } catch (error) {
    console.error('Erreur lors de la récupération des départements:', error);
    return [];
  }
}


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
    if (params.location) queryParams.append('location', params.location);
    if (params.arrondissement) queryParams.append('arrondissement', params.arrondissement);
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
 * Récupère les localisations disponibles (villes + départements fusionnés) depuis notre API interne
 */
export async function fetchLocations(): Promise<string[]> {
  try {
    const response = await axios.get('/api/locations');
    return response.data.locations || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des localisations:', error);
    return [];
  }
}

/**
 * Récupère les arrondissements disponibles depuis notre API interne
 */
export async function fetchArrondissements(): Promise<string[]> {
  try {
    const response = await axios.get('/api/arrondissements');
    return response.data.arrondissements || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des arrondissements:', error);
    return [];
  }
}

/**
 * Récupère les villes disponibles depuis notre API interne
 */
export async function fetchCities(): Promise<string[]> {
  try {
    const response = await axios.get('/api/cities');
    return response.data.cities || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des villes:', error);
    return [];
  }
}

/**
 * Récupère les départements disponibles depuis notre API interne
 */
export async function fetchDepartments(): Promise<string[]> {
  try {
    const response = await axios.get('/api/departments');
    return response.data.departments || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des départements:', error);
    return [];
  }
}


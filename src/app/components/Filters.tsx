/**
 * Composant Filters - Filtres de recherche (type, localisation, arrondissement, export)
 */

'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faChevronDown, 
  faDownload, 
  faRotateRight, 
  faCircleInfo,
  faUtensils,
  faBurger,
  faMugHot,
  faBeerMugEmpty,
  faWineGlass
} from '@fortawesome/free-solid-svg-icons';
import type { RestaurantType, FilterState, Restaurant } from '@/lib/types';
import { exportToCSV } from '@/lib/utils';
import { useLocations, useArrondissements } from '@/hooks/useRestaurantSearch';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  restaurants: Restaurant[];
  totalCount: number;
}

const TYPES: { value: RestaurantType; label: string; icon: IconDefinition }[] = [
  { value: '', label: 'Tous', icon: faUtensils },
  { value: 'restaurant', label: 'Restaurants', icon: faUtensils },
  { value: 'bar', label: 'Bars', icon: faWineGlass },
  { value: 'cafe', label: 'Cafés', icon: faMugHot },
  { value: 'fast_food', label: 'Fast Food', icon: faBurger },
  { value: 'pub', label: 'Pubs', icon: faBeerMugEmpty },
];

// Les 10 plus grandes villes de France par ordre de population
// + leurs départements car certaines n'apparaissent que comme département
const TOP_LOCATIONS = [
  'Paris',
  'Marseille',
  'Bouches-du-Rhône', // Pour Marseille
  'Lyon',
  'Rhône', // Pour Lyon
  'Toulouse',
  'Haute-Garonne', // Pour Toulouse
  'Nice',
  'Alpes-Maritimes', // Pour Nice
  'Nantes',
  'Loire-Atlantique', // Pour Nantes
  'Montpellier',
  'Hérault', // Pour Montpellier
  'Strasbourg',
  'Bas-Rhin', // Pour Strasbourg
  'Bordeaux',
  'Gironde', // Pour Bordeaux
  'Lille',
  'Nord', // Pour Lille
];

export default function Filters({ filters, onFilterChange, restaurants, totalCount }: FiltersProps) {
  const { data: locations = [] } = useLocations();
  const { data: allArrondissements = [] } = useArrondissements();
  const [showFilters, setShowFilters] = useState(false);

  // Séparer les grandes villes du reste
  const topLocationsAvailable = TOP_LOCATIONS.filter(loc => locations.includes(loc));
  const otherLocations = locations.filter(loc => !TOP_LOCATIONS.includes(loc));
  
  // Filtrer les arrondissements pour la localisation sélectionnée
  const filteredArrondissements = filters.location 
    ? allArrondissements.filter(arr => arr.startsWith(filters.location + ' '))
    : [];

  const handleTypeChange = (type: RestaurantType) => {
    onFilterChange({ ...filters, type });
  };

  const handleLocationChange = (location: string) => {
    // Si on sélectionne une localisation, on désélectionne l'arrondissement
    onFilterChange({ ...filters, location, arrondissement: '' });
  };

  const handleArrondissementChange = (arrondissement: string) => {
    // Si on sélectionne un arrondissement, on garde la localisation pour le contexte
    onFilterChange({ ...filters, arrondissement });
  };

  const handleLimitChange = (limitStr: string) => {
    const limit = parseInt(limitStr, 10);
    onFilterChange({ ...filters, limit });
  };

  const handleSortChange = (sortBy: string) => {
    onFilterChange({ ...filters, sortBy: sortBy as 'distance' | 'name' | 'none' });
  };

  const handleExport = () => {
    exportToCSV(restaurants);
  };

  const handleReset = () => {
    onFilterChange({ type: '', location: '', arrondissement: '', limit: 5000, sortBy: 'none' });
  };

  return (
    <div className="filter-card-dark rounded-lg shadow-sm p-4">
      {/* En-tête avec toggle mobile */}
      <div className="flex items-center justify-start lg:mb-0">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-toggle-mobile lg:hidden"
          aria-label="Toggle filters"
        >
          <FontAwesomeIcon 
            icon={faChevronDown} 
            className={`transition-transform mr-2 ${showFilters ? 'rotate-180' : ''}`}
          />
            Filtres
        </button>
      </div>

      {/* Contenu des filtres */}
      <div className={`space-y-4 ${showFilters ? 'block mt-4' : 'hidden lg:block'}`}>
        {/* Types d'établissements */}
        <div>
          <label className="label-dark">
            Type d&apos;établissement
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeChange(type.value)}
                className={`btn-filter-type ${filters.type === type.value ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={type.icon} className="mr-2" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Localisation, Arrondissement, Tri et Limite */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          <div>
            <label htmlFor="location" className="label-dark">
              Ville / Département
            </label>
            <select
              id="location"
              value={filters.location || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="select"
            >
              <option value="">Toutes les localisations</option>
              {topLocationsAvailable.length > 0 && (
                <>
                  {topLocationsAvailable.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                  <option disabled>──────────</option>
                </>
              )}
              {otherLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="arrondissement" className="label-dark">
              Arrondissement
            </label>
            <select
              id="arrondissement"
              value={filters.arrondissement || ''}
              onChange={(e) => handleArrondissementChange(e.target.value)}
              className="select"
              disabled={!filters.location || filteredArrondissements.length === 0}
            >
              <option value="">
                {!filters.location 
                  ? 'Sélectionnez d\'abord une ville' 
                  : filteredArrondissements.length === 0 
                    ? 'Pas d\'arrondissements'
                    : 'Tous les arrondissements'}
              </option>
              {filteredArrondissements.map((arr) => (
                <option key={arr} value={arr}>
                  {arr.replace(filters.location + ' ', '')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sortBy" className="label-dark">
              Trier par
            </label>
            <select
              id="sortBy"
              value={filters.sortBy || 'none'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="select"
            >
              <option value="none">Sans tri</option>
              <option value="name">Nom (A-Z)</option>
              <option value="distance">Distance (Géoloc)</option>
            </select>
          </div>

          <div>
            <label htmlFor="limit" className="label-dark">
              Limite de résultats
            </label>
            <select
              id="limit"
              value={String(filters.limit ?? 5000)}
              onChange={(e) => handleLimitChange(e.target.value)}
              className="select"
            >
              {[100, 250, 500, 1000, 2500, 5000].map((opt) => (
                <option key={opt} value={opt}>{opt.toLocaleString('fr-FR')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Message info géolocalisation */}
        {filters.sortBy === 'distance' && (
          <div className="text-xs p-3 rounded-lg bg-info-box">
            <div className="flex items-start gap-2">
              <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Le tri par distance utilise votre position actuelle. Autorisez la géolocalisation dans votre navigateur pour des résultats précis.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={handleExport}
            disabled={restaurants.length === 0}
            className="btn-export disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
            Exporter CSV
          </button>

          <button
            onClick={handleReset}
            className="btn-reset"
          >
            <FontAwesomeIcon icon={faRotateRight} className="h-4 w-4" />
            Réinitialiser
          </button>

          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700 m-0">Filtres <span className="text-xs text-gray-500">
              ({totalCount.toLocaleString('fr-FR')} résultat{totalCount > 1 ? 's' : ''})
            </span></h3>
          </div>
        </div>
      </div>
    </div>
  );
}

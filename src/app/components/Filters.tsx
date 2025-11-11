/**
 * Composant Filters - Filtres de recherche (type, région, département, export)
 */

'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faDownload, faRotateRight, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import type { RestaurantType, FilterState, Restaurant } from '@/lib/types';
import { exportToCSV } from '@/lib/utils';
import { useRegions } from '@/hooks/useRestaurantSearch';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  restaurants: Restaurant[];
  totalCount: number;
}

const TYPES: { value: RestaurantType; label: string; emoji: string }[] = [
  { value: '', label: 'Tous', emoji: '🍽️' },
  { value: 'restaurant', label: 'Restaurants', emoji: '🍴' },
  { value: 'bar', label: 'Bars', emoji: '🍺' },
  { value: 'cafe', label: 'Cafés', emoji: '☕' },
  { value: 'fast_food', label: 'Fast Food', emoji: '🍔' },
  { value: 'pub', label: 'Pubs', emoji: '🍻' },
];

export default function Filters({ filters, onFilterChange, restaurants, totalCount }: FiltersProps) {
  const { data: regions = [] } = useRegions();
  const [showFilters, setShowFilters] = useState(false);

  const handleTypeChange = (type: RestaurantType) => {
    onFilterChange({ ...filters, type });
  };

  const handleRegionChange = (region: string) => {
    onFilterChange({ ...filters, region, department: '' });
  };

  const handleDepartmentChange = (department: string) => {
    onFilterChange({ ...filters, department });
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
    onFilterChange({ type: '', region: '', department: '', limit: 5000, sortBy: 'none' });
  };

  return (
    <div className="filter-card-dark rounded-lg shadow-sm p-4">
      {/* En-tête avec toggle mobile */}
      <div className="flex items-center justify-start lg:mb-0">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full text-start"
          style={{ color: 'var(--color-text)' }}
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
          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Type d&apos;établissement
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeChange(type.value)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  filters.type === type.value
                    ? 'text-white border-blue-600'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                style={{
                  backgroundColor: filters.type === type.value ? 'var(--color-primary)' : 'var(--color-surface-dark-3)',
                  color: filters.type === type.value ? '#fff' : 'var(--color-text)',
                  borderColor: filters.type === type.value ? 'var(--color-primary)' : 'var(--color-surface-outline)'
                }}
              >
                <span className="mr-1">{type.emoji}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Région, Département, Tri et Limite */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          <div>
            <label htmlFor="region" className="block text-xs font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              Région
            </label>
            <select
              id="region"
              value={filters.region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="select"
            >
              <option value="">Toutes les régions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="department" className="block text-xs font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              Département
            </label>
            <input
              type="text"
              id="department"
              value={filters.department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              placeholder="Ex: Paris, Bouches-du-Rhône"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-xs font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
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
            <label htmlFor="limit" className="block text-xs font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
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
          <div className="text-xs p-3 rounded-lg" style={{ 
            backgroundColor: 'rgba(40, 83, 254, 0.1)', 
            border: '1px solid rgba(40, 83, 254, 0.3)',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: restaurants.length === 0 ? 'var(--color-surface-dark-3)' : 'var(--color-success)',
              color: restaurants.length === 0 ? 'rgba(255,255,255,0.4)' : 'var(--color-secondary)',
              opacity: restaurants.length === 0 ? 0.5 : 1
            }}
          >
            <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
            Exporter CSV
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-dark-3)',
              color: 'var(--color-text)',
              borderColor: 'var(--color-surface-outline)'
            }}
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

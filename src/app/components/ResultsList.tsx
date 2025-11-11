/**
 * Composant ResultsList - Liste des résultats avec pagination
 */

'use client';

import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceFrown } from '@fortawesome/free-solid-svg-icons';
import type { Restaurant } from '@/lib/types';
import RestaurantCard from './RestaurantCard';
import Loader from './Loader';

interface ResultsListProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  selectedRestaurantId?: string;
  userLocation?: { lat: number; lon: number } | null;
  sortBy?: string;
}

export default function ResultsList({
  restaurants,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onSelectRestaurant,
  selectedRestaurantId,
  userLocation,
  sortBy,
}: ResultsListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fonction de calcul de distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en km
  };

  // Intersection Observer pour la pagination infinie
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return (
      <div className="panel-dark p-8">
        <Loader message="Recherche en cours..." />
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="panel-dark p-8">
        <div className="text-center">
          <FontAwesomeIcon 
            icon={faFaceFrown} 
            className="mx-auto h-12 w-12"
            style={{ color: 'var(--color-text)' }}
          />
          <h3 className="mt-4 text-lg font-medium text-body">Aucun résultat</h3>
          <p className="mt-2 text-sm text-body" style={{ opacity: 0.8 }}>
            Essayez de modifier vos critères de recherche ou vos filtres.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-body">
          {restaurants.length} établissement{restaurants.length > 1 ? 's' : ''} trouvé{restaurants.length > 1 ? 's' : ''}
        </h2>
      </div>

      {/* Liste des résultats */}
      <div className="grid grid-cols-1 gap-4">
        {restaurants.map((restaurant) => {
          let distance: number | undefined;
          if (sortBy === 'distance' && userLocation && restaurant.meta_geo_point) {
            distance = calculateDistance(
              userLocation.lat,
              userLocation.lon,
              restaurant.meta_geo_point.lat,
              restaurant.meta_geo_point.lon
            );
          }
          
          return (
            <RestaurantCard
              key={restaurant.id || `${restaurant.name}-${restaurant.meta_geo_point?.lat}-${restaurant.meta_geo_point?.lon}`}
              restaurant={restaurant}
              onSelect={() => onSelectRestaurant(restaurant)}
              isSelected={selectedRestaurantId === restaurant.id}
              distance={distance}
              showDistance={sortBy === 'distance'}
            />
          );
        })}
      </div>

      {/* Bouton "Charger plus" / Loader */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="py-8">
          {isFetchingNextPage ? (
            <Loader message="Chargement de plus de résultats..." />
          ) : (
            <button
              onClick={onLoadMore}
              className="btn-secondary w-full"
            >
              Charger plus de résultats
            </button>
          )}
        </div>
      )}

      {/* Message fin de liste */}
      {!hasNextPage && restaurants.length > 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-body" style={{ opacity: 0.8 }}>
            Vous avez atteint la fin des résultats
          </p>
        </div>
      )}
    </div>
  );
}

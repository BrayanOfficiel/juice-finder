/**
 * Page principale - Juice Finder France
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import MapView from './components/MapView';
import ResultsList from './components/ResultsList';
import UpdateButton from './components/UpdateButton';
import { useRestaurantSearch } from '@/hooks/useRestaurantSearch';
import type { FilterState, Restaurant } from '@/lib/types';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: 'restaurant',
    region: '', 
    department: 'Paris', // Par défaut : Paris
    limit: 500, // Limite par défaut
    sortBy: "distance", // Tri par défaut
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | undefined>();
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  // Géolocalisation de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Géolocalisation non disponible:', error);
        }
      );
    }
  }, []);

  // Hook de recherche avec TanStack Query
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRestaurantSearch({
    searchTerm,
    type: filters.type,
    region: filters.region,
    department: filters.department,
    limit: filters.limit ?? 5000,
    sortBy: filters.sortBy,
    userLat: userLocation?.lat,
    userLon: userLocation?.lon,
  });

  // Agrège tous les restaurants des pages (le tri est fait côté serveur)
  const allRestaurants = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.results);
  }, [data]);

  const totalCount = data?.pages[0]?.total_count || 0;

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    
    // Scroll vers la carte sur mobile
    if (window.innerWidth < 1024) {
      const mapElement = document.getElementById('map-container');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Lien d'évitement pour l'accessibilité */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-white border border-gray-300 rounded px-3 py-2 text-sm">
        Aller au contenu
      </a>

      {/* Header */}
      <header role="banner" className="header-gradient header-gradient-border sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-center mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold flex items-center" style={{ color: 'var(--color-text)' }}>
                <Image 
                  src="/assets/img/juice@4x.png" 
                  alt="Juice Finder Logo" 
                  height={40} 
                  width={200} 
                  className="mr-2"
                />
                <span className="logo-finder">FINDER</span>
              </h1>
            </div>
          </div>
          {/* Barre de recherche */}
          <nav aria-label="Recherche">
            <SearchBar onSearch={setSearchTerm} />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main" role="main">
        <div className="container py-6">
          {/* Filtres */}
          <section aria-labelledby="filtres-titre" className="mb-6">
            <h2 id="filtres-titre" className="sr-only">Filtres</h2>
            <Filters
              filters={filters}
              onFilterChange={setFilters}
              restaurants={allRestaurants}
              totalCount={totalCount}
            />
          </section>

          {/* Erreur */}
          {isError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon 
                  icon={faCircleXmark} 
                  className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Erreur lors de la recherche</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {error?.message || 'Une erreur inattendue s\'est produite'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Layout Desktop/Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carte */}
            <aside id="map-container" className="order-1 lg:order-2" role="complementary" aria-label="Carte des restaurants">
              <div className="sticky top-24">
                <MapView
                  restaurants={allRestaurants}
                  selectedRestaurant={selectedRestaurant}
                  onRestaurantSelect={handleSelectRestaurant}
                />
              </div>
            </aside>

            {/* Liste des résultats */}
            <section className="order-2 lg:order-1" aria-labelledby="resultats-titre">
              <h2 id="resultats-titre" className="sr-only">Résultats</h2>
              {(!isLoading && allRestaurants.length === 0) ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-600">Aucun résultat. Modifiez les filtres pour élargir la recherche.</p>
                </div>
              ) : (
                <ResultsList
                  restaurants={allRestaurants}
                  isLoading={isLoading}
                  isFetchingNextPage={isFetchingNextPage}
                  hasNextPage={hasNextPage || false}
                  onLoadMore={fetchNextPage}
                  onSelectRestaurant={handleSelectRestaurant}
                  selectedRestaurantId={selectedRestaurant?.id}
                  userLocation={userLocation}
                  sortBy={filters.sortBy}
                />
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      {/*<footer role="contentinfo" className="bg-white border-t border-gray-200 mt-12">*/}
      {/*  <div className="container py-8">*/}
      {/*    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">*/}
      {/*      <section aria-labelledby="a-propos-titre">*/}
      {/*        <h2 id="a-propos-titre" className="text-sm font-semibold text-gray-900 mb-3">À propos</h2>*/}
      {/*        <p className="text-sm text-gray-600">*/}
      {/*          Juice Finder France vous aide à découvrir des restaurants, bars et cafés */}
      {/*          partout en France grâce aux données ouvertes d&apos;OpenStreetMap.*/}
      {/*        </p>*/}
      {/*      </section>*/}
      {/*      <section aria-labelledby="sources-titre">*/}
      {/*        <h2 id="sources-titre" className="text-sm font-semibold text-gray-900 mb-3">Sources de données</h2>*/}
      {/*        <ul className="space-y-2 text-sm text-gray-600">*/}
      {/*          <li>*/}
      {/*            <a*/}
      {/*              href="https://www.openstreetmap.org/"*/}
      {/*              target="_blank"*/}
      {/*              rel="noopener noreferrer"*/}
      {/*              className="hover:text-blue-600 hover:underline"*/}
      {/*            >*/}
      {/*              © OpenStreetMap contributors*/}
      {/*            </a>*/}
      {/*          </li>*/}
      {/*          <li>*/}
      {/*            <a*/}
      {/*              href="https://public.opendatasoft.com/"*/}
      {/*              target="_blank"*/}
      {/*              rel="noopener noreferrer"*/}
      {/*              className="hover:text-blue-600 hover:underline"*/}
      {/*            >*/}
      {/*              Données OpenDataSoft*/}
      {/*            </a>*/}
      {/*          </li>*/}
      {/*        </ul>*/}
      {/*      </section>*/}
      {/*    </div>*/}
      {/*    <div className="mt-8 pt-6 border-t border-gray-200 text-center">*/}
      {/*      <p className="text-xs text-gray-500">*/}
      {/*        © {new Date().getFullYear()} Juice Finder France. Construit avec Next.js, TypeScript et TanStack Query.*/}
      {/*      </p>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</footer>*/}

      {/* Bouton de mise à jour de la base */}
      {/*<UpdateButton />*/}
    </div>
  );
}

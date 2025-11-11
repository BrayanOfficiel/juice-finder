/**
 * Hook TanStack Query pour la recherche de restaurants
 */

'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchRestaurants, fetchRegions, fetchDepartments } from '@/lib/api';
import type { SearchParams, ApiResponse } from '@/lib/types';

/**
 * Hook pour rechercher des restaurants avec pagination
 */
export function useRestaurantSearch(params: SearchParams) {
  // Si limit > 100, on charge tout d'un coup sans pagination
  const useSimpleQuery = (params.limit || 20) > 100;
  
  const simpleQueryResult = useQuery<ApiResponse, Error>({
    queryKey: ['restaurants-simple', params],
    queryFn: () => fetchRestaurants(params),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: useSimpleQuery,
  });
  
  const infiniteQueryResult = useInfiniteQuery<ApiResponse, Error>({
    queryKey: ['restaurants-infinite', params],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchRestaurants({
        ...params,
        offset: pageParam as number,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.length * (params.limit || 20);
      
      if (currentOffset >= lastPage.total_count) {
        return undefined;
      }
      
      return currentOffset;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !useSimpleQuery,
  });
  
  // Adapter le résultat simple pour correspondre à l'interface infinie
  if (useSimpleQuery) {
    return {
      data: simpleQueryResult.data ? {
        pages: [simpleQueryResult.data],
        pageParams: [0],
      } : undefined,
      isLoading: simpleQueryResult.isLoading,
      isError: simpleQueryResult.isError,
      error: simpleQueryResult.error,
      fetchNextPage: async () => ({ data: undefined, error: null, isError: false, isSuccess: true }),
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: simpleQueryResult.refetch,
    };
  }
  
  return infiniteQueryResult;
}

/**
 * Hook pour récupérer la liste des régions
 */
export function useRegions() {
  return useQuery<string[], Error>({
    queryKey: ['regions'],
    queryFn: fetchRegions,
    staleTime: 1000 * 60 * 60, // Cache de 1 heure
    retry: 2,
  });
}

/**
 * Hook pour récupérer les départements d'une région
 */
export function useDepartments(region?: string) {
  return useQuery<string[], Error>({
    queryKey: ['departments', region],
    queryFn: () => fetchDepartments(region),
    staleTime: 1000 * 60 * 60, // Cache de 1 heure
    enabled: !!region, // Ne s'exécute que si une région est sélectionnée
    retry: 2,
  });
}


/**
 * Composant MapView - Carte interactive avec MapLibre GL JS
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Restaurant } from '@/lib/types';
import {translateType, formatAddress, formatPhoneNumber, getGoogleMapsLink} from '@/lib/utils';

interface MapViewProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant;
  onRestaurantSelect: (restaurant: Restaurant) => void;
  archivedIds?: Set<string>;
  showArchived?: boolean;
}

export default function MapView({ 
  restaurants, 
  selectedRestaurant,
  onRestaurantSelect,
  archivedIds,
  showArchived = true
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
    const LIGHT_FALLBACK = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: DARK_STYLE,
      center: [2.3522, 46.6031], // Centre de la France
      zoom: 5.5,
    });

    map.current.on('error', (e: maplibregl.ErrorEvent) => {
      // Si une erreur de style survient, basculer en fallback clair
      try {
        if (map.current && e?.error) {
          console.warn('Erreur de style de carte, basculement en mode clair', e.error);
          map.current.setStyle(LIGHT_FALLBACK);
        }
      } catch (err) {
        console.error('Erreur lors du changement de style:', err);
      }
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Mise à jour des markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Supprime les anciens markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filtre les restaurants avec coordonnées valides
    const validRestaurants = restaurants.filter(
      r => r.meta_geo_point && 
      !isNaN(r.meta_geo_point.lon) &&
      !isNaN(r.meta_geo_point.lat) &&
      (showArchived || !archivedIds?.has(String(r.id)))
    );

    if (validRestaurants.length === 0) return;

    // Crée les nouveaux markers
    validRestaurants.forEach(restaurant => {
      if (!restaurant.meta_geo_point) return;

      const isArchived = archivedIds?.has(String(restaurant.id)) ?? false;

      // Popup
      const googleMapsUrl = getGoogleMapsLink(restaurant);
      const phoneHref = restaurant.phone ? `tel:${restaurant.phone.replace(/\s/g, '')}` : '';
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 8px 0; color: #111;">
            ${restaurant.name || 'Sans nom'}
          </h3>
          <p style="font-size: 12px; color: #6b7280; margin: 4px 0;">
            ${translateType(restaurant.type)} ${restaurant.street || restaurant.city ? `à ${formatAddress(restaurant)}
          ` : ''}
          </p>
          ${restaurant.phone ? `
            <a href="${phoneHref}" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;width:100%;padding:8px 12px;background:#10b981;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;font-weight:500;text-decoration:none;transition:background .2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
              <i class='fa-solid fa-phone'></i><span>Appeler ${formatPhoneNumber(restaurant.phone)}</span>
            </a>` : ''}
          ${googleMapsUrl ? `
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;width:100%;padding:6px 12px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;font-weight:500;text-align:center;text-decoration:none;">
              <i class='fa-solid fa-map-location-dot'></i><span>Ouvrir dans Google Maps</span>
            </a>` : ''}
          <button onclick="window.selectRestaurant('${(restaurant.id || restaurant.name || '').replace(/'/g, "\\'")}')" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;width:100%;padding:6px 12px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;font-weight:500;">
            <i class='fa-solid fa-circle-info'></i><span>Zoomer</span>
          </button>
        </div>
      `;
      const popup = new maplibregl.Popup({ offset:25, closeButton:true, closeOnClick:false }).setHTML(popupContent);

      if (isArchived) {
        // Marqueur archivé : pin MapLibre jaune uniforme (fill = contour carte resto)
        const marker = new maplibregl.Marker({ color: '#FCD34D' })
          .setLngLat([restaurant.meta_geo_point.lon, restaurant.meta_geo_point.lat])
          .setPopup(popup)
          .addTo(map.current!);
        marker.getElement().style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))';
        marker.getElement().title = 'Archivé';
        marker.getElement().addEventListener('click', () => onRestaurantSelect(restaurant));
        markers.current.push(marker);
      } else {
        // Marqueur normal avec couleur selon type (HTML custom)
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.cursor = 'pointer';
        const getIconClass = (type: string) => {
          switch(type) {
            case 'restaurant': return 'fa-solid fa-utensils';
            case 'bar': return 'fa-solid fa-wine-glass';
            case 'cafe': return 'fa-solid fa-mug-hot';
            case 'fast_food': return 'fa-solid fa-burger';
            case 'pub': return 'fa-solid fa-beer-mug-empty';
            default: return 'fa-solid fa-location-dot';
          }
        };
        const getIconColor = (type: string) => {
          switch(type) {
            case 'restaurant': return '#f59e0b';
            case 'bar': return '#8b5cf6';
            case 'cafe': return '#6366f1';
            case 'fast_food': return '#ef4444';
            case 'pub': return '#10b981';
            default: return '#3b82f6';
          }
        };
        el.innerHTML = `<div style="font-size:20px;text-align:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));"><i class='${getIconClass(restaurant.type)}' style='color:${getIconColor(restaurant.type)};'></i></div>`;
        const marker = new maplibregl.Marker(el)
          .setLngLat([restaurant.meta_geo_point.lon, restaurant.meta_geo_point.lat])
          .setPopup(popup)
          .addTo(map.current!);
        el.addEventListener('click', () => onRestaurantSelect(restaurant));
        markers.current.push(marker);
      }
    });

    // Ajuste la vue pour inclure tous les markers
    if (validRestaurants.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      validRestaurants.forEach(r => {
        if (r.meta_geo_point) {
          bounds.extend([r.meta_geo_point.lon, r.meta_geo_point.lat]);
        }
      });
      
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 14,
        duration: 1000,
      });
    }
  }, [restaurants, mapLoaded, onRestaurantSelect, archivedIds, showArchived]);

  // Centre sur le restaurant sélectionné
  useEffect(() => {
    if (!map.current || !selectedRestaurant?.meta_geo_point) return;

    const { lon, lat } = selectedRestaurant.meta_geo_point;
    
    map.current.flyTo({
      center: [lon, lat],
      zoom: 15,
      duration: 1500,
    });

    // Trouve et ouvre le popup correspondant
    const marker = markers.current.find(m => {
      const lngLat = m.getLngLat();
      return Math.abs(lngLat.lng - lon) < 0.0001 && Math.abs(lngLat.lat - lat) < 0.0001;
    });

    if (marker) {
      marker.togglePopup();
    }
  }, [selectedRestaurant]);

  // Fonction globale pour la sélection depuis le popup
  useEffect(() => {
    interface WindowWithSelectRestaurant extends Window {
      selectRestaurant?: (id: string) => void;
    }
    
    (window as WindowWithSelectRestaurant).selectRestaurant = (id: string) => {
      const restaurant = restaurants.find(r => (r.id || r.name) === id);
      if (restaurant) {
        onRestaurantSelect(restaurant);
      }
    };

    return () => {
      delete (window as WindowWithSelectRestaurant).selectRestaurant;
    };
  }, [restaurants, onRestaurantSelect]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden panel-dark">
      <div ref={mapContainer} className="w-full h-full min-h-[400px] lg:min-h-[600px]" />
      
      {/* Attribution */}
      <div className="absolute bottom-2 left-2 dark-surface-2 px-3 py-1.5 rounded text-xs" style={{opacity:.9}}>
        © OpenStreetMap contributors — Données OpenDataSoft
      </div>
      
      {/* Compteur */}
      {restaurants.length > 0 && (
        <div className="absolute top-2 left-2 dark-surface-2 px-3 py-2 rounded-lg shadow-md" style={{opacity:.95}}>
          <p className="text-sm font-medium flex items-center gap-2" style={{color:'var(--color-text)'}}>
            <i className="fa-solid fa-location-dot"></i>
            <span>{restaurants.filter(r => r.meta_geo_point).length} établissement{restaurants.filter(r => r.meta_geo_point).length > 1 ? 's' : ''}</span>
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Composant RestaurantCard - Carte d'un établissement
 */

'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faPhone,
  faCopy,
  faGlobe, 
  faMapMarkerAlt,
  faArchive
} from '@fortawesome/free-solid-svg-icons';
import type { Restaurant } from '@/lib/types';
import { 
  formatPhoneNumber, 
  formatAddress, 
  translateType, 
  getGoogleMapsLink,
  copyToClipboard 
} from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect?: () => void;
  isSelected?: boolean;
  distance?: number;
  showDistance?: boolean;
  isArchived?: boolean;
  onToggleArchived?: () => void;
}

export default function RestaurantCard({ 
  restaurant, 
  onSelect, 
  isSelected = false,
  distance,
  showDistance = false,
  isArchived = false,
  onToggleArchived
}: RestaurantCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = async () => {
    if (restaurant.phone) {
      const success = await copyToClipboard(restaurant.phone);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleCall = () => {
    if (restaurant.phone) {
      window.location.href = `tel:${restaurant.phone}`;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`restaurant-card restaurant-card--dark ${isSelected ? 'is-selected' : ''} ${isArchived && !isSelected ? 'restaurant-card--archived' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="restaurant-card__title">{restaurant.name || 'Sans nom'}</h3>
          <div className="restaurant-card__meta py-2">
            <span className="badge-type text-xs font-medium">{translateType(restaurant.type)}</span>
            {showDistance && distance !== undefined && (
              <span className="badge-green text-xs font-medium px-2 py-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
              </span>
            )}
          </div>
        </div>
        {onToggleArchived && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleArchived(); }}
            className={`btn-archive ${isArchived ? 'archived' : ''}`}
            title={isArchived ? 'Désarchiver' : 'Archiver'}
            aria-label={isArchived ? 'Désarchiver' : 'Archiver'}
          >
            <FontAwesomeIcon icon={faArchive} className="archive-icon" />
          </button>
        )}
      </div>

      {(restaurant.street || restaurant.city) && (
        <div className="restaurant-card__address mb-2">
          <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4 flex-shrink-0" />
          <span>{formatAddress(restaurant)}</span>
        </div>
      )}

      {restaurant.phone && (
        <div className="restaurant-card__phone mb-2">
          <FontAwesomeIcon icon={faPhone} className="h-4 w-4 flex-shrink-0" />
          <span>{formatPhoneNumber(restaurant.phone)}</span>
          <div className="restaurant-card__actions">
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyPhone(); }}
              className="icon-action"
              title="Copier le numéro"
              aria-label="Copier le numéro"
            >
              <FontAwesomeIcon icon={faCopy} className={copied ? 'text-primary' : ''} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleCall(); }}
              className="icon-action icon-action--success"
              title="Appeler"
              aria-label="Appeler"
            >
              <FontAwesomeIcon icon={faPhone} />
            </button>
          </div>
        </div>
      )}

      <div className="restaurant-card__section flex flex-wrap gap-3">
        {restaurant.website && (
          <a
            href={restaurant.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs link-plain flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faGlobe} className="h-3.5 w-3.5 icon-muted" />
            Site web
          </a>
        )}
        <a
          href={getGoogleMapsLink(restaurant, 'name')}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs link-plain flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5 icon-muted" />
          Google Maps
        </a>
      </div>

      {(restaurant.takeaway || restaurant.delivery || restaurant.wheelchair) && (
        <div className="restaurant-card__section flex flex-wrap gap-2">
          {restaurant.takeaway === 'yes' && (
            <span className="badge-type text-xs inline-flex items-center px-2 py-1 rounded">🥡 À emporter</span>
          )}
          {restaurant.delivery === 'yes' && (
            <span className="badge-type text-xs inline-flex items-center px-2 py-1 rounded">🚚 Livraison</span>
          )}
          {restaurant.wheelchair === 'yes' && (
            <span className="badge-type text-xs inline-flex items-center px-2 py-1 rounded">♿ Accessible PMR</span>
          )}
        </div>
      )}
    </div>
  );
}
// Force reload

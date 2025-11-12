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
  faGlobe
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
}

export default function RestaurantCard({ 
  restaurant, 
  onSelect, 
  isSelected = false,
  distance,
  showDistance = false
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
      className={`restaurant-card restaurant-card--dark ${isSelected ? 'is-selected' : ''}`}
    >
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="restaurant-card__title">
            {restaurant.name || 'Sans nom'}
          </h3>
          <div className="restaurant-card__meta py-2">
            <span className="badge-type text-xs font-medium">
              {translateType(restaurant.type)}
            </span>
            {showDistance && distance !== undefined && (
              <span 
                className="badge-green text-xs font-medium px-2 py-1"
              >
                📍 {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Adresse */}
      {(restaurant.street || restaurant.city) && (
        <div className="restaurant-card__address mb-2">
          <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{formatAddress(restaurant)}</span>
        </div>
      )}

      {/* Téléphone */}
      {restaurant.phone && (
        <div className="flex items-center gap-2 mb-2">
          <FontAwesomeIcon icon={faPhone} className="h-4 w-4 icon-muted flex-shrink-0" />
          <span className="text-sm text-body">{formatPhoneNumber(restaurant.phone)}</span>
          <div className="restaurant-card__actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyPhone();
              }}
              className="restaurant-card__icon-btn action-btn-dark"
              title="Copier le numéro"
            >
              {copied ? (
                <FontAwesomeIcon icon={faCopy} className="h-5 w-5 icon-accent" />
              ) : (
                <FontAwesomeIcon icon={faCopy} className="h-5 w-5 icon-light" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCall();
              }}
              className="restaurant-card__icon-btn restaurant-card__icon-btn--call action-btn-dark action-btn-dark--call"
              title="Appeler"
            >
              <FontAwesomeIcon icon={faPhone} className="h-5 w-5 icon-light" />
            </button>
          </div>
        </div>
      )}

      {/* Informations supplémentaires */}
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

      {/* Badges */}
      {(restaurant.takeaway || restaurant.delivery || restaurant.wheelchair) && (
        <div className="restaurant-card__section flex flex-wrap gap-2">
          {restaurant.takeaway === 'yes' && (
            <span className="badge-type text-xs inline-flex items-center px-2 py-1 rounded">
              🥡 À emporter
            </span>
          )}
          {restaurant.delivery === 'yes' && (
            <span className="badge-type text-xs inline-flex items-center px-2 py-1 rounded">
              🚚 Livraison
            </span>
          )}
          {restaurant.wheelchair === 'yes' && (
            <span className="badge-type text-xs inline-flex items-center px-2 py-1 rounded">
              ♿ Accessible PMR
            </span>
          )}
        </div>
      )}
    </div>
  );
}

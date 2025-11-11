/**
 * Composant SearchBar - Barre de recherche avec debounce
 */

'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = 'Rechercher un restaurant, bar, café...' 
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');

  // Debounce de 300ms sur la recherche
  useEffect(() => {
    const debouncedSearch = debounce((value: string) => {
      onSearch(value);
    }, 300);

    debouncedSearch(inputValue);
  }, [inputValue, onSearch]);

  return (
    <div className="search-bar">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        aria-label="Rechercher"
      />
      {inputValue && (
        <button
          onClick={() => setInputValue('')}
          className="search-clear"
          aria-label="Effacer la recherche"
        >
          <FontAwesomeIcon icon={faCircleXmark} className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

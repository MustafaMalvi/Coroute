import { useState, useRef, useEffect, useId, useCallback } from 'react';
import { fetchLocationSuggestions } from '../utils/mapboxSearch';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

// Wraps the portion of `text` that matches `query` in a highlighted span.
const HighlightedLabel = ({ text, query }) => {
  if (!query) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) return <>{text}</>;

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + query.length);
  const after = text.slice(matchIndex + query.length);

  return (
    <>
      {before}
      <span className="text-marigold-600 font-bold bg-marigold-500/10 rounded-sm">{match}</span>
      {after}
    </>
  );
};

const newSessionToken = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

/**
 * LocationAutocomplete
 *
 * Live area suggestions from the Mapbox Search Box API (biased to Rajkot).
 *
 * Props:
 * - value: string — current input value (controlled)
 * - onChange: (value: string) => void — fired as the user types AND when a suggestion is picked
 * - placeholder: string
 * - dotColor: tailwind text-* class for the pin icon accent (defaults to route)
 * - required: boolean
 * - inputBgClass: tailwind bg-* class for the input surface (defaults to white)
 */
const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = 'Search a location',
  dotColor = 'text-route-500',
  required = false,
  inputBgClass = 'bg-white',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const wrapperRef = useRef(null);
  const listRef = useRef(null);
  const listboxId = useId();
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const sessionTokenRef = useRef(newSessionToken());

  const runSearch = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (!query || query.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      setFetchError(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);
      setFetchError(false);

      try {
        const results = await fetchLocationSuggestions(query, sessionTokenRef.current, { signal: controller.signal });
        setSuggestions(results);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setFetchError(true);
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  // Close the dropdown on any click outside the component.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const selectSuggestion = (suggestion) => {
    onChange(suggestion.fullLabel);
    setIsOpen(false);
    setActiveIndex(-1);
    setSuggestions([]);
    // Start a fresh billing session for the next search, per Mapbox guidance.
    sessionTokenRef.current = newSessionToken();
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Keep the highlighted option scrolled into view during keyboard navigation.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.children[activeIndex];
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const showDropdown = isOpen && (value || '').trim().length >= MIN_QUERY_LENGTH;

  return (
    <div ref={wrapperRef} className="relative">
      <div className={`flex items-center gap-3 ${inputBgClass} rounded-xl border border-ink/10 px-4 py-3 focus-within:ring-2 focus-within:ring-route-500 focus-within:border-route-500 transition-all`}>
        <svg className={`w-4 h-4 flex-shrink-0 ${dotColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={(e) => {
            const newValue = e.target.value;
            onChange(newValue);
            setIsOpen(true);
            setActiveIndex(-1);
            runSearch(newValue);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none text-ink placeholder-ink/35 text-sm font-medium"
        />
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-ink/15 border-t-route-500 rounded-full animate-spin flex-shrink-0"></span>
        )}
      </div>

      {showDropdown && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto bg-white border border-ink/10 rounded-xl shadow-ticket py-1.5 animate-fade-in"
        >
          {suggestions.length === 0 && !isLoading && !fetchError && (
            <li className="px-4 py-3 text-sm text-ink/40">No matching areas found.</li>
          )}
          {fetchError && (
            <li className="px-4 py-3 text-sm text-alert-500">Couldn&apos;t load suggestions — keep typing to enter it manually.</li>
          )}
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                // onMouseDown (not onClick) so the click registers before the input's outside-click logic fires
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(suggestion);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                  index === activeIndex ? 'bg-marigold-50 text-ink' : 'text-ink-600 hover:bg-paper'
                }`}
              >
                <svg className="w-3.5 h-3.5 text-ink/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">
                  <HighlightedLabel text={suggestion.fullLabel} query={value} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;

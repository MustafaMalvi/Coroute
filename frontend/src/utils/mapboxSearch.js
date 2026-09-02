import { MAPBOX_TOKEN, DEFAULT_PROXIMITY } from '../mapboxConfig';

const SUGGEST_URL = 'https://api.mapbox.com/search/searchbox/v1/suggest';
const RETRIEVE_URL = 'https://api.mapbox.com/search/searchbox/v1/retrieve';

/**
 * Fetch place suggestions for the given query, biased around Rajkot.
 * Returns an array of { id, name, placeFormatted, fullLabel } — see
 * mapSuggestion() below. Throws on network/API failure; the caller
 * (LocationAutocomplete) is responsible for catching and degrading
 * gracefully.
 */
export async function fetchLocationSuggestions(query, sessionToken, { signal } = {}) {
  if (!query || query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    access_token: MAPBOX_TOKEN,
    session_token: sessionToken,
    language: 'en',
    country: 'IN',
    proximity: `${DEFAULT_PROXIMITY.lng},${DEFAULT_PROXIMITY.lat}`,
    types: 'place,locality,neighborhood,address,poi,street',
    limit: '6',
  });

  const res = await fetch(`${SUGGEST_URL}?${params.toString()}`, { signal });
  if (!res.ok) {
    throw new Error(`Mapbox suggest request failed (${res.status})`);
  }
  const data = await res.json();
  return (data.suggestions || []).map(mapSuggestion);
}

/**
 * Resolve a suggestion's mapbox_id into full details (coordinates, etc).
 * Only needed if you want lat/lng — plain text selection doesn't require it.
 */
export async function retrieveLocationDetails(mapboxId, sessionToken, { signal } = {}) {
  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    session_token: sessionToken,
  });

  const res = await fetch(`${RETRIEVE_URL}/${mapboxId}?${params.toString()}`, { signal });
  if (!res.ok) {
    throw new Error(`Mapbox retrieve request failed (${res.status})`);
  }
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  return {
    name: feature.properties?.name || '',
    fullLabel: feature.properties?.full_address || feature.properties?.place_formatted || '',
    coordinates: feature.geometry?.coordinates || null, // [lng, lat]
  };
}

function mapSuggestion(s) {
  const name = s.name || '';
  const placeFormatted = s.place_formatted || '';
  return {
    id: s.mapbox_id,
    name,
    placeFormatted,
    // What we actually show/select — "Trikon Baug, Rajkot, Gujarat"
    fullLabel: placeFormatted ? `${name}, ${placeFormatted}` : name,
  };
}

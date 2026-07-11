import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, DEFAULT_PROXIMITY } from '../mapboxConfig';

mapboxgl.accessToken = MAPBOX_TOKEN;

const ROUTE_SOURCE_ID = 'live-route';
const ACCURACY_SOURCE_ID = 'live-accuracy';

const Mapbox = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const routeRef = useRef([]);
  const watchIdRef = useRef(null);

  const [position, setPosition] = useState(null); // [lng, lat]
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [followUser, setFollowUser] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // ── Initialize the map once ──
  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError('Missing Mapbox access token. Set VITE_MAPBOX_TOKEN in your .env file.');
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [DEFAULT_PROXIMITY.lng, DEFAULT_PROXIMITY.lat], // Rajkot, fallback until GPS resolves
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      map.addSource(ROUTE_SOURCE_ID, {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } },
      });
      map.addLayer({
        id: ROUTE_SOURCE_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        paint: {
          'line-color': '#1B8F7A',
          'line-width': 4,
          'line-opacity': 0.7,
        },
      });

      map.addSource(ACCURACY_SOURCE_ID, {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'Point', coordinates: [DEFAULT_PROXIMITY.lng, DEFAULT_PROXIMITY.lat] } },
      });
      map.addLayer({
        id: ACCURACY_SOURCE_ID,
        type: 'circle',
        source: ACCURACY_SOURCE_ID,
        paint: {
          'circle-radius': 0,
          'circle-color': '#1B8F7A',
          'circle-opacity': 0.12,
          'circle-stroke-color': '#1B8F7A',
          'circle-stroke-width': 1,
          'circle-stroke-opacity': 0.4,
        },
      });

      setMapReady(true);
    });

    // If the user drags the map, stop auto-recentering until they ask for it.
    map.on('dragstart', () => setFollowUser(false));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Convert a screen-space metre radius into a Mapbox circle-radius (pixels) at the current zoom/lat ──
  const metresToPixels = useCallback((metres, lat, zoom) => {
    const earthCircumference = 40075017;
    const metresPerPixel = (earthCircumference * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom + 8);
    return metres / metresPerPixel;
  }, []);

  // ── Push new coordinates/accuracy into the live map ──
  const updateMapPosition = useCallback((lngLat, acc) => {
    const map = mapRef.current;
    if (!map || !map.getSource(ROUTE_SOURCE_ID)) return;

    routeRef.current.push(lngLat);
    map.getSource(ROUTE_SOURCE_ID).setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: routeRef.current },
    });

    map.getSource(ACCURACY_SOURCE_ID).setData({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: lngLat },
    });
    if (acc) {
      const radiusPx = metresToPixels(acc, lngLat[1], map.getZoom());
      map.setPaintProperty(ACCURACY_SOURCE_ID, 'circle-radius', radiusPx);
    }

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = 'mapbox-live-marker';
      el.innerHTML = `
        <span class="mapbox-live-marker-ping"></span>
        <span class="mapbox-live-marker-dot"></span>
      `;
      markerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat(lngLat).addTo(map);
    } else {
      markerRef.current.setLngLat(lngLat);
    }
  }, [metresToPixels]);

  // ── Geolocation watch ──
  useEffect(() => {
    if (!mapReady) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please use a modern browser like Chrome or Firefox.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lngLat = [pos.coords.longitude, pos.coords.latitude];
        setPosition(lngLat);
        setAccuracy(pos.coords.accuracy);
        routeRef.current = [lngLat];
        setLastUpdated(new Date());
        mapRef.current?.jumpTo({ center: lngLat, zoom: 17 });
        updateMapPosition(lngLat, pos.coords.accuracy);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lngLat = [pos.coords.longitude, pos.coords.latitude];
        setPosition(lngLat);
        setAccuracy(pos.coords.accuracy);
        setLastUpdated(new Date());
        setError(null);
        updateMapPosition(lngLat, pos.coords.accuracy);

        if (followUser && mapRef.current) {
          mapRef.current.easeTo({ center: lngLat, duration: 800 });
        }
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please allow location access in your browser settings and reload the page.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Make sure GPS/Location Services are enabled on your device.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please ensure you have a clear GPS signal and try again.');
            break;
          default:
            setError(`Unable to get location: ${err.message}`);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, updateMapPosition]);

  const handleRecenter = () => {
    setFollowUser(true);
    if (position && mapRef.current) {
      mapRef.current.easeTo({ center: position, zoom: 17, duration: 600 });
    }
  };

  const formatTime = (date) => {
    if (!date) return '—';
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (error) {
    return (
      <div className="bg-alert-50 text-alert-500 p-6 rounded-xl text-center border border-alert-400/20">
        <div className="text-3xl mb-3">📍</div>
        <p className="font-display text-base mb-1">Location access required</p>
        <p className="text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-alert-400 text-white rounded-lg text-sm font-bold hover:bg-alert-500 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-72 sm:h-[28rem] w-full rounded-2xl overflow-hidden shadow-sm border border-ink/10 z-0">
        <div ref={mapContainerRef} className="h-full w-full" />

        {!position && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/[0.03] backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-route-500 mb-4"></div>
            <p className="font-medium">Acquiring GPS signal...</p>
            <p className="text-ink-600 text-xs mt-2">Please allow location access when prompted</p>
          </div>
        )}

        {position && !followUser && (
          <button onClick={handleRecenter} title="Re-center on my location" className="absolute bottom-4 right-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-ink/5 transition-colors border border-ink/10">
            <svg className="w-5 h-5 text-route-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
          </button>
        )}
      </div>

      {position && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-ink/[0.03] rounded-xl px-4 py-3 border border-ink/10 text-xs font-meter">
          <div className="flex items-center gap-4">
            <span className="text-ink-600">📍 <span className="font-medium text-ink">{position[1].toFixed(6)}, {position[0].toFixed(6)}</span></span>
            {accuracy && (
              <span className="text-ink-600">
                🎯 <span className={`font-semibold ${accuracy <= 50 ? 'text-route-600' : accuracy <= 200 ? 'text-marigold-600' : 'text-alert-500'}`}>±{Math.round(accuracy)}m</span>
              </span>
            )}
          </div>
          <span className="text-ink-400">🕒 {formatTime(lastUpdated)}</span>
        </div>
      )}
    </div>
  );
};

export default Mapbox;

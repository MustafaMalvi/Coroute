import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, DEFAULT_PROXIMITY } from '../mapboxConfig';
import { heading } from '../styles/style';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

mapboxgl.accessToken = MAPBOX_TOKEN;

const ROUTE_SOURCE_ID = 'live-route';
const ACCURACY_SOURCE_ID = 'live-accuracy';
const POLL_INTERVAL_MS = 6000;
const PUSH_INTERVAL_MS = 5000;

const buildMarkerEl = (variant, label) => {
  const el = document.createElement('div');
  el.className = variant === 'other' ? 'mapbox-live-marker mapbox-live-marker--other' : 'mapbox-live-marker';
  el.innerHTML = `
    <span class="mapbox-live-marker-ping"></span>
    <span class="mapbox-live-marker-dot"></span>
    ${label ? `<span class="mapbox-live-marker-label">${label}</span>` : ''}
  `;
  return el;
};

// rideId + role decide what this map shares and who it shows back:
// a host broadcasts to every booked partner and can see any of them sharing
// back; a partner broadcasts to the host and only ever sees the host's pin.
const Mapbox = ({ rideId, otherLabel }) => {
  const { user } = useContext(AuthContext);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const otherMarkersRef = useRef(new Map());
  const routeRef = useRef([]);
  const watchIdRef = useRef(null);
  const lastPushRef = useRef(0);

  const [position, setPosition] = useState(null); // [lng, lat]
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [followUser, setFollowUser] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [others, setOthers] = useState([]);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError('Missing Mapbox access token. Set VITE_MAPBOX_TOKEN in your .env file.');
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [DEFAULT_PROXIMITY.lng, DEFAULT_PROXIMITY.lat],
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
        paint: { 'line-color': '#1B8F7A', 'line-width': 4, 'line-opacity': 0.7 },
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

    map.on('dragstart', () => setFollowUser(false));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const metresToPixels = useCallback((metres, lat, zoom) => {
    const earthCircumference = 40075017;
    const metresPerPixel = (earthCircumference * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom + 8);
    return metres / metresPerPixel;
  }, []);

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
      markerRef.current = new mapboxgl.Marker({ element: buildMarkerEl('self'), anchor: 'center' }).setLngLat(lngLat).addTo(map);
    } else {
      markerRef.current.setLngLat(lngLat);
    }
  }, [metresToPixels]);

  // draws/moves a marker for everyone currently sharing back to us
  const renderOthers = useCallback((list) => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set();
    list.forEach((person) => {
      seen.add(person.userId);
      const lngLat = [person.lng, person.lat];
      const existing = otherMarkersRef.current.get(person.userId);
      if (existing) {
        existing.setLngLat(lngLat);
      } else {
        const marker = new mapboxgl.Marker({ element: buildMarkerEl('other', person.name || otherLabel), anchor: 'center' })
          .setLngLat(lngLat)
          .addTo(map);
        otherMarkersRef.current.set(person.userId, marker);
      }
    });

    // drop markers for anyone who stopped sharing
    otherMarkersRef.current.forEach((marker, userId) => {
      if (!seen.has(userId)) {
        marker.remove();
        otherMarkersRef.current.delete(userId);
      }
    });
  }, [otherLabel]);

  // GPS watch: keeps our own dot moving and, when sharing is on, pushes
  // the position to the backend every few seconds (not on every callback —
  // that would be a lot of writes for not much extra accuracy)
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

  // pushes our position to the backend on a slower cadence, only while sharing is on
  useEffect(() => {
    if (!rideId || !sharing || !position) return;

    const push = async () => {
      const now = Date.now();
      if (now - lastPushRef.current < PUSH_INTERVAL_MS) return;
      lastPushRef.current = now;
      try {
        await api.put(`/api/location/${rideId}`, { lat: position[1], lng: position[0], accuracy }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } catch (err) {
        // a missed beat isn't worth surfacing — the next tick will retry
      }
    };
    push();
  }, [rideId, sharing, position, accuracy]);

  // polls for the other party's location while this page is open
  useEffect(() => {
    if (!rideId) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await api.get(`/api/location/${rideId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (cancelled) return;
        setOthers(res.data.others || []);
        renderOthers(res.data.others || []);
      } catch (err) {
        // transient network hiccups shouldn't spam the user with toasts
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [rideId, renderOthers]);

  const toggleSharing = async () => {
    if (sharing) {
      setSharing(false);
      try {
        await api.delete(`/api/location/${rideId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } catch (err) {
        // already stopped locally either way
      }
      return;
    }
    if (!position) return;
    setSharing(true);
    lastPushRef.current = 0;
  };

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
        <p className={heading.cardTight}>Location access required</p>
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

        {rideId && (
          <button
            onClick={toggleSharing}
            disabled={!position}
            className={`absolute top-4 left-4 z-10 text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-colors disabled:opacity-50 ${
              sharing ? 'bg-ink text-marigold-500' : 'bg-white text-ink border border-ink/10 hover:bg-ink/5'
            }`}
          >
            {sharing ? '● Sharing my location' : 'Share my location'}
          </button>
        )}

        {position && !followUser && (
          <button onClick={handleRecenter} title="Re-center on my location" className="absolute bottom-4 right-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-ink/5 transition-colors border border-ink/10">
            <svg className="w-5 h-5 text-route-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
          </button>
        )}
      </div>

      {rideId && (
        <div className={`rounded-xl px-4 py-3 border text-sm font-medium ${others.length > 0 ? 'bg-route-50 border-route-100 text-route-700' : 'bg-ink/[0.03] border-ink/10 text-ink-600'}`}>
          {others.length > 0
            ? `${others.map(o => o.name).join(', ')} ${others.length === 1 ? 'is' : 'are'} sharing their location with you.`
            : `Waiting for ${otherLabel || 'the other rider'} to share their location...`}
        </div>
      )}

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

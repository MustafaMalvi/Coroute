import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const FlyToPosition = ({ center, shouldFollow }) => {
  const map = useMap();
  useEffect(() => {
    if (center && shouldFollow) {
      map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
    }
  }, [center, shouldFollow, map]);
  return null;
};

const LiveMap = () => {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [route, setRoute] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [followUser, setFollowUser] = useState(true);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please use a modern browser like Chrome or Firefox.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        setAccuracy(pos.coords.accuracy);
        setRoute([newPos]);
        setLastUpdated(new Date());
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        setAccuracy(pos.coords.accuracy);
        setLastUpdated(new Date());
        setError(null);

        setRoute(prev => {
          if (prev.length === 0) return [newPos];
          const last = prev[prev.length - 1];
          const distance = Math.sqrt(
            Math.pow(last[0] - newPos[0], 2) + Math.pow(last[1] - newPos[1], 2)
          );
          if (distance > 0.00005) {
            return [...prev, newPos];
          }
          return prev;
        });
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
  }, []);

  const handleRecenter = () => setFollowUser(true);

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

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-ink/[0.03] rounded-xl border border-ink/10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-route-500 mb-4"></div>
        <p className="font-medium">Acquiring GPS signal...</p>
        <p className="text-ink-600 text-xs mt-2">Please allow location access when prompted</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-72 sm:h-[28rem] w-full rounded-2xl overflow-hidden shadow-sm border border-ink/10 z-0 relative">
        <MapContainer center={position} zoom={17} scrollWheelZoom={true} className="h-full w-full" whenReady={() => setFollowUser(true)}>
          <FlyToPosition center={position} shouldFollow={followUser} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {accuracy && (
            <Circle
              center={position}
              radius={accuracy}
              pathOptions={{ color: '#1B8F7A', fillColor: '#1B8F7A', fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }}
            />
          )}
          {route.length > 1 && (
            <Polyline positions={route} pathOptions={{ color: '#1B8F7A', weight: 4, opacity: 0.7, lineJoin: 'round' }} />
          )}
          <Marker position={position} icon={customIcon}>
            <Popup>
              <div className="font-semibold text-center" style={{ color: '#1B8F7A' }}>You are here! 📍</div>
              <div className="text-xs text-center" style={{ color: '#71727C' }}>{position[0].toFixed(6)}, {position[1].toFixed(6)}</div>
              {accuracy && <div className="text-xs text-center mt-1" style={{ color: '#a1a1aa' }}>Accuracy: ±{Math.round(accuracy)}m</div>}
            </Popup>
          </Marker>
        </MapContainer>

        {!followUser && (
          <button onClick={handleRecenter} title="Re-center on my location" className="absolute bottom-4 right-4 z-[1000] bg-white shadow-lg rounded-full p-3 hover:bg-ink/5 transition-colors border border-ink/10">
            <svg className="w-5 h-5 text-route-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-ink/[0.03] rounded-xl px-4 py-3 border border-ink/10 text-xs font-meter">
        <div className="flex items-center gap-4">
          <span className="text-ink-600">📍 <span className="font-medium text-ink">{position[0].toFixed(6)}, {position[1].toFixed(6)}</span></span>
          {accuracy && (
            <span className="text-ink-600">
              🎯 <span className={`font-semibold ${accuracy <= 50 ? 'text-route-600' : accuracy <= 200 ? 'text-marigold-600' : 'text-alert-500'}`}>±{Math.round(accuracy)}m</span>
            </span>
          )}
        </div>
        <span className="text-ink-400">🕒 {formatTime(lastUpdated)}</span>
      </div>
    </div>
  );
};

export default LiveMap;

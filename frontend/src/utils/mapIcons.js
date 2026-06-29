import L from 'leaflet';

// Base options for standard Leaflet pin shape
const iconAnchor = [12, 41];
const popupAnchor = [1, -34];
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';
const shadowSize = [41, 41];

// 1. Selected Location Pin (Indigo/Blue)
export const selectedPin = () => {
  return new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor,
    popupAnchor,
    shadowSize
  });
};

// 2. Severity-based Icons (Red, Yellow/Orange, Green)
export const severityIcon = (severity) => {
  let color = 'green'; // Default/Low fallback

  if (severity) {
    const normalized = severity.toLowerCase();
    if (normalized === 'high' || normalized === 'critical') {
      color = 'red';
    } else if (normalized === 'medium') {
      color = 'orange'; // Looks amber/yellow on the map layout
    } else if (normalized === 'low') {
      color = 'green';
    }
  }

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor,
    popupAnchor,
    shadowSize
  });
};
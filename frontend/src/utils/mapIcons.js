// src/utils/mapIcons.js
import L from 'leaflet';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default Leaflet icon broken by Vite/webpack
export const DefaultIcon = L.icon({
    iconUrl:    markerIcon,
    shadowUrl:  markerShadow,
    iconSize:   [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const pinSVG = (fill) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
  <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${fill}"/>
  <circle cx="12.5" cy="12.5" r="5" fill="white"/>
</svg>`;

const divOptions = { className: '', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] };

export const severityIcon = (severity) => {
    const color = severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f59e0b' : '#22c55e';
    return L.divIcon({ html: pinSVG(color), ...divOptions });
};

export const selectedPin = () =>
    L.divIcon({ html: pinSVG('#4f46e5'), ...divOptions });
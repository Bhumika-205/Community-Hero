// src/utils/geo.js

export async function geocodeQuery(q) {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.map(x => ({
        label: x.display_name,
        lat: parseFloat(x.lat),
        lon: parseFloat(x.lon),
    }));
}

export async function reverseGeocode(lat, lon) {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

export function shortAddress(full, parts = 3) {
    return (full || '').split(',').slice(0, parts).join(',');
}
// src/components/LiveMap.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Brain } from 'lucide-react';
import { createIssue, uploadImage, analyzeImage } from '../service/api';
import { geocodeQuery, reverseGeocode, shortAddress } from '../utils/geo';
import { severityIcon, selectedPin } from '../utils/mapIcons';
import { severityBadge, statusBadge } from '../utils/constants';
import ReportForm from './ReportForm';
import IssueCard from './IssueCard';

// ── Map helpers (must live inside MapContainer) ──────────────────────────────
function FlyTo({ center, zoom }) {
    const map = useMap();
    useEffect(() => { if (center) map.flyTo(center, zoom, { duration: 1.2 }); }, [center]);
    return null;
}
function ClickCapture({ onMapClick }) {
    useMapEvents({ click: e => onMapClick(e.latlng.lat, e.latlng.lng) });
    return null;
}

export default function LiveMap({ issues, onIssueCreated, onUpvote, userName, onAddReport }) {
    // Form state
    const [title, setTitle]               = useState('');
    const [description, setDescription]   = useState('');
    const [lat, setLat]                   = useState(null);
    const [lon, setLon]                   = useState(null);
    const [address, setAddress]           = useState('');
    const [imageUrl, setImageUrl]         = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [imgUploading, setImgUploading] = useState(false);
    const [submitting, setSubmitting]     = useState(false);

    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Location search
    const [locQuery, setLocQuery]         = useState('');
    const [locResults, setLocResults]     = useState([]);
    const [locSearching, setLocSearching] = useState(false);
    const debounceRef = useRef(null);

    // Map fly-to
    const [flyTarget, setFlyTarget] = useState(null);

    // ── Location search ────────────────────────────────────────────────────
    function handleLocInput(val) {
        setLocQuery(val);
        setLocResults([]);
        clearTimeout(debounceRef.current);
        if (val.trim().length < 3) return;
        debounceRef.current = setTimeout(async () => {
            setLocSearching(true);
            try { setLocResults(await geocodeQuery(val)); }
            catch (e) { console.error(e); }
            finally { setLocSearching(false); }
        }, 450);
    }

    function pickLocation(r) {
        setLat(r.lat); setLon(r.lon);
        setAddress(r.label);
        setLocQuery(shortAddress(r.label, 2));
        setLocResults([]);
        setFlyTarget({ center: [r.lat, r.lon], zoom: 14 });
    }

    // ── Map click → reverse geocode ────────────────────────────────────────
    const handleMapClick = useCallback(async (clat, clon) => {
        setLat(clat); setLon(clon);
        setLocQuery('Looking up address…');
        try {
            const full = await reverseGeocode(clat, clon);
            setAddress(full);
            setLocQuery(shortAddress(full, 3));
        } catch {
            const fallback = `${clat.toFixed(4)}, ${clon.toFixed(4)}`;
            setAddress(fallback); setLocQuery(fallback);
        }
        setFlyTarget({ center: [clat, clon], zoom: 15 });
    }, []);

    // ── GPS ────────────────────────────────────────────────────────────────
    async function useMyLocation() {
        if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
        setLocQuery('Detecting location…');
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
            const { latitude: clat, longitude: clon } = coords;
            setLat(clat); setLon(clon);
            const full = await reverseGeocode(clat, clon);
            setAddress(full);
            setLocQuery(shortAddress(full, 3));
            setFlyTarget({ center: [clat, clon], zoom: 15 });
        }, () => { alert('Could not get location. Please search manually.'); setLocQuery(''); });
    }

    // ── Cloudinary upload ──────────────────────────────────────────────────
    // async function handleImageFile(file) {
    //     if (!file) return;
    //     setImagePreview(URL.createObjectURL(file));
    //     setImgUploading(true);
    //     try { setImageUrl(await uploadImage(file)); }
    //     catch { alert('Upload failed. Check Cloudinary keys in .env'); setImagePreview(''); setImageUrl(''); }
    //     finally { setImgUploading(false); }
    // }
        async function handleImageFile(file) {
        if (!file) return;
        setImagePreview(URL.createObjectURL(file));
        setImgUploading(true);
        try {
            const uploadedUrl = await uploadImage(file);
            setImageUrl(uploadedUrl);
            setAiLoading(true);
            const analysis = await analyzeImage(uploadedUrl);
            console.log("AI RESULT:", analysis);
            setAiAnalysis(analysis);
            if (analysis.title) {
                setTitle(analysis.title);
            }
            if (analysis.description) {
                setDescription(analysis.description);
            }
        } catch (err) {
            console.error(err);
            alert(
                'Image upload or AI analysis failed.'
            );
            setImagePreview('');
            setImageUrl('');
        } finally {
            setImgUploading(false);
            setAiLoading(false);
        }
    }

    // ── Submit ─────────────────────────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        if (!address.trim()) {
            alert(
                "Please choose a location."
            );
            return;
        }
        setSubmitting(true);
        try {
            const saved = await createIssue({
                title, description,
                latitude: lat, longitude: lon,
                address, imageUrl: imageUrl || undefined,
                reportedBy: userName,
            });
            // Reset form
            setTitle(''); setDescription(''); setAddress('');
            setLat(null); setLon(null);
            setLocQuery(''); setLocResults([]);
            setImageUrl(''); setImagePreview('');

            onAddReport(saved); // App.jsx handles XP + reload
        } catch {
            alert('Failed to submit. Is the backend running on port 5000?');
        } finally {
            setSubmitting(false);
        }
    }

    const mapCenter = issues.length > 0
        ? [issues[0].location.latitude, issues[0].location.longitude]
        : [20.5937, 78.9629];
    const mapZoom = issues.length > 0 ? 12 : 5;

    return (
        <main className="max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-4rem)] overflow-hidden">

            {/* ── Left scroll column ── */}
            <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-1 pb-6">
                <ReportForm
                    title={title}              setTitle={setTitle}
                    description={description}  setDescription={setDescription}
                    locQuery={locQuery}        onLocInput={handleLocInput}
                    locResults={locResults}    onPickLocation={pickLocation}
                    locSearching={locSearching}
                    onUseMyLocation={useMyLocation}
                    lat={lat}                  address={address}
                    imagePreview={imagePreview} imgUploading={imgUploading}
                    onImageFile={handleImageFile}
                    onClearImage={() => { setImagePreview(''); setImageUrl(''); }}
                    submitting={submitting}    onSubmit={handleSubmit}
                />

                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pt-1">Community Feed</h3>

                {issues.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
                        <p className="text-sm font-semibold text-slate-500">No reports yet.</p>
                        <p className="text-xs text-slate-400">Load sample data by running:</p>
                        <code className="block bg-slate-100 px-3 py-1.5 rounded text-indigo-600 text-xs font-mono">
                            node seed.js
                        </code>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 pb-4">
                        {issues.map(issue => (
                            <IssueCard key={issue._id} issue={issue} onUpvote={onUpvote} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Map panel ── */}
            <div className="lg:col-span-7 h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[300px]">
                <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full z-10">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickCapture onMapClick={handleMapClick} />
                    {flyTarget && <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />}

                    {/* Selected location pin */}
                    {lat && lon && (
                        <Marker position={[lat, lon]} icon={selectedPin()}>
                            <Popup>
                                {/* ... popup content ... */}
                            </Popup>
                        </Marker>
                    )}

                    {/* Issue markers */}
                    {issues.map(issue => (
                        <Marker
                            key={issue._id}
                            position={[issue.location?.latitude || issue.latitude, issue.location?.longitude || issue.longitude]}
                            icon={severityIcon(issue.severity)}>
                                
                            <Popup>
                                <div className="max-w-[220px] text-sm font-sans">
                                    {issue.imageUrl && (
                                        <img src={issue.imageUrl} alt=""
                                            className="w-full h-24 object-cover rounded mb-2"
                                            onError={e => { e.currentTarget.style.display = 'none'; }} />
                                    )}
                                    <p className="font-bold text-slate-900 mb-0.5">{issue.title}</p>
                                    <div className="flex items-center gap-1 mb-1">
                                        <Brain className="h-3 w-3 text-indigo-400" />
                                        <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">
                                            {issue.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{issue.description}</p>
                                    <div className="flex justify-between text-[10px] font-bold border-t border-slate-100 pt-1.5 mt-1.5">
                                        <span>{issue.severity} severity</span>
                                        <span className="text-slate-400">{issue.upvotes} votes</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Overlays */}
                <div className="absolute top-3 right-3 z-[1000] bg-white border border-slate-200 px-3 py-1.5 text-[11px] rounded-lg shadow font-semibold text-slate-500 pointer-events-none">
                    🗺 Tap map to pin location
                </div>
                <div className="absolute bottom-8 left-3 z-[1000] bg-white border border-slate-200 p-2.5 rounded-lg shadow space-y-1.5 pointer-events-none">
                    {[['High','bg-red-500'],['Medium','bg-amber-400'],['Low','bg-green-500'],['Selected','bg-indigo-600']].map(([l,c]) => (
                        <div key={l} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                            <span className={`w-3 h-3 rounded-full ${c}`} /> {l}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
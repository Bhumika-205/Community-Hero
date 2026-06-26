// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { getIssues, createIssue, upvoteIssue } from './service/api';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { 
    MapPin, AlertCircle, ThumbsUp, Landmark, Activity, 
    CheckCircle2, BarChart3, Trophy, BrainCircuit, Image as ImageIcon, 
    ChevronRight, Award, ShieldAlert, Sparkles
} from 'lucide-react';
import L from 'leaflet';

// Fix for default Leaflet marker icons in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
    // Tab State: 'dashboard' | 'analytics' | 'gamification' | 'insights'
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Core Data States
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [address, setAddress] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // Map States
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India
    const [mapZoom, setMapZoom] = useState(5);

    // Gamification (User Profile State)
    const [userXP, setUserXP] = useState(() => {
        const saved = localStorage.getItem('hero_xp');
        return saved ? parseInt(saved, 10) : 45; // Default starting XP
    });

    useEffect(() => {
        loadIssues();
    }, []);

    const loadIssues = async () => {
        try {
            const data = await getIssues();
            setIssues(data);
            if (data.length > 0) {
                setMapCenter([data[0].location.latitude, data[0].location.longitude]);
                setMapZoom(12);
            }
        } catch (error) {
            console.error("Error loading issues:", error);
        }
    };

    // Geolocation Grab
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLatitude(latitude.toFixed(6));
                setLongitude(longitude.toFixed(6));
                setMapCenter([latitude, longitude]);
                setMapZoom(15);
                setAddress("GPS Location Captured");
            },
            () => {
                alert("Unable to retrieve location. Please verify browser permissions.");
            }
        );
    };

    // Submit Issue (Form)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !description || !latitude || !longitude) {
            alert("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            await createIssue({
                title,
                description,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address,
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=500&auto=format&fit=crop&q=60' // default pothole/issue placeholder
            });
            
            // Clear Form
            setTitle('');
            setDescription('');
            setLatitude('');
            setLongitude('');
            setAddress('');
            setImageUrl('');
            
            // Gamification reward: +15 XP for reporting an issue
            const newXP = userXP + 15;
            setUserXP(newXP);
            localStorage.setItem('hero_xp', newXP);

            await loadIssues();
        } catch (error) {
            alert("Failed to submit issue. Please verify backend connection.");
        } finally {
            setLoading(false);
        }
    };

    // Upvote Issue
    const handleUpvote = async (id) => {
        try {
            await upvoteIssue(id);
            
            // Gamification reward: +5 XP for verifying/voting
            const newXP = userXP + 5;
            setUserXP(newXP);
            localStorage.setItem('hero_xp', newXP);

            await loadIssues();
        } catch (error) {
            console.error("Error upvoting:", error);
        }
    };

    // Map Event Click
    function MapClickHandler() {
        useMapEvents({
            click(e) {
                setLatitude(e.latlng.lat.toFixed(6));
                setLongitude(e.latlng.lng.toFixed(6));
                setAddress(`Map Pin: [${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}]`);
            },
        });
        return null;
    }

    // styling badges helpers
    const getSeverityBadge = (level) => {
        switch (level) {
            case 'High': return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Verified': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-indigo-100 text-indigo-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-zinc-100 text-zinc-800';
        }
    };

    // Compute Live Statistics for the Impact Dashboard
    const totalReports = issues.length;
    const verifiedReports = issues.filter(i => i.status !== 'Pending').length;
    const highSeverityCount = issues.filter(i => i.severity === 'High').length;
    
    // Count occurrences of categories dynamically
    const categoryStats = issues.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-950">
            {/* Navbar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm shrink-0">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Landmark className="h-6 w-6 text-indigo-600 animate-pulse" />
                        <span className="font-bold text-xl tracking-tight text-slate-900">Community<span className="text-indigo-600">Hero</span></span>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="hidden md:flex items-center gap-1.5">
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Live Map
                        </button>
                        <button 
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Impact Analytics
                        </button>
                        <button 
                            onClick={() => setActiveTab('gamification')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'gamification' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Citizen Rewards
                        </button>
                        <button 
                            onClick={() => setActiveTab('insights')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'insights' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            AI Risk Predictions
                        </button>
                    </nav>

                    {/* Quick Profile XP Badge */}
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                            <Trophy className="h-3.5 w-3.5" />
                            <span>{userXP} XP</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Tab Bar */}
            <div className="md:hidden flex bg-white border-b border-slate-200 justify-around text-xs py-2 sticky top-16 z-40">
                <button onClick={() => setActiveTab('dashboard')} className={`p-1 font-bold ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'}`}>Map</button>
                <button onClick={() => setActiveTab('analytics')} className={`p-1 font-bold ${activeTab === 'analytics' ? 'text-indigo-600' : 'text-slate-500'}`}>Impact</button>
                <button onClick={() => setActiveTab('gamification')} className={`p-1 font-bold ${activeTab === 'gamification' ? 'text-indigo-600' : 'text-slate-500'}`}>Rewards</button>
                <button onClick={() => setActiveTab('insights')} className={`p-1 font-bold ${activeTab === 'insights' ? 'text-indigo-600' : 'text-slate-500'}`}>AI Risk</button>
            </div>

            {/* Main Application Area */}
            <div className="flex-1 overflow-hidden">
                
                {/* TAB 1: DASHBOARD MAP & REPORTS VIEW */}
                {activeTab === 'dashboard' && (
                    <main className="max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-4rem)] overflow-hidden">
                        {/* Left Side: Reporting Panel & Feed */}
                        <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-y-auto pr-1">
                            
                            {/* Report Form Component */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shrink-0">
                                <h2 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-indigo-600" />
                                    Report a Community Issue
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-3.5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Issue Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Damaged streetlamp or trash pile"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                                        <textarea
                                            rows="2"
                                            placeholder="Describe the issue. AI will automatically prioritize severity."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                                        />
                                    </div>

                                    {/* Location Inputs */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Latitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0.0000"
                                                value={latitude}
                                                onChange={(e) => setLatitude(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Longitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0.0000"
                                                value={longitude}
                                                onChange={(e) => setLongitude(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Location Helpers */}
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleGetCurrentLocation}
                                            className="flex-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200/50 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                                        >
                                            <MapPin className="h-3.5 w-3.5" /> Use My Location
                                        </button>
                                    </div>

                                    {/* Landmark/Address */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Landmark / Address</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Opposite the bank"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                        />
                                    </div>

                                    {/* IMAGE SUBMISSION FEATURE */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            <span className="flex items-center gap-1">
                                                <ImageIcon className="h-3.5 w-3.5 text-slate-400" /> Optional: Photo URL
                                            </span>
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="e.g., https://images.unsplash.com/photo-..."
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                                    >
                                        {loading ? "Analyzing with AI..." : "Submit Report (+15 XP)"}
                                    </button>
                                </form>
                            </div>

                            {/* Active Issue Feed */}
                            <div className="flex-1 min-h-[250px] flex flex-col gap-3 pb-8">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Community Feed</h3>
                                {issues.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
                                        No active reports found. Map is clear!
                                    </div>
                                ) : (
                                    issues.map((issue) => (
                                        <div key={issue._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-200 transition flex flex-col">
                                            {/* Optional Image */}
                                            {issue.imageUrl && (
                                                <div className="h-44 w-full bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100">
                                                    <img 
                                                        src={issue.imageUrl} 
                                                        alt={issue.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            )}
                                            
                                            {/* Details */}
                                            <div className="p-4 flex flex-col gap-3">
                                                <div>
                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(issue.severity)}`}>
                                                            {issue.severity} Priority
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(issue.status)}`}>
                                                            {issue.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 text-base mb-1">{issue.title}</h4>
                                                    <p className="text-xs text-indigo-600 font-bold tracking-wide">{issue.category}</p>
                                                    <p className="text-sm text-slate-600 mt-2 line-clamp-3">{issue.description}</p>
                                                    {issue.location.address && (
                                                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2 font-medium">
                                                            <MapPin className="h-3 w-3" /> {issue.location.address}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                                                    <button
                                                        onClick={() => handleUpvote(issue._id)}
                                                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1.5 rounded-lg transition"
                                                    >
                                                        <ThumbsUp className="h-3.5 w-3.5" /> Upvote / Verify (+5 XP)
                                                    </button>
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                                                        Votes: {issue.upvotes}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Side: Leaflet Map Viewer */}
                        <div className="lg:col-span-7 h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[300px]">
                            <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full z-10" key={`${mapCenter[0]}-${mapCenter[1]}`}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapClickHandler />
                                {issues.map((issue) => (
                                    <Marker 
                                        key={issue._id} 
                                        position={[issue.location.latitude, issue.location.longitude]}
                                    >
                                        <Popup>
                                            <div className="text-sm font-sans text-slate-900 max-w-xs">
                                                {issue.imageUrl && (
                                                    <img 
                                                        src={issue.imageUrl} 
                                                        alt="" 
                                                        className="w-full h-24 object-cover rounded mb-2"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                <h4 className="font-bold text-slate-950 mb-0.5">{issue.title}</h4>
                                                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1">{issue.category}</p>
                                                <p className="text-slate-600 text-xs line-clamp-2 mb-2">{issue.description}</p>
                                                <div className="flex justify-between items-center text-[10px] font-bold border-t pt-1.5 border-slate-100 mt-1">
                                                    <span className={getSeverityBadge(issue.severity).split(' ')[0] + ' px-1.5 py-0.5 rounded'}>{issue.severity} Priority</span>
                                                    <span className="text-slate-400">Votes: {issue.upvotes}</span>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                            <div className="absolute top-3 right-3 z-[1000] bg-white border border-slate-200 p-2 text-[10px] rounded-lg shadow-md font-semibold text-slate-500 pointer-events-none">
                                💡 Click anywhere on the map to auto-fill GPS coordinates
                            </div>
                        </div>
                    </main>
                )}

                {/* TAB 2: LIVE IMPACT DASHBOARD */}
                {activeTab === 'analytics' && (
                    <main className="max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto h-full flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-950">Live Impact Dashboard</h2>
                            <p className="text-sm text-slate-500 mt-1">Measuring civic resolving speed, community participation, and priority trends.</p>
                        </div>

                        {/* Top stat Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports</p>
                                    <p className="text-2xl font-extrabold text-slate-950 mt-1">{totalReports}</p>
                                </div>
                                <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600"><Activity className="h-6 w-6" /></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Issues</p>
                                    <p className="text-2xl font-extrabold text-slate-950 mt-1">{verifiedReports}</p>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><CheckCircle2 className="h-6 w-6" /></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Priority Hazards</p>
                                    <p className="text-2xl font-extrabold text-red-600 mt-1">{highSeverityCount}</p>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg text-red-600"><AlertCircle className="h-6 w-6" /></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Rate</p>
                                    <p className="text-2xl font-extrabold text-slate-950 mt-1">
                                        {totalReports > 0 ? `${Math.round((verifiedReports / totalReports) * 100)}%` : '0%'}
                                    </p>
                                </div>
                                <div className="bg-amber-50 p-3 rounded-lg text-amber-600"><Sparkles className="h-6 w-6" /></div>
                            </div>
                        </div>

                        {/* Category and Severity graphs */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Categories breakdown list */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-base font-bold text-slate-950 mb-4 flex items-center gap-1.5"><BarChart3 className="h-5 w-5 text-indigo-600" /> Category Breakdown</h3>
                                <div className="space-y-4">
                                    {Object.keys(categoryStats).length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-8">No data available yet.</p>
                                    ) : (
                                        Object.entries(categoryStats).map(([cat, count]) => {
                                            const percent = Math.round((count / totalReports) * 100);
                                            return (
                                                <div key={cat} className="space-y-1">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-semibold text-slate-700">{cat}</span>
                                                        <span className="font-bold text-slate-950">{count} ({percent}%)</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Severity Breakdown progress representation */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-base font-bold text-slate-950 mb-4 flex items-center gap-1.5"><AlertCircle className="h-5 w-5 text-indigo-600" /> Severity Priority Analysis</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold text-slate-700">High Severity</span>
                                            <span className="font-bold text-red-600">{highSeverityCount}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-red-500 h-full rounded-full" style={{ width: `${totalReports > 0 ? (highSeverityCount / totalReports) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold text-slate-700">Medium Severity</span>
                                            <span className="font-bold text-amber-600">{issues.filter(i => i.severity === 'Medium').length}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalReports > 0 ? (issues.filter(i => i.severity === 'Medium').length / totalReports) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold text-slate-700">Low Severity</span>
                                            <span className="font-bold text-emerald-600">{issues.filter(i => i.severity === 'Low').length}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalReports > 0 ? (issues.filter(i => i.severity === 'Low').length / totalReports) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                )}

                {/* TAB 3: GAMIFICATION FOR CITIZEN ENGAGEMENT */}
                {activeTab === 'gamification' && (
                    <main className="max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto h-full flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-950">Citizen XP & Gamified Rewards</h2>
                            <p className="text-sm text-slate-500 mt-1">Earn Karma Experience Points (XP) by supporting community verification and reporting active concerns.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* User Karma Profile Card */}
                            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md flex flex-col justify-between gap-6">
                                <div>
                                    <span className="bg-white/10 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Local Guardian Badge</span>
                                    <h3 className="text-xl font-bold mt-4">Active Citizen Profile</h3>
                                    <p className="text-slate-400 text-sm mt-1">Level 4 Hero</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span>Progress to next Rank</span>
                                        <span>{userXP} / 500 XP</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full" style={{ width: `${Math.min((userXP / 500) * 100, 100)}%` }}></div>
                                    </div>
                                    <p className="text-slate-400 text-xs italic">Earn +15 XP by reporting and +5 XP by voting to verify issues.</p>
                                </div>
                            </div>

                            {/* Active Leaderboard list */}
                            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-base font-bold text-slate-950 mb-4 flex items-center gap-1.5"><Trophy className="h-5 w-5 text-amber-500" /> Community Leaderboard</h3>
                                <div className="space-y-3">
                                    {/* Simulated Leaderboard with user XP dynamically merged */}
                                    {[
                                        { name: 'Amit Kumar (You)', points: userXP, badge: 'Veteran Reporter', isUser: true },
                                        { name: 'Siddharth Nair', points: 340, badge: 'Pothole Specialist', isUser: false },
                                        { name: 'Ananya Sharma', points: 290, badge: 'Neighborhood Champion', isUser: false },
                                        { name: 'Rohit Verma', points: 180, badge: 'Grid Inspector', isUser: false },
                                        { name: 'Priya Patel', points: 95, badge: 'Local Helper', isUser: false }
                                    ]
                                    .sort((a, b) => b.points - a.points)
                                    .map((user, idx) => (
                                        <div key={user.name} className={`flex items-center justify-between p-3 rounded-lg border ${user.isUser ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-400 text-sm w-4">#{idx + 1}</span>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800">{user.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold">{user.badge}</p>
                                                </div>
                                            </div>
                                            <div className="font-extrabold text-sm text-indigo-600">{user.points} XP</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Citizen Badges achievements section */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-950 mb-4 flex items-center gap-1.5"><Award className="h-5 w-5 text-indigo-600" /> Unlockable Guardian Badges</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 border rounded-xl flex items-start gap-3 bg-slate-50 border-slate-200">
                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0"><MapPin className="h-5 w-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800">First Responder</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">Submit your first community hazard report successfully.</p>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-xl flex items-start gap-3 bg-slate-50 border-slate-200">
                                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0"><ThumbsUp className="h-5 w-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800">Candid Voter</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">Participate in 10 upvote validations of neighbor issues.</p>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-xl flex items-start gap-3 bg-slate-50 border-slate-200">
                                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><CheckCircle2 className="h-5 w-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800">Urban Catalyst</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">Have at least 3 of your reported issues solved by municipal workers.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                )}

                {/* TAB 4: AI PREDICTIVE INSIGHTS */}
                {activeTab === 'insights' && (
                    <main className="max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto h-full flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-950 flex items-center gap-2"><BrainCircuit className="h-7 w-7 text-indigo-600" /> AI Predictive Risk Forecasting</h2>
                            <p className="text-sm text-slate-500 mt-1">Our AI algorithms scan community infrastructure, age models, and incoming complaints to identify high-risk spots before failure occurs.</p>
                        </div>

                        {/* Visual alerts list */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Forecast list component */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                                <h3 className="text-base font-bold text-slate-950 mb-1.5 flex items-center gap-1.5"><ShieldAlert className="h-5 w-5 text-red-500 animate-bounce" /> Current AI Hazard Warnings</h3>
                                <div className="space-y-4">
                                    <div className="p-4 border border-red-200 bg-red-50/50 rounded-xl">
                                        <div className="flex items-center justify-between text-xs font-bold text-red-700 uppercase mb-1">
                                            <span>Water & Sanitation Risk</span>
                                            <span>85% Risk Score</span>
                                        </div>
                                        <h4 className="font-bold text-sm text-red-950">Water Line Rupture Warning (West Grid Zone)</h4>
                                        <p className="text-xs text-red-700 mt-1">3 adjacent minor leaks reported within a 40-meter radius over 48 hours indicates high sub-surface pressure. Recommended immediate check to prevent rupture.</p>
                                    </div>

                                    <div className="p-4 border border-amber-200 bg-amber-50/50 rounded-xl">
                                        <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase mb-1">
                                            <span>Electrical & Grid Risk</span>
                                            <span>70% Risk Score</span>
                                        </div>
                                        <h4 className="font-bold text-sm text-amber-950">Streetlight Failure Cluster (Main Boulevard Sector)</h4>
                                        <p className="text-xs text-amber-700 mt-1">AI modeling predicts complete circuitry failure in Sector 7 within 5 days based on overlapping streetlight flickering reports from users.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Predictive technology description */}
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200 flex flex-col justify-between gap-6">
                                <div>
                                    <h3 className="text-base font-bold text-indigo-900 mb-2">How do Predictive Insights assist cities?</h3>
                                    <p className="text-sm text-indigo-800 leading-relaxed">
                                        Instead of waiting for critical infrastructure to break entirely, the platform groups neighboring civic reports together. By checking humidity, season patterns, and cluster density, our AI projects future risk spots. 
                                    </p>
                                    <p className="text-sm text-indigo-800 mt-3 leading-relaxed">
                                        This transforms public maintenance from <strong>reactive (fixing what's broken)</strong> to <strong>preventative (addressing concerns before they fail)</strong>, saving public funds and maintaining community safety.
                                    </p>
                                </div>
                                <div className="bg-white/80 p-4 rounded-xl border border-indigo-100">
                                    <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wide">Next Generation AI Feature</h4>
                                    <p className="text-xs text-slate-500 mt-1">Data from municipal repair units is automatically synchronized back to build future forecast accuracy.</p>
                                </div>
                            </div>
                        </div>
                    </main>
                )}

            </div>
        </div>
    );
}

export default App;
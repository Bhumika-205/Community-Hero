// frontend/src/App.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getIssues, createIssue, upvoteIssue, uploadImage } from './service/api';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import {
    MapPin, AlertCircle, ThumbsUp, Landmark, Activity,
    CheckCircle2, BarChart3, Trophy, BrainCircuit,
    ChevronRight, Award, ShieldAlert, Sparkles, Upload, X, User
} from 'lucide-react';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// ─── Severity-coloured map markers ───────────────────────────────────────────
const severityIcon = (severity) => {
    const color = severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f59e0b' : '#22c55e';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="5" fill="white"/>
    </svg>`;
    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
};

// ─── Seeded fake leaderboard peers (stable, realistic) ───────────────────────
const SEED_PEERS = [
    { name: 'Siddharth Nair',  points: 340, badge: 'Pothole Specialist',   reports: 18, votes: 44 },
    { name: 'Ananya Sharma',   points: 290, badge: 'Neighborhood Champion', reports: 15, votes: 28 },
    { name: 'Rohit Verma',     points: 180, badge: 'Grid Inspector',        reports: 9,  votes: 18 },
    { name: 'Priya Patel',     points: 95,  badge: 'Local Helper',          reports: 4,  votes: 15 },
];

// ─── Badge definitions ────────────────────────────────────────────────────────
const getBadges = (userXP, issues, reportCount, voteCount) => [
    {
        id: 'first_responder',
        name: 'First Responder',
        desc: 'Submit your first community hazard report.',
        icon: MapPin,
        color: 'indigo',
        unlocked: reportCount >= 1,
    },
    {
        id: 'candid_voter',
        name: 'Candid Voter',
        desc: 'Participate in 10 upvote validations.',
        icon: ThumbsUp,
        color: 'amber',
        unlocked: voteCount >= 10,
    },
    {
        id: 'urban_catalyst',
        name: 'Urban Catalyst',
        desc: 'Have 3 of your reported issues resolved.',
        icon: CheckCircle2,
        color: 'emerald',
        unlocked: issues.filter(i => i.status === 'Resolved').length >= 3,
    },
    {
        id: 'power_reporter',
        name: 'Power Reporter',
        desc: 'Submit 5 or more reports.',
        icon: Activity,
        color: 'blue',
        unlocked: reportCount >= 5,
    },
    {
        id: 'community_hero',
        name: 'Community Hero',
        desc: 'Earn 200 XP through civic action.',
        icon: Trophy,
        color: 'rose',
        unlocked: userXP >= 200,
    },
    {
        id: 'risk_watcher',
        name: 'Risk Watcher',
        desc: 'Your area triggers an AI hazard warning cluster.',
        icon: ShieldAlert,
        color: 'orange',
        unlocked: issues.filter(i => i.severity === 'High').length >= 2,
    },
];

// ─── Username onboarding modal ────────────────────────────────────────────────
function UsernameModal({ onSave }) {
    const [name, setName] = useState('');
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-7 w-7 text-indigo-600" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-1">Welcome to CommunityHero</h2>
                <p className="text-sm text-slate-500 mb-6">Enter your name to join the leaderboard and track your civic contributions.</p>
                <input
                    type="text"
                    placeholder="Your name (e.g. Amit Kumar)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim())}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 mb-4"
                    autoFocus
                />
                <button
                    onClick={() => name.trim() && onSave(name.trim())}
                    disabled={!name.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition text-sm"
                >
                    Join the Community →
                </button>
            </div>
        </div>
    );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [issues, setIssues]       = useState([]);
    const [loading, setLoading]     = useState(false);
    const [imgUploading, setImgUploading] = useState(false);

    // Form states
    const [title, setTitle]           = useState('');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude]     = useState('');
    const [longitude, setLongitude]   = useState('');
    const [address, setAddress]       = useState('');
    const [imageUrl, setImageUrl]     = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    // Map
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
    const [mapZoom, setMapZoom]     = useState(5);

    // User profile
    const [userName, setUserName] = useState(() => localStorage.getItem('hero_name') || '');
    const [userXP, setUserXP]     = useState(() => parseInt(localStorage.getItem('hero_xp') || '0', 10));
    const [reportCount, setReportCount] = useState(() => parseInt(localStorage.getItem('hero_reports') || '0', 10));
    const [voteCount, setVoteCount]     = useState(() => parseInt(localStorage.getItem('hero_votes') || '0', 10));

    const showUsernameModal = !userName;

    useEffect(() => { loadIssues(); }, []);

    const loadIssues = async () => {
        try {
            const data = await getIssues();
            setIssues(data);
            if (data.length > 0) {
                setMapCenter([data[0].location.latitude, data[0].location.longitude]);
                setMapZoom(12);
            }
        } catch (err) {
            console.error('Error loading issues:', err);
        }
    };

    const handleSaveUsername = (name) => {
        setUserName(name);
        localStorage.setItem('hero_name', name);
    };

    // ── Cloudinary image upload ──────────────────────────────────────────────
    const handleImageFile = async (file) => {
        if (!file) return;
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
        setImgUploading(true);
        try {
            const url = await uploadImage(file);
            setImageUrl(url);
        } catch (err) {
            alert('Image upload failed. Check your Cloudinary config.');
            setImagePreview('');
        } finally {
            setImgUploading(false);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageFile(file);
    };

    // ── Geolocation ──────────────────────────────────────────────────────────
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setLatitude(coords.latitude.toFixed(6));
                setLongitude(coords.longitude.toFixed(6));
                setMapCenter([coords.latitude, coords.longitude]);
                setMapZoom(15);
                setAddress('GPS Location Captured');
            },
            () => alert('Unable to retrieve location.')
        );
    };

    // ── Submit report ────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !description || !latitude || !longitude) {
            alert('Please fill in all required fields.'); return;
        }
        setLoading(true);
        try {
            await createIssue({
                title, description,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address,
                imageUrl: imageUrl || undefined,
                reportedBy: userName,
            });
            setTitle(''); setDescription(''); setLatitude(''); setLongitude('');
            setAddress(''); setImageUrl(''); setImagePreview('');

            const newXP      = userXP + 15;
            const newReports = reportCount + 1;
            setUserXP(newXP);
            setReportCount(newReports);
            localStorage.setItem('hero_xp', newXP);
            localStorage.setItem('hero_reports', newReports);

            await loadIssues();
        } catch (err) {
            alert('Failed to submit issue. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    // ── Upvote ───────────────────────────────────────────────────────────────
    const handleUpvote = async (id) => {
        try {
            await upvoteIssue(id);
            const newXP    = userXP + 5;
            const newVotes = voteCount + 1;
            setUserXP(newXP);
            setVoteCount(newVotes);
            localStorage.setItem('hero_xp', newXP);
            localStorage.setItem('hero_votes', newVotes);
            await loadIssues();
        } catch (err) {
            console.error('Error upvoting:', err);
        }
    };

    // ── Map click ────────────────────────────────────────────────────────────
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

    // ── Style helpers ────────────────────────────────────────────────────────
    const getSeverityBadge = (level) => {
        switch (level) {
            case 'High':   return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Low':    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default:       return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Verified':    return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-indigo-100 text-indigo-800';
            case 'Resolved':    return 'bg-green-100 text-green-800';
            default:            return 'bg-zinc-100 text-zinc-800';
        }
    };

    // ── Computed stats ───────────────────────────────────────────────────────
    const totalReports    = issues.length;
    const verifiedReports = issues.filter(i => i.status !== 'Pending').length;
    const resolvedReports = issues.filter(i => i.status === 'Resolved').length;
    const highSeverityCount = issues.filter(i => i.severity === 'High').length;

    const categoryStats = issues.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {});

    const statusStats = issues.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});

    // ── Dynamic leaderboard (user merged with seeded peers) ──────────────────
    const leaderboard = useMemo(() => {
        const user = { name: `${userName} (You)`, points: userXP, badge: getBadgeTitle(userXP, reportCount), isUser: true };
        return [...SEED_PEERS.map(p => ({ ...p, isUser: false })), user]
            .sort((a, b) => b.points - a.points);
    }, [userXP, userName, reportCount]);

    function getBadgeTitle(xp, reports) {
        if (xp >= 300) return 'Legend Guardian';
        if (xp >= 200) return 'Community Hero';
        if (xp >= 100) return 'Active Citizen';
        if (reports >= 3) return 'Veteran Reporter';
        if (reports >= 1) return 'First Responder';
        return 'New Member';
    }

    // ── Dynamic AI risk alerts from real issue data ──────────────────────────
    const riskAlerts = useMemo(() => {
        const grouped = {};
        issues.forEach(issue => {
            const key = issue.category;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(issue);
        });
        return Object.entries(grouped)
            .filter(([, arr]) => arr.length >= 2)
            .map(([category, arr]) => {
                const highCount = arr.filter(i => i.severity === 'High').length;
                const riskScore = Math.min(97, arr.length * 14 + highCount * 22);
                const isHighRisk = riskScore >= 60;
                return { category, count: arr.length, highCount, riskScore, isHighRisk };
            })
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 4);
    }, [issues]);

    // ── Badges ───────────────────────────────────────────────────────────────
    const badges = getBadges(userXP, issues, reportCount, voteCount);
    const unlockedCount = badges.filter(b => b.unlocked).length;

    const colorMap = {
        indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-200',  glow: 'shadow-indigo-100' },
        amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',   glow: 'shadow-amber-100' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', glow: 'shadow-emerald-100' },
        blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    glow: 'shadow-blue-100' },
        rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200',    glow: 'shadow-rose-100' },
        orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200',  glow: 'shadow-orange-100' },
    };

    // ── Level calculation ────────────────────────────────────────────────────
    const level = Math.floor(userXP / 100) + 1;
    const xpInLevel = userXP % 100;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-950">
            {showUsernameModal && <UsernameModal onSave={handleSaveUsername} />}

            {/* Navbar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm shrink-0">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Landmark className="h-6 w-6 text-indigo-600" />
                        <span className="font-bold text-xl tracking-tight text-slate-900">Community<span className="text-indigo-600">Hero</span></span>
                    </div>
                    <nav className="hidden md:flex items-center gap-1.5">
                        {[
                            { id: 'dashboard',     label: 'Live Map' },
                            { id: 'analytics',     label: 'Impact Analytics' },
                            { id: 'gamification',  label: 'Citizen Rewards' },
                            { id: 'insights',      label: 'AI Risk Predictions' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        {userName && (
                            <span className="text-xs text-slate-500 font-medium hidden sm:block">Hi, <span className="font-bold text-slate-800">{userName}</span></span>
                        )}
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                            <Trophy className="h-3.5 w-3.5" />
                            <span>{userXP} XP</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Tab Bar */}
            <div className="md:hidden flex bg-white border-b border-slate-200 justify-around text-xs py-2 sticky top-16 z-40">
                {[['dashboard','Map'],['analytics','Impact'],['gamification','Rewards'],['insights','AI Risk']].map(([id,label]) => (
                    <button key={id} onClick={() => setActiveTab(id)} className={`p-1 font-bold ${activeTab === id ? 'text-indigo-600' : 'text-slate-500'}`}>{label}</button>
                ))}
            </div>

            <div className="flex-1 overflow-hidden">

                {/* ── TAB 1: LIVE MAP ─────────────────────────────────────────── */}
                {activeTab === 'dashboard' && (
                    <main className="max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-4rem)] overflow-hidden">

                        {/* Left panel */}
                        <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-1 pb-4">

                            {/* Report Form */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shrink-0">
                                <h2 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-indigo-600" /> Report a Community Issue
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-3.5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Issue Title</label>
                                        <input type="text" placeholder="e.g., Damaged streetlamp or trash pile" value={title} onChange={e => setTitle(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                                        <textarea rows="2" placeholder="Describe the issue. AI will automatically prioritize severity." value={description} onChange={e => setDescription(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none" />
                                    </div>

                                    {/* Coordinates */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Latitude</label>
                                            <input type="number" step="any" placeholder="0.0000" value={latitude} onChange={e => setLatitude(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Longitude</label>
                                            <input type="number" step="any" placeholder="0.0000" value={longitude} onChange={e => setLongitude(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition" />
                                        </div>
                                    </div>

                                    <button type="button" onClick={handleGetCurrentLocation}
                                        className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200/50 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition">
                                        <MapPin className="h-3.5 w-3.5" /> Use My Location
                                    </button>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Landmark / Address</label>
                                        <input type="text" placeholder="e.g., Opposite the bank" value={address} onChange={e => setAddress(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition" />
                                    </div>

                                    {/* Cloudinary Image Upload */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Photo (optional)
                                        </label>
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover rounded-lg border border-slate-200" />
                                                {imgUploading && (
                                                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                                                        <span className="text-xs font-bold text-indigo-600 animate-pulse">Uploading to Cloudinary…</span>
                                                    </div>
                                                )}
                                                {!imgUploading && (
                                                    <button type="button" onClick={() => { setImagePreview(''); setImageUrl(''); }}
                                                        className="absolute top-2 right-2 bg-white border border-slate-200 rounded-full p-1 shadow hover:bg-red-50 transition">
                                                        <X className="h-3.5 w-3.5 text-red-500" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                onDragOver={e => e.preventDefault()}
                                                onDrop={handleFileDrop}
                                                className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-lg p-5 text-center cursor-pointer transition group">
                                                <Upload className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 mx-auto mb-1 transition" />
                                                <p className="text-xs text-slate-500 group-hover:text-indigo-600 transition">Click or drag & drop to upload a photo</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG — max 10MB</p>
                                            </div>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                            onChange={e => handleImageFile(e.target.files[0])} />
                                    </div>

                                    <button type="submit" disabled={loading || imgUploading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50">
                                        {loading ? 'Analyzing with AI…' : 'Submit Report (+15 XP)'}
                                    </button>
                                </form>
                            </div>

                            {/* Community Feed */}
                            <div className="flex flex-col gap-3 pb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Community Feed</h3>
                                {issues.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
                                        No active reports yet. Be the first to report an issue!
                                    </div>
                                ) : (
                                    issues.map(issue => (
                                        <div key={issue._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-200 transition flex flex-col">
                                            {issue.imageUrl && (
                                                <div className="h-40 w-full bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100">
                                                    <img src={issue.imageUrl} alt={issue.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                                        onError={e => { e.target.style.display = 'none'; }} />
                                                </div>
                                            )}
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
                                                    {issue.reportedBy && (
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                                            <User className="h-3 w-3" /> Reported by {issue.reportedBy}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                                    <button onClick={() => handleUpvote(issue._id)}
                                                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1.5 rounded-lg transition">
                                                        <ThumbsUp className="h-3.5 w-3.5" /> Verify (+5 XP)
                                                    </button>
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                                                        {issue.upvotes} vote{issue.upvotes !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="lg:col-span-7 h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[300px]">
                            <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full z-10" key={`${mapCenter[0]}-${mapCenter[1]}`}>
                                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapClickHandler />
                                {issues.map(issue => (
                                    <Marker key={issue._id}
                                        position={[issue.location.latitude, issue.location.longitude]}
                                        icon={severityIcon(issue.severity)}>
                                        <Popup>
                                            <div className="text-sm font-sans text-slate-900 max-w-xs">
                                                {issue.imageUrl && (
                                                    <img src={issue.imageUrl} alt="" className="w-full h-24 object-cover rounded mb-2"
                                                        onError={e => { e.target.style.display = 'none'; }} />
                                                )}
                                                <h4 className="font-bold text-slate-950 mb-0.5">{issue.title}</h4>
                                                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1">{issue.category}</p>
                                                <p className="text-slate-600 text-xs line-clamp-2 mb-2">{issue.description}</p>
                                                <div className="flex justify-between items-center text-[10px] font-bold border-t pt-1.5 border-slate-100 mt-1">
                                                    <span>{issue.severity} Priority</span>
                                                    <span className="text-slate-400">{issue.upvotes} votes</span>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                            <div className="absolute top-3 right-3 z-[1000] bg-white border border-slate-200 p-2 text-[10px] rounded-lg shadow-md font-semibold text-slate-500 pointer-events-none">
                                💡 Click map to auto-fill GPS coordinates
                            </div>
                            {/* Map legend */}
                            <div className="absolute bottom-8 left-3 z-[1000] bg-white border border-slate-200 p-2.5 rounded-lg shadow-md space-y-1 pointer-events-none">
                                {[['High','bg-red-500'],['Medium','bg-amber-400'],['Low','bg-green-500']].map(([label, cls]) => (
                                    <div key={label} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                                        <span className={`w-3 h-3 rounded-full ${cls}`}></span> {label} Severity
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                )}

                {/* ── TAB 2: IMPACT ANALYTICS ─────────────────────────────────── */}
                {activeTab === 'analytics' && (
                    <main className="max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto h-full flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-950">Live Impact Dashboard</h2>
                            <p className="text-sm text-slate-500 mt-1">Measuring civic resolving speed, community participation, and priority trends.</p>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Reports',      value: totalReports,    icon: Activity,      bg: 'bg-indigo-50', color: 'text-indigo-600', valueColor: 'text-slate-950' },
                                { label: 'Verified Issues',    value: verifiedReports, icon: CheckCircle2,  bg: 'bg-blue-50',   color: 'text-blue-600',   valueColor: 'text-slate-950' },
                                { label: 'High Priority',      value: highSeverityCount, icon: AlertCircle, bg: 'bg-red-50',    color: 'text-red-600',    valueColor: 'text-red-600' },
                                { label: 'Resolved',           value: resolvedReports, icon: Sparkles,      bg: 'bg-emerald-50',color: 'text-emerald-600',valueColor: 'text-emerald-700' },
                            ].map(({ label, value, icon: Icon, bg, color, valueColor }) => (
                                <div key={label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                                        <p className={`text-2xl font-extrabold mt-1 ${valueColor}`}>{value}</p>
                                    </div>
                                    <div className={`${bg} p-3 rounded-lg ${color}`}><Icon className="h-6 w-6" /></div>
                                </div>
                            ))}
                        </div>

                        {/* Category + Severity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-base font-bold text-slate-950 mb-4 flex items-center gap-1.5"><BarChart3 className="h-5 w-5 text-indigo-600" /> Category Breakdown</h3>
                                <div className="space-y-4">
                                    {Object.keys(categoryStats).length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-8">No data yet. Submit a report to see categories!</p>
                                    ) : Object.entries(categoryStats).sort((a,b) => b[1]-a[1]).map(([cat, count]) => {
                                        const pct = Math.round((count / totalReports) * 100);
                                        return (
                                            <div key={cat} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-semibold text-slate-700">{cat}</span>
                                                    <span className="font-bold text-slate-950">{count} ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-base font-bold text-slate-950 mb-4 flex items-center gap-1.5"><AlertCircle className="h-5 w-5 text-indigo-600" /> Severity & Status Breakdown</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'High Severity',   count: issues.filter(i=>i.severity==='High').length,   bar: 'bg-red-500' },
                                        { label: 'Medium Severity', count: issues.filter(i=>i.severity==='Medium').length, bar: 'bg-amber-500' },
                                        { label: 'Low Severity',    count: issues.filter(i=>i.severity==='Low').length,    bar: 'bg-emerald-500' },
                                    ].map(({ label, count, bar }) => (
                                        <div key={label} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-semibold text-slate-700">{label}</span>
                                                <span className="font-bold text-slate-950">{count}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className={`${bar} h-full rounded-full transition-all duration-500`} style={{ width: `${totalReports > 0 ? (count / totalReports) * 100 : 0}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t border-slate-100 pt-3 space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resolution Status</p>
                                        {Object.entries(statusStats).map(([status, count]) => (
                                            <div key={status} className="flex justify-between text-sm items-center">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(status)}`}>{status}</span>
                                                <span className="font-bold text-slate-700">{count} issues</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verification rate */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-slate-700">Community Verification Rate</h3>
                                <span className="text-2xl font-extrabold text-indigo-600">
                                    {totalReports > 0 ? `${Math.round((verifiedReports / totalReports) * 100)}%` : '0%'}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full rounded-full transition-all duration-700"
                                    style={{ width: `${totalReports > 0 ? (verifiedReports / totalReports) * 100 : 0}%` }} />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">{verifiedReports} of {totalReports} issues verified or in progress</p>
                        </div>
                    </main>
                )}

                {/* ── TAB 3: CITIZEN REWARDS ──────────────────────────────────── */}
                {activeTab === 'gamification' && (
                    <main className="max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto h-full flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-950">Citizen XP & Gamified Rewards</h2>
                            <p className="text-sm text-slate-500 mt-1">Earn Karma Experience Points (XP) by reporting issues and helping verify community concerns.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Profile card */}
                            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md flex flex-col justify-between gap-6">
                                <div>
                                    <span className="bg-white/10 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        {badges.find(b => b.unlocked && b.id === 'community_hero') ? 'Community Hero Badge' : 'Active Citizen'}
                                    </span>
                                    <h3 className="text-xl font-bold mt-4">{userName || 'Citizen'}</h3>
                                    <p className="text-slate-400 text-sm mt-1">Level {level} · {getBadgeTitle(userXP, reportCount)}</p>
                                    <div className="grid grid-cols-3 gap-3 mt-5">
                                        {[
                                            { label: 'Reports', val: reportCount },
                                            { label: 'Votes',   val: voteCount },
                                            { label: 'Badges',  val: `${unlockedCount}/${badges.length}` },
                                        ].map(({ label, val }) => (
                                            <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                                                <p className="text-lg font-extrabold">{val}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span>Level {level} Progress</span>
                                        <span>{xpInLevel} / 100 XP</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${xpInLevel}%` }} />
                                    </div>
                                    <p className="text-slate-400 text-xs italic">+15 XP per report · +5 XP per vote</p>
                                </div>
                            </div>

                            {/* Leaderboard */}
                            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-base font-bold text-slate-950 mb-4 flex items-center gap-1.5">
                                    <Trophy className="h-5 w-5 text-amber-500" /> Community Leaderboard
                                </h3>
                                <div className="space-y-2">
                                    {leaderboard.map((user, idx) => (
                                        <div key={user.name}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition ${user.isUser ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`font-extrabold text-sm w-5 ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300'}`}>
                                                    #{idx + 1}
                                                </span>
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

                        {/* Badges */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-950 mb-1 flex items-center gap-1.5">
                                <Award className="h-5 w-5 text-indigo-600" /> Guardian Badges
                                <span className="ml-auto text-xs font-semibold text-slate-400">{unlockedCount} / {badges.length} unlocked</span>
                            </h3>
                            <p className="text-xs text-slate-400 mb-4">Badges unlock automatically based on your civic activity.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {badges.map(badge => {
                                    const c = colorMap[badge.color];
                                    const Icon = badge.icon;
                                    return (
                                        <div key={badge.id}
                                            className={`p-4 border rounded-xl flex items-start gap-3 transition ${badge.unlocked ? `${c.bg} ${c.border} shadow-md ${c.glow}` : 'bg-slate-50 border-slate-200 opacity-50 grayscale'}`}>
                                            <div className={`p-2.5 rounded-lg shrink-0 ${badge.unlocked ? `${c.bg} ${c.text}` : 'bg-slate-100 text-slate-400'}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="font-bold text-sm text-slate-800">{badge.name}</h4>
                                                    {badge.unlocked && <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full uppercase">Unlocked</span>}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">{badge.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>
                )}

                {/* ── TAB 4: AI RISK PREDICTIONS ──────────────────────────────── */}
                {activeTab === 'insights' && (
                    <main className="max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto h-full flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
                                <BrainCircuit className="h-7 w-7 text-indigo-600" /> AI Predictive Risk Forecasting
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Clustering community reports to identify high-risk infrastructure spots before failure occurs.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Dynamic risk alerts */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                                <h3 className="text-base font-bold text-slate-950 flex items-center gap-1.5">
                                    <ShieldAlert className="h-5 w-5 text-red-500 animate-bounce" /> Current AI Hazard Warnings
                                </h3>
                                {riskAlerts.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <ShieldAlert className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-slate-400">No hazard clusters detected yet.</p>
                                        <p className="text-xs text-slate-300 mt-1">Warnings appear when 2+ issues share a category, based on real reported data.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {riskAlerts.map(alert => {
                                            const isHigh = alert.riskScore >= 60;
                                            return (
                                                <div key={alert.category}
                                                    className={`p-4 border rounded-xl ${isHigh ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
                                                    <div className={`flex items-center justify-between text-xs font-bold uppercase mb-1 ${isHigh ? 'text-red-700' : 'text-amber-700'}`}>
                                                        <span>{alert.category} Risk</span>
                                                        <span>{alert.riskScore}% Risk Score</span>
                                                    </div>
                                                    <h4 className={`font-bold text-sm ${isHigh ? 'text-red-950' : 'text-amber-950'}`}>
                                                        {alert.count} clustered reports detected
                                                    </h4>
                                                    <p className={`text-xs mt-1 ${isHigh ? 'text-red-700' : 'text-amber-700'}`}>
                                                        {alert.highCount > 0 ? `${alert.highCount} high-severity case${alert.highCount > 1 ? 's' : ''} identified. ` : ''}
                                                        AI model flags this category as a potential infrastructure stress zone. Recommend immediate inspection.
                                                    </p>
                                                    {/* Risk score bar */}
                                                    <div className="mt-2 w-full bg-white/60 h-1.5 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${isHigh ? 'bg-red-500' : 'bg-amber-400'}`}
                                                            style={{ width: `${alert.riskScore}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* How it works */}
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200 flex flex-col justify-between gap-6">
                                <div>
                                    <h3 className="text-base font-bold text-indigo-900 mb-2">How do Predictive Insights work?</h3>
                                    <p className="text-sm text-indigo-800 leading-relaxed">
                                        Instead of waiting for critical infrastructure to break entirely, the platform clusters neighboring civic reports by category. When 2 or more reports share a category, a risk score is computed based on cluster size and severity count.
                                    </p>
                                    <p className="text-sm text-indigo-800 mt-3 leading-relaxed">
                                        This transforms public maintenance from <strong>reactive (fixing what's broken)</strong> to <strong>preventative (addressing concerns before they fail)</strong>, saving public funds and maintaining community safety.
                                    </p>
                                    {/* Live summary */}
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="bg-white/80 rounded-xl p-3 border border-indigo-100 text-center">
                                            <p className="text-2xl font-extrabold text-indigo-700">{riskAlerts.length}</p>
                                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">Active Clusters</p>
                                        </div>
                                        <div className="bg-white/80 rounded-xl p-3 border border-indigo-100 text-center">
                                            <p className="text-2xl font-extrabold text-red-600">{riskAlerts.filter(a => a.riskScore >= 60).length}</p>
                                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">High Risk Zones</p>
                                        </div>
                                    </div>
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
import React, { useState, useEffect, useRef } from 'react';
import { getIssues, upvoteIssue } from './service/api';

import Navbar       from './components/Navbar';
import LiveMap      from './components/LiveMap';
import Analytics    from './components/Analytics';
import Gamification from './components/Gamification';
import AIInsights   from './components/AIInsights';
import { UsernameModal, AIToast } from './components/UI';

// Fixes broken Leaflet default icons in Vite/webpack — side-effect import
import './utils/mapIcons';

export default function App() {
    // ── Tab routing ────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('dashboard');

    // ── Issue data ─────────────────────────────────────────────────────────
    const [issues, setIssues] = useState([]);

    // ── User profile (persisted in localStorage) ───────────────────────────
    const [userName, setUserName]       = useState(() => localStorage.getItem('hero_name')      || '');
    const [userXP, setUserXP]           = useState(() => +(localStorage.getItem('hero_xp'))     || 0);
    const [reportCount, setReportCount] = useState(() => +(localStorage.getItem('hero_reports')) || 0);
    const [voteCount, setVoteCount]     = useState(() => +(localStorage.getItem('hero_votes'))   || 0);

    // ── AI toast ───────────────────────────────────────────────────────────
    const [aiResult, setAiResult]   = useState(null);
    const [showToast, setShowToast] = useState(false);
    const toastTimer = useRef(null);

    useEffect(() => { loadIssues(); }, []);

    async function loadIssues() {
        try { setIssues(await getIssues()); }
        catch (e) { console.error('Failed to load issues:', e); }
    }

    function handleSaveName(name) {
        setUserName(name);
        localStorage.setItem('hero_name', name);
    }

    // Called by LiveMap once a report is successfully saved to the backend
    // savedIssue contains AI-assigned category + severity from Gemini
    function handleIssueCreated(savedIssue) {
        if (savedIssue?.category && savedIssue?.severity) {
            clearTimeout(toastTimer.current);
            setAiResult({ category: savedIssue.category, severity: savedIssue.severity });
            setShowToast(true);
            toastTimer.current = setTimeout(() => setShowToast(false), 7000);
        }
        const nx = userXP + 15, nr = reportCount + 1;
        setUserXP(nx); setReportCount(nr);
        localStorage.setItem('hero_xp', nx);
        localStorage.setItem('hero_reports', nr);
        loadIssues();
    }

    async function handleUpvote(id) {
        try {
            await upvoteIssue(id);
            const nx = userXP + 5, nv = voteCount + 1;
            setUserXP(nx); setVoteCount(nv);
            localStorage.setItem('hero_xp', nx);
            localStorage.setItem('hero_votes', nv);
            loadIssues();
        } catch (e) { console.error('Upvote failed:', e); }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-950">

            {!userName && <UsernameModal onSave={handleSaveName} />}
            {showToast  && <AIToast result={aiResult} onClose={() => setShowToast(false)} />}

            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userName={userName}
                userXP={userXP}
            />

            <div className="flex-1 overflow-hidden">
                {activeTab === 'dashboard' && (
                    <LiveMap
                        issues={issues}
                        onIssueCreated={handleIssueCreated}
                        onUpvote={handleUpvote}
                        userName={userName}
                        onAddReport={handleIssueCreated}
                    />
                )}
                {activeTab === 'analytics' && (
                    <Analytics issues={issues} />
                )}
                {activeTab === 'gamification' && (
                    <Gamification
                        userName={userName}
                        userXP={userXP}
                        reportCount={reportCount}
                        voteCount={voteCount}
                        issues={issues}
                    />
                )}
                {activeTab === 'insights' && (
                    <AIInsights issues={issues} />
                )}
            </div>
        </div>
    );
}

// export default app;
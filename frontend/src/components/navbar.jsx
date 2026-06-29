// src/components/Navbar.jsx
import React from 'react';
import { Landmark, Trophy } from 'lucide-react';

const TABS = [
    { id: 'dashboard',    label: 'Live Map' },
    { id: 'analytics',    label: 'Impact Analytics' },
    { id: 'gamification', label: 'Citizen Rewards' },
    { id: 'insights',     label: 'AI Risk Predictions' },
];

export default function Navbar({ activeTab, setActiveTab, userName, userXP }) {
    return (
        <>
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm shrink-0">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo — clicking goes to home/dashboard */}
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className="flex items-center gap-2.5 hover:opacity-75 transition focus:outline-none"
                    >
                        <Landmark className="h-6 w-6 text-indigo-600" />
                        <span className="font-bold text-xl tracking-tight text-slate-900">
                            Community<span className="text-indigo-600">Hero</span>
                        </span>
                    </button>

                    <nav className="hidden md:flex items-center gap-1">
                        {TABS.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                                    ${activeTab === id
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        {userName && (
                            <span className="text-xs text-slate-500 hidden sm:block">
                                Hi, <strong className="text-slate-800">{userName}</strong>
                            </span>
                        )}
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                            <Trophy className="h-3.5 w-3.5" /> {userXP} XP
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile bottom tab bar */}
            <div className="md:hidden flex bg-white border-b border-slate-100 justify-around text-xs py-2 sticky top-16 z-40">
                {[['dashboard','Map'],['analytics','Impact'],['gamification','Rewards'],['insights','AI Risk']].map(([id, l]) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`px-2 py-1 font-bold rounded ${activeTab === id ? 'text-indigo-600' : 'text-slate-400'}`}
                    >
                        {l}
                    </button>
                ))}
            </div>
        </>
    );
}
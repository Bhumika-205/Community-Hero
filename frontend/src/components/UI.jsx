// src/components/UI.jsx
import React, { useState } from 'react';
import { User, Brain, X } from 'lucide-react';

/* ── Username onboarding modal ──────────────────────────────────────────────── */
export function UsernameModal({ onSave }) {
    const [name, setName] = useState('');
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-7 w-7 text-indigo-600" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-1">Welcome to CommunityHero</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Enter your name to join the leaderboard and track your civic contributions.
                </p>
                <input
                    autoFocus
                    type="text"
                    placeholder="Your name (e.g. Amit Kumar)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim())}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 mb-4"
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

/* ── AI result toast shown after a report is submitted ──────────────────────── */
export function AIToast({ result, onClose }) {
    if (!result) return null;
    const sevColor =
        result.severity === 'High'   ? 'text-red-600' :
        result.severity === 'Medium' ? 'text-amber-600' : 'text-green-600';

    return (
        <div className="fixed bottom-6 right-6 z-[9998] bg-white border border-indigo-200 rounded-2xl shadow-xl p-4 flex items-start gap-3 max-w-xs">
            <div className="bg-indigo-100 p-2 rounded-xl shrink-0">
                <Brain className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">
                    Gemini AI classified this
                </p>
                <p className="text-sm font-bold text-slate-800">
                    Category: <span className="text-indigo-600">{result.category}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                    Severity:{' '}
                    <span className={`font-bold ${sevColor}`}>{result.severity}</span>
                    {' '}· Auto-assigned, no manual input needed
                </p>
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-slate-500 shrink-0">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
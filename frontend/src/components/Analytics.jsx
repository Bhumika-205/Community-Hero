// src/components/Analytics.jsx
import React from 'react';
import { Activity, CheckCircle2, AlertCircle, Sparkles, Brain, Tag } from 'lucide-react';
import { statusBadge } from '../utils/constants';

export default function Analytics({ issues }) {
    const total    = issues.length;
    const verified = issues.filter(i => i.status !== 'Pending').length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const highSev  = issues.filter(i => i.severity === 'High').length;
    const verPct   = total > 0 ? Math.round(verified / total * 100) : 0;

    const categoryStats = issues.reduce((a, i) => { a[i.category] = (a[i.category] || 0) + 1; return a; }, {});
    const statusStats   = issues.reduce((a, i) => { a[i.status]   = (a[i.status]   || 0) + 1; return a; }, {});

    return (
        <main className="max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto h-full flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-950">Live Impact Dashboard</h2>
                <p className="text-sm text-slate-500 mt-1">
                    All categories and severities below are AI-assigned by Gemini — never manually entered.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Reports',   val: total,    Icon: Activity,     bg: 'bg-indigo-50',  ic: 'text-indigo-600' },
                    { label: 'Verified Issues', val: verified, Icon: CheckCircle2, bg: 'bg-blue-50',    ic: 'text-blue-600' },
                    { label: 'High Priority',   val: highSev,  Icon: AlertCircle,  bg: 'bg-red-50',     ic: 'text-red-600' },
                    { label: 'Resolved',        val: resolved, Icon: Sparkles,     bg: 'bg-emerald-50', ic: 'text-emerald-600' },
                ].map(({ label, val, Icon, bg, ic }) => (
                    <div key={label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                            <p className="text-3xl font-extrabold mt-1 text-slate-900">{val}</p>
                        </div>
                        <div className={`${bg} p-3 rounded-xl ${ic}`}><Icon className="h-6 w-6" /></div>
                    </div>
                ))}
            </div>

            {/* AI classification breakdown */}
            <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5">
                <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-600" /> AI Classification Breakdown
                </h3>
                <p className="text-xs text-slate-400 mb-5">
                    Gemini AI classified every report. No citizen chose category or severity — the model inferred them from submitted text.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* By category */}
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">By Category</p>
                        {Object.keys(categoryStats).length === 0
                            ? <p className="text-sm text-slate-400">No data yet. Run seed.js or submit a report.</p>
                            : Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).map(([cat, n]) => {
                                const pct = Math.round(n / total * 100);
                                return (
                                    <div key={cat} className="mb-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                <Tag className="h-3 w-3 text-indigo-400" />{cat}
                                            </span>
                                            <span className="font-bold text-slate-900">{n} ({pct}%)</span>
                                        </div>
                                        <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>

                    {/* By severity + status */}
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">By Severity</p>
                        {[
                            { label: 'High',   n: issues.filter(i => i.severity === 'High').length,   bar: 'bg-red-500' },
                            { label: 'Medium', n: issues.filter(i => i.severity === 'Medium').length, bar: 'bg-amber-500' },
                            { label: 'Low',    n: issues.filter(i => i.severity === 'Low').length,    bar: 'bg-emerald-500' },
                        ].map(({ label, n, bar }) => (
                            <div key={label} className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold text-slate-700">{label} Severity</span>
                                    <span className="font-bold text-slate-900">{n}</span>
                                </div>
                                <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className={`${bar} h-full rounded-full transition-all`}
                                        style={{ width: `${total > 0 ? n / total * 100 : 0}%` }} />
                                </div>
                            </div>
                        ))}

                        <div className="mt-5 border-t border-slate-100 pt-4 space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Resolution Status</p>
                            {Object.entries(statusStats).map(([s, n]) => (
                                <div key={s} className="flex justify-between items-center py-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(s)}`}>{s}</span>
                                    <span className="text-sm font-bold text-slate-700">{n}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification rate bar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-700">Community Verification Rate</h3>
                    <span className="text-2xl font-extrabold text-indigo-600">{verPct}%</span>
                </div>
                <div className="bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full rounded-full transition-all"
                        style={{ width: `${verPct}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-2">{verified} of {total} issues verified or in progress</p>
            </div>
        </main>
    );
}
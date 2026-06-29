// src/components/AIInsights.jsx
import React, { useMemo } from 'react';
import { BrainCircuit, ShieldAlert, Brain, Info } from 'lucide-react';

export default function AIInsights({ issues }) {
    const riskAlerts = useMemo(() => {
        const grouped = {};
        issues.forEach(issue => {
            if (!grouped[issue.category]) grouped[issue.category] = [];
            grouped[issue.category].push(issue);
        });
        return Object.entries(grouped)
            .filter(([, arr]) => arr.length >= 2)
            .map(([category, arr]) => {
                const highCount = arr.filter(i => i.severity === 'High').length;
                const riskScore = Math.min(97, arr.length * 14 + highCount * 22);
                return { category, count: arr.length, highCount, riskScore, isHighRisk: riskScore >= 60 };
            })
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 4);
    }, [issues]);

    return (
        <main className="max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto h-full flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
                    <BrainCircuit className="h-7 w-7 text-indigo-600" /> AI Predictive Risk Forecasting
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Clusters of AI-classified reports reveal infrastructure stress zones before failure occurs.
                </p>
            </div>

            {/* How-it-works banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                <Info className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                <div className="text-xs text-indigo-800 leading-relaxed space-y-1">
                    <p>
                        <strong>How it works:</strong> Each submitted report is sent to <strong>Gemini AI</strong>, which
                        returns a <code className="bg-indigo-100 px-1 rounded">category</code> and{' '}
                        <code className="bg-indigo-100 px-1 rounded">severity</code> as JSON.
                    </p>
                    <p>
                        This page clusters those AI labels. When <strong>2+ reports share a category</strong>, a risk score
                        is computed: <code className="bg-indigo-100 px-1 rounded">score = reports × 14 + highSeverity × 22</code>.
                        Scores ≥ 60 become critical alerts.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live alerts */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                    <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-500 animate-bounce" /> Live AI Hazard Warnings
                    </h3>

                    {riskAlerts.length === 0 ? (
                        <div className="py-10 text-center">
                            <ShieldAlert className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-400">No clusters yet.</p>
                            <p className="text-xs text-slate-300 mt-1">
                                Warnings appear when 2+ AI-classified reports share a category.
                                <br />
                                Run <code className="text-indigo-400">node seed.js</code> to see this live.
                            </p>
                        </div>
                    ) : (
                        riskAlerts.map(alert => (
                            <div
                                key={alert.category}
                                className={`p-4 rounded-xl border
                                    ${alert.isHighRisk ? 'border-red-200 bg-red-50/60' : 'border-amber-200 bg-amber-50/60'}`}
                            >
                                <div className={`flex items-center justify-between text-xs font-bold uppercase mb-1
                                    ${alert.isHighRisk ? 'text-red-700' : 'text-amber-700'}`}>
                                    <span className="flex items-center gap-1">
                                        <Brain className="h-3 w-3" /> {alert.category}
                                    </span>
                                    <span>{alert.riskScore}% Risk Score</span>
                                </div>
                                <p className={`font-bold text-sm ${alert.isHighRisk ? 'text-red-950' : 'text-amber-950'}`}>
                                    {alert.count} AI-classified reports clustered
                                </p>
                                <p className={`text-xs mt-1 ${alert.isHighRisk ? 'text-red-700' : 'text-amber-700'}`}>
                                    {alert.highCount > 0
                                        ? `${alert.highCount} High-severity case${alert.highCount > 1 ? 's' : ''} flagged by Gemini. `
                                        : ''}
                                    Infrastructure stress zone — recommend municipal inspection.
                                </p>
                                <div className="mt-2 bg-white/60 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${alert.isHighRisk ? 'bg-red-500' : 'bg-amber-400'}`}
                                        style={{ width: `${alert.riskScore}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Explanation panel */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200 flex flex-col gap-5">
                    <div>
                        <h3 className="text-base font-bold text-indigo-900 mb-3">The Gemini AI Pipeline</h3>
                        <div className="space-y-3">
                            {[
                                ['1', 'Citizen submits report',  'Title & description entered — no category chosen manually.'],
                                ['2', 'Gemini analyses the text', 'Backend calls Gemini API → returns { category, severity } as JSON.'],
                                ['3', 'Auto-tagged & saved',      'Issue stored in MongoDB with AI fields. Feed shows "AI Classified" badge.'],
                                ['4', 'Cluster risk computed',    '2+ same-category reports → risk score → hazard warning appears here.'],
                            ].map(([n, title, desc]) => (
                                <div key={n} className="flex items-start gap-3">
                                    <span className="bg-indigo-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        {n}
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-900">{title}</p>
                                        <p className="text-xs text-indigo-700 mt-0.5">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live counters */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/80 rounded-xl p-3 border border-indigo-100 text-center">
                            <p className="text-2xl font-extrabold text-indigo-700">{riskAlerts.length}</p>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Active Clusters</p>
                        </div>
                        <div className="bg-white/80 rounded-xl p-3 border border-indigo-100 text-center">
                            <p className="text-2xl font-extrabold text-red-600">
                                {riskAlerts.filter(a => a.isHighRisk).length}
                            </p>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">High Risk Zones</p>
                        </div>
                    </div>

                    <div className="bg-white/80 p-4 rounded-xl border border-indigo-100">
                        <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wide">Next Generation AI Feature</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Data from municipal repair units will sync back automatically to improve future forecast accuracy.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
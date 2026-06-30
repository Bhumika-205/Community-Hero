// src/components/IssueCard.jsx
import React from 'react';
import { MapPin, ThumbsUp, User, Brain, Tag } from 'lucide-react';
import { severityBadge, statusBadge } from '../utils/constants';

function AIBadge({ category, severity }) {
    if (!category || category === 'Uncategorized') return null;
    const sevBg =
        severity === 'High'   ? 'bg-red-100 text-red-700 border-red-200' :
        severity === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                'bg-emerald-100 text-emerald-700 border-emerald-200';
    return (
        <div className="flex flex-wrap items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5">
            <Brain className="h-3 w-3 text-indigo-500 shrink-0" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">AI Classified</span>
            <span className="text-slate-300 text-xs">·</span>
            <Tag className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="text-[10px] text-slate-700 font-semibold">{category}</span>
            <span className="text-slate-300 text-xs">·</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${sevBg}`}>{severity}</span>
        </div>
    );
}

export default function IssueCard({ issue, onUpvote }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-200 transition">
            {/* Image */}
            {issue.imageUrl && (
                <div className="h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                    <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        onError={e => { e.currentTarget.parentElement.style.display = 'none'; }}
                    />
                </div>
            )}

            <div className="p-4 flex flex-col gap-2">
                {/* Severity + Status row */}
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityBadge(issue.severity)}`}>
                        {issue.severity} Priority
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(issue.status)}`}>
                        {issue.status}
                    </span>
                </div>

                <h4 className="font-bold text-slate-900">{issue.title}</h4>
                <p className="text-sm text-slate-600 line-clamp-3">{issue.description}</p>

                {/* AI badge — proof the model ran */}
                <AIBadge category={issue.category} severity={issue.severity} />

                {issue.location?.address && (
                    <p className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {issue.location.address.split(',').slice(0, 3).join(',')}
                    </p>
                )}
                {issue.reportedBy && (
                    <p className="flex items-center gap-1 text-[10px] text-slate-400">
                        <User className="h-3 w-3" /> {issue.reportedBy}
                    </p>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                    <button
                        onClick={() => onUpvote(issue._id)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1.5 rounded-lg transition"
                    >
                        <ThumbsUp className="h-3.5 w-3.5" /> Verify (+5 XP)
                    </button>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                        {issue.upvotes || 0} vote{(issue.upvotes || 0) !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </div>
    );
}
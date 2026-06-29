// src/utils/constants.js
import {
    MapPin, ThumbsUp, CheckCircle2, Activity, Trophy, ShieldAlert
} from 'lucide-react';

export const SEED_PEERS = [
    { name: 'Siddharth Nair', points: 340, badge: 'Pothole Specialist',    isUser: false },
    { name: 'Ananya Sharma',  points: 290, badge: 'Neighborhood Champion', isUser: false },
    { name: 'Rohit Verma',    points: 180, badge: 'Grid Inspector',        isUser: false },
    { name: 'Priya Patel',    points: 95,  badge: 'Local Helper',          isUser: false },
];

export const COLOR = {
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-200' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200' },
    orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200' },
};

export const getBadges = (userXP, issues, reportCount, voteCount) => [
    { id: 'first_responder', name: 'First Responder',  desc: 'Submit your first hazard report.',         icon: MapPin,       color: 'indigo',  unlocked: reportCount >= 1 },
    { id: 'candid_voter',    name: 'Candid Voter',     desc: 'Participate in 10 upvote validations.',    icon: ThumbsUp,     color: 'amber',   unlocked: voteCount >= 10 },
    { id: 'urban_catalyst',  name: 'Urban Catalyst',   desc: 'Have 3 reported issues resolved.',         icon: CheckCircle2, color: 'emerald', unlocked: issues.filter(i => i.status === 'Resolved').length >= 3 },
    { id: 'power_reporter',  name: 'Power Reporter',   desc: 'Submit 5 or more reports.',                icon: Activity,     color: 'blue',    unlocked: reportCount >= 5 },
    { id: 'community_hero',  name: 'Community Hero',   desc: 'Earn 200 XP through civic action.',        icon: Trophy,       color: 'rose',    unlocked: userXP >= 200 },
    { id: 'risk_watcher',    name: 'Risk Watcher',     desc: 'Area has 2+ High-severity AI alerts.',     icon: ShieldAlert,  color: 'orange',  unlocked: issues.filter(i => i.severity === 'High').length >= 2 },
];

export function getBadgeTitle(xp, reports) {
    if (xp >= 300)    return 'Legend Guardian';
    if (xp >= 200)    return 'Community Hero';
    if (xp >= 100)    return 'Active Citizen';
    if (reports >= 3) return 'Veteran Reporter';
    if (reports >= 1) return 'First Responder';
    return 'New Member';
}

export const severityBadge = s =>
    s === 'High'   ? 'bg-red-100 text-red-800 border-red-200' :
    s === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
    s === 'Low'    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                     'bg-slate-100 text-slate-800 border-slate-200';

export const statusBadge = s =>
    s === 'Verified'    ? 'bg-blue-100 text-blue-800' :
    s === 'In Progress' ? 'bg-indigo-100 text-indigo-800' :
    s === 'Resolved'    ? 'bg-green-100 text-green-800' :
                          'bg-zinc-100 text-zinc-800';
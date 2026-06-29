// src/components/Gamification.jsx
import React from 'react';
import { Trophy, Award } from 'lucide-react';
import { SEED_PEERS, getBadges, getBadgeTitle, COLOR } from '../utils/constants';

export default function Gamification({ userName, userXP, reportCount, voteCount, issues }) {
    const badges        = getBadges(userXP, issues, reportCount, voteCount);
    const unlockedCount = badges.filter(b => b.unlocked).length;
    const level         = Math.floor(userXP / 100) + 1;
    const xpInLevel     = userXP % 100;

    const leaderboard = [
        ...SEED_PEERS,
        { name: `${userName || 'You'} (You)`, points: userXP, badge: getBadgeTitle(userXP, reportCount), isUser: true },
    ].sort((a, b) => b.points - a.points);

    return (
        <main className="max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto h-full flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-950">Citizen XP &amp; Gamified Rewards</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Earn Karma Experience Points by reporting issues and helping verify community concerns.
                </p>
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
                            <div
                                className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${xpInLevel}%` }}
                            />
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
                            <div
                                key={user.name}
                                className={`flex items-center justify-between p-3 rounded-lg border transition
                                    ${user.isUser ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-extrabold text-sm w-6
                                        ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300'}`}>
                                        #{idx + 1}
                                    </span>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{user.name}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold">{user.badge}</p>
                                    </div>
                                </div>
                                <span className="font-extrabold text-sm text-indigo-600">{user.points} XP</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-slate-950 flex items-center gap-1.5">
                        <Award className="h-5 w-5 text-indigo-600" /> Guardian Badges
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">{unlockedCount} / {badges.length} unlocked</span>
                </div>
                <p className="text-xs text-slate-400 mb-5">Badges unlock automatically based on your civic activity.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {badges.map(badge => {
                        const c    = COLOR[badge.color];
                        const Icon = badge.icon;
                        return (
                            <div
                                key={badge.id}
                                className={`p-4 border rounded-xl flex items-start gap-3 transition
                                    ${badge.unlocked
                                        ? `${c.bg} ${c.border} shadow-sm`
                                        : 'bg-slate-50 border-slate-200 opacity-50 grayscale'}`}
                            >
                                <div className={`p-2.5 rounded-lg shrink-0 ${badge.unlocked ? `${c.bg} ${c.text}` : 'bg-slate-100 text-slate-400'}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-sm text-slate-800">{badge.name}</span>
                                        {badge.unlocked && (
                                            <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
                                                Unlocked
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">{badge.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
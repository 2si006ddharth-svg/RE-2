'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clock, Flame, Award, AlertCircle, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';

export default function LoyaltyCountdownCard() {
  const { user, loyalty, refreshLoyalty, refreshUser } = useAuth();
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  if (!user) return null;

  const isRegular = loyalty?.isRegular || false;
  const daysLeft = loyalty?.daysRemaining ?? -1;
  const streak = loyalty?.streakCount || 0;
  const discountPercent = loyalty?.discountPercent || 0;
  const hasHistory = !!loyalty?.lastPurchaseAt;

  // Percentage of window remaining (10 days total)
  const windowProgress = daysLeft > 0 ? Math.min(100, Math.max(0, (daysLeft / 10) * 100)) : 0;

  const handleSimulateTime = async (days: number) => {
    setSimulating(true);
    setSimMessage(null);
    try {
      const res = await fetch('/api/dev/simulate-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimMessage(data.message);
        await refreshLoyalty();
        await refreshUser();
      } else {
        setSimMessage(data.error || 'Failed to simulate time');
      }
    } catch {
      setSimMessage('Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-indigo-800/40 relative overflow-hidden">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Side: Status Info */}
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            {isRegular ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Regular Customer
              </span>
            ) : hasHistory ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                Lapsed Status
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Award className="w-3.5 h-3.5" />
                New Member
              </span>
            )}

            {streak > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                Streak: {streak} Order{streak > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isRegular ? (
                <>You save <span className="text-amber-400">{discountPercent}%</span> on all orders</>
              ) : hasHistory ? (
                <>Win your <span className="text-amber-400">10% discount</span> back</>
              ) : (
                <>Unlock your <span className="text-amber-400">10% discount</span></>
              )}
            </h2>
            <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
              {isRegular
                ? `Every order resets your 10-day timer. Build your streak up to 6 orders to unlock 20% off!`
                : hasHistory
                ? `Your 10-day window expired. Complete any purchase to immediately regain Regular Customer status.`
                : `Place your first order to unlock the 10-Day Regular Customer loyalty discount automatically.`}
            </p>
          </div>

          {/* Streak Tiers Roadmap */}
          <div className="pt-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-2">
              Streak Tiers
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div
                className={`p-2 rounded-xl border ${
                  streak >= 1 && streak <= 2 && isRegular
                    ? 'bg-indigo-600/30 border-amber-400 text-white font-bold ring-1 ring-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <div className="font-semibold text-amber-300">10% OFF</div>
                <div className="text-[11px] text-slate-400">Streak 1–2</div>
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  streak >= 3 && streak <= 5 && isRegular
                    ? 'bg-indigo-600/30 border-amber-400 text-white font-bold ring-1 ring-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <div className="font-semibold text-amber-300">15% OFF</div>
                <div className="text-[11px] text-slate-400">Streak 3–5</div>
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  streak >= 6 && isRegular
                    ? 'bg-indigo-600/30 border-amber-400 text-white font-bold ring-1 ring-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <div className="font-semibold text-amber-300">20% OFF</div>
                <div className="text-[11px] text-slate-400">Streak 6+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Circular Countdown Ring / Progress */}
        <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl p-6 border border-white/10 w-full lg:w-72 shrink-0">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-white/10"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className={
                  daysLeft <= 2 && isRegular
                    ? 'text-rose-500'
                    : isRegular
                    ? 'text-amber-400'
                    : 'text-slate-600'
                }
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={
                  2 * Math.PI * 40 * (1 - (isRegular ? windowProgress / 100 : 0))
                }
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {isRegular ? (
                <>
                  <span className="text-3xl font-black text-white">{daysLeft}</span>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Day{daysLeft === 1 ? '' : 's'} Left
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-6 h-6 text-slate-500 mb-1" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {hasHistory ? 'Expired' : 'Start Now'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 text-center">
            {isRegular ? (
              <span className="text-xs font-medium text-slate-300 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Resets to 10 days on every order
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-300">
                Next purchase starts your timer!
              </span>
            )}
          </div>

          {/* Quick Dev Simulation Controls for effortless verification */}
          <div className="mt-5 w-full pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block text-center">
              ⚡ Demo Simulation Controls
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSimulateTime(11)}
                disabled={simulating || !hasHistory}
                className="flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition disabled:opacity-50"
                title="Fast forward 11 days to test discount expiration"
              >
                Simulate 11 Days
              </button>
              <button
                onClick={() => handleSimulateTime(7)}
                disabled={simulating || !hasHistory}
                className="flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition disabled:opacity-50"
                title="Fast forward 7 days to trigger reminder"
              >
                Simulate 7 Days
              </button>
            </div>
            {simMessage && (
              <p className="text-[11px] text-amber-300 text-center leading-tight">
                {simMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Clock, Flame, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export default function LoyaltyBanner() {
  const { user, loyalty, loading } = useAuth();

  if (loading) return null;

  // Case 1: Logged-in Regular customer with active discount
  if (user && loyalty?.isRegular) {
    const daysLeft = loyalty.daysRemaining;
    const isUrgent = daysLeft <= 2;

    return (
      <div
        className={`w-full py-2.5 px-4 text-sm font-medium transition-colors ${
          isUrgent
            ? 'bg-amber-500 text-slate-950 shadow-inner'
            : 'bg-indigo-900 text-indigo-50 border-b border-indigo-800'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              Streak {loyalty.streakCount}
            </span>
            <span>
              <strong>Regular Customer Status:</strong> You enjoy an automatic{' '}
              <span className="underline font-bold">{loyalty.discountPercent}% OFF</span> on all orders!
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4" />
              <span>
                {daysLeft === 1
                  ? '⚠️ Last day to keep your discount!'
                  : `${daysLeft} days left to keep your discount`}
              </span>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-bold bg-white text-slate-950 px-3 py-1 rounded-md hover:bg-slate-100 transition shadow-sm"
            >
              Shop & Keep Discount <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Logged-in customer whose status has lapsed/expired
  if (user && loyalty && !loyalty.isRegular && loyalty.lastPurchaseAt) {
    return (
      <div className="w-full py-2.5 px-4 text-sm font-medium bg-rose-900/90 text-rose-50 border-b border-rose-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>
              <strong>Discount Expired:</strong> It&apos;s been more than 10 days since your last order.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-200">Win your 10% discount back on your next order!</span>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-bold bg-amber-400 text-slate-950 px-3 py-1 rounded-md hover:bg-amber-300 transition"
            >
              Win It Back <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Guest or new user without purchase history
  return (
    <div className="w-full py-2 px-4 text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-indigo-100 border-b border-indigo-700/50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>
            <strong>10-Day Loyalty Strategy:</strong> Buy once every 10 days and automatically save up to <strong>20%</strong> on every order.
          </span>
        </div>
        <Link
          href="/loyalty"
          className="text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-1"
        >
          See how it works <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

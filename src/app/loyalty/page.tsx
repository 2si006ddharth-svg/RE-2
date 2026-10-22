'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Clock,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'How does the 10-Day Regular Customer Loyalty Discount work?',
    a: 'Whenever you complete any paid purchase, you automatically become a "Regular Customer" and start a rolling 10-day timer. On all subsequent orders placed within that 10-day window, you receive an automatic discount at checkout with no promo codes required.',
  },
  {
    q: 'What happens if I miss the 10-day window?',
    a: 'If 10 full days elapse without an order, your Regular status and discount temporarily expire. However, you can win it back immediately! Your very next order reactivates your Regular status and starts a fresh 10-day timer.',
  },
  {
    q: 'How do Streak Tiers work?',
    a: 'Every qualifying purchase placed within the 10-day window increases your Streak count. Streak 1–2 gets 10% off; Streak 3–5 gets 15% off; Streak 6 and beyond gets 20% off. The maximum allowable discount is strictly capped at 25%.',
  },
  {
    q: 'Does each new order reset the 10-day clock?',
    a: 'Yes! Every paid order immediately resets the 10-day timer from the exact timestamp of that purchase, giving you another full 10 days to make your next purchase and continue your streak.',
  },
  {
    q: 'Do cancelled or refunded orders count toward my streak?',
    a: 'No. Cancelled or refunded orders do not count toward your Regular Customer status. If an order is refunded, your loyalty status is recalculating automatically based on your remaining valid paid orders.',
  },
  {
    q: 'Will I receive reminders before my discount expires?',
    a: 'Yes. We send polite reminder notifications on Day 7 and Day 9 of inactivity both in your account portal and simulated email, ensuring you never miss a deadline by accident.',
  },
];

export default function LoyaltyExplainerPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-indigo-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Flame className="w-4 h-4 fill-amber-400" />
            Fair & Transparent Loyalty
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
            The Regular Customer Loyalty Blueprint
          </h1>

          <p className="text-indigo-100 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            We believe customers who return consistently deserve effortless, automatic rewards. No points to convert, no expiry vouchers — just real cash savings every 10 days.
          </p>
        </div>
      </section>

      {/* Streak Tiers Table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Automatic Streak Tiers
          </h2>
          <p className="text-slate-500 text-sm">
            Discounts scale dynamically based on consecutive 10-day order cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm relative space-y-4">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Tier 1
            </span>
            <div className="space-y-1">
              <span className="text-4xl font-black text-slate-900">10% OFF</span>
              <span className="block text-xs font-semibold text-slate-500">Streak 1–2 Orders</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unlocked on your very first reorder. Perfect for casual recurring shoppers.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 10-day rolling reset
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-md relative space-y-4">
            <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
              Most Popular
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Tier 2
            </span>
            <div className="space-y-1">
              <span className="text-4xl font-black text-slate-900">15% OFF</span>
              <span className="block text-xs font-semibold text-slate-500">Streak 3–5 Orders</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rewarded after 3 consecutive 10-day cycles. Significant recurring savings.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 10-day rolling reset
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-amber-400 shadow-md relative space-y-4">
            <span className="absolute -top-3 right-6 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
              VIP Level
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
              Tier 3
            </span>
            <div className="space-y-1">
              <span className="text-4xl font-black text-slate-900">20% OFF</span>
              <span className="block text-xs font-semibold text-slate-500">Streak 6+ Orders</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The premier reward for our top regulars. Maximum recurring discount.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 10-day rolling reset
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-sm">
            Everything you need to know about qualifying, expiring, and winning back discounts.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-indigo-600 transition text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-8 sm:p-12 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-black text-indigo-950">
            Start saving on your next purchase today
          </h3>
          <p className="text-indigo-700 text-sm max-w-lg mx-auto">
            Browse our catalog, place your order, and your 10-day loyalty countdown activates right away.
          </p>
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl text-sm shadow-md transition"
            >
              Explore Shop <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

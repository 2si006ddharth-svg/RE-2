'use client';

import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Users,
  Repeat,
  Percent,
  AlertTriangle,
  Play,
  TrendingUp,
  Flame,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';

interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalDiscountGiven: number;
  recentSales: number;
  recentOrders: number;
  totalCustomers: number;
  regularCustomers: number;
  aboutToLose: number;
  repeatRate: number;
  salesByDay: Record<string, number>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningCron, setRunningCron] = useState(false);
  const [cronMessage, setCronMessage] = useState<string | null>(null);

  const fetchStats = () => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTriggerCron = async () => {
    setRunningCron(true);
    setCronMessage(null);
    try {
      const res = await fetch('/api/dev/simulate-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerCron: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setCronMessage(
          `Cron executed: ${data.cronResult.expiredCount} expired, ${data.cronResult.reminderCount} reminders sent out of ${data.cronResult.totalChecked} customers.`
        );
        fetchStats();
      } else {
        setCronMessage('Cron failed to trigger');
      }
    } catch {
      setCronMessage('Execution error');
    } finally {
      setRunningCron(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded-xl w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const regularPercent = stats.totalCustomers > 0
    ? Math.round((stats.regularCustomers / stats.totalCustomers) * 100)
    : 0;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Loyalty Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry on customer retention, 10-day streak windows, and revenue impact.
          </p>
        </div>

        {/* Trigger Cron Manual Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerCron}
            disabled={runningCron}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm disabled:opacity-50"
          >
            {runningCron ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            Run Daily Loyalty Cron
          </button>
        </div>
      </div>

      {cronMessage && (
        <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-700 text-indigo-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{cronMessage}</span>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white block">
            ${stats.totalSales.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 block font-medium">
            {stats.totalOrders} paid order{stats.totalOrders === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Loyalty Savings Given</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-amber-300 block">
            ${stats.totalDiscountGiven.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 block font-medium">
            Server-verified discount rewards
          </span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Regular Customers</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-white block">
            {stats.regularCustomers} <span className="text-lg text-slate-400">/ {stats.totalCustomers}</span>
          </span>
          <span className="text-xs text-emerald-400 block font-medium">
            {regularPercent}% of customer base active
          </span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Repeat Purchase Rate</span>
            <Repeat className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-3xl font-black text-indigo-300 block">
            {stats.repeatRate}%
          </span>
          <span className="text-xs text-slate-400 block font-medium">
            Customers with &gt;1 paid order
          </span>
        </div>
      </div>

      {/* Critical Attention Alert: Customers About to Lose Status */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Status Expiration Risk ({stats.aboutToLose} customer{stats.aboutToLose === 1 ? '' : 's'})
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              These customers are on Day 8 or 9 of their 10-day window. Automated reminder notifications have been dispatched to encourage timely repeat purchases.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs uppercase tracking-wider font-bold text-amber-300 block">
            Urgent Retention Target
          </span>
          <span className="text-3xl font-black text-amber-400">
            {stats.aboutToLose} At Risk
          </span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Base Composition */}
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Customer Loyalty Distribution
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-emerald-400">Regular Customers (Active 10-Day Window)</span>
                <span className="text-white">{stats.regularCustomers} ({regularPercent}%)</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${regularPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-400">Lapsed / First-Time Shoppers</span>
                <span className="text-white">
                  {stats.totalCustomers - stats.regularCustomers} ({100 - regularPercent}%)
                </span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 transition-all duration-500"
                  style={{ width: `${100 - regularPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
            💡 <strong>Strategy Insight:</strong> The 10-day window creates urgency without friction. Notice how our high streak customers contribute disproportionately to recurring volume!
          </div>
        </div>

        {/* Sales by Date Breakdown */}
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Recent Sales Activity (Last 30 Days)
          </h3>

          <div className="space-y-3">
            {Object.keys(stats.salesByDay).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No orders recorded in the last 30 days.
              </p>
            ) : (
              Object.entries(stats.salesByDay)
                .slice(-5)
                .map(([day, amount]) => (
                  <div
                    key={day}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                  >
                    <span className="text-slate-300 font-mono">{day}</span>
                    <span className="font-bold text-emerald-400">${amount.toFixed(2)}</span>
                  </div>
                ))
            )}
          </div>

          <div className="pt-2 text-right">
            <span className="text-[11px] text-slate-500">
              Aggregated from paid orders in UTC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

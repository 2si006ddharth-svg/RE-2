'use client';

import React, { useEffect, useState } from 'react';
import { Users, Flame, Clock, CheckCircle2, AlertCircle, Award, FastForward } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  loyalty: {
    isRegular: boolean;
    discountPercent: number;
    daysRemaining: number;
    streakCount: number;
    expiresAt: string | null;
    lastPurchaseAt: string | null;
  };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCustomers = () => {
    fetch('/api/admin/customers')
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) setCustomers(data.customers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSimulateAgeCustomer = async (userId: string, days: number) => {
    setSimulatingId(userId);
    setMessage(null);
    try {
      const res = await fetch('/api/dev/simulate-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, days }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Customer aged by ${days} days. Loyalty status updated.`);
        fetchCustomers();
      } else {
        setMessage(data.error || 'Simulation failed');
      }
    } catch {
      setMessage('Error');
    } finally {
      setSimulatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Customer Loyalty Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time tracking of rolling 10-day windows, streaks, and expiration dates.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-200 text-xs font-semibold">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Status</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Streak</th>
                <th className="p-4">Window Remaining</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4 text-right">Age Simulator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {customers.map((c) => {
                const isRegular = c.loyalty.isRegular;
                const daysLeft = c.loyalty.daysRemaining;

                return (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-4">
                      <strong className="block text-white font-bold">{c.name}</strong>
                      <span className="text-[11px] text-slate-500">{c.email}</span>
                    </td>
                    <td className="p-4">
                      {isRegular ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Regular
                        </span>
                      ) : c.loyalty.lastPurchaseAt ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <AlertCircle className="w-3 h-3" /> Lapsed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/20 text-slate-400 border border-slate-500/30">
                          <Award className="w-3 h-3" /> New
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-black text-amber-300 text-sm">
                      {isRegular ? `${c.loyalty.discountPercent}%` : '0%'}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-200">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        {c.loyalty.streakCount}
                      </span>
                    </td>
                    <td className="p-4">
                      {isRegular ? (
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            daysLeft <= 2 ? 'text-rose-400 font-bold' : 'text-slate-300'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {daysLeft} day{daysLeft === 1 ? '' : 's'} left
                        </span>
                      ) : (
                        <span className="text-slate-500">Expired</span>
                      )}
                    </td>
                    <td className="p-4">
                      <strong className="block text-white font-bold">
                        ${c.totalSpent.toFixed(2)}
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        {c.totalOrders} order{c.totalOrders === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleSimulateAgeCustomer(c.id, 11)}
                        disabled={simulatingId === c.id || !c.loyalty.lastPurchaseAt}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold transition disabled:opacity-30 inline-flex items-center gap-1"
                        title="Simulate 11 days passing for this customer"
                      >
                        <FastForward className="w-3 h-3" /> +11 Days
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

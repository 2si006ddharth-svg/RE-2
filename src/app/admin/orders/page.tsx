'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  userId: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  user: { name: string; email: string };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    product: { name: string };
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    fetch(`/api/admin/orders${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          `Order #${orderId.slice(-6)} set to "${newStatus}". Customer loyalty status automatically recalculated!`
        );
        fetchOrders();
      } else {
        setMessage(data.error || 'Failed to update order status');
      }
    } catch {
      setMessage('Update error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Order Fulfillment & Status Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Refunds and cancellations trigger automatic loyalty status resyncs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['all', 'paid', 'refunded', 'cancelled', 'pending'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-950 rounded-3xl border border-slate-800 p-8 space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No orders matching filter</h3>
          <p className="text-xs text-slate-500">Try selecting a different status filter.</p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4">
                    <strong className="block text-white font-mono font-bold">
                      #{o.id.slice(-8).toUpperCase()}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <strong className="block text-slate-200 font-semibold">{o.user.name}</strong>
                    <span className="text-[11px] text-slate-500">{o.user.email}</span>
                  </td>
                  <td className="p-4 text-[11px] text-slate-400">
                    {o.items.length} item{o.items.length > 1 ? 's' : ''}
                  </td>
                  <td className="p-4">
                    {o.discountAmount > 0 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {o.discountPercent}% (-${o.discountAmount.toFixed(2)})
                      </span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="p-4 font-black text-white text-sm">
                    ${o.total.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        o.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : o.status === 'refunded'
                          ? 'bg-rose-500/20 text-rose-400'
                          : o.status === 'cancelled'
                          ? 'bg-slate-500/20 text-slate-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {o.status === 'paid' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'refunded')}
                          disabled={updatingId === o.id}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold transition disabled:opacity-50"
                          title="Refund this order (resyncs customer loyalty status)"
                        >
                          Refund
                        </button>
                      )}
                      {o.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'paid')}
                          disabled={updatingId === o.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition"
                        >
                          Mark Paid
                        </button>
                      )}
                      {o.status !== 'cancelled' && o.status !== 'refunded' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'cancelled')}
                          disabled={updatingId === o.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-bold transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

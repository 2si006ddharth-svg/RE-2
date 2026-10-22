'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoyaltyCountdownCard from '@/components/LoyaltyCountdownCard';
import {
  Package,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string; imageUrl: string };
}

interface Order {
  id: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  items: OrderItem[];
}

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export default function AccountPage() {
  const { user, loyalty, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'notifications'>('orders');

  const loadData = () => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));

    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Customer Portal
        </h2>
        <p className="text-slate-600 text-sm">
          Please sign in to view your loyalty status, countdown timer, and order history.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl text-sm transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-white border border-slate-200 text-slate-800 font-bold py-3 px-6 rounded-xl text-sm transition"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Member ID: <span className="font-mono text-slate-700">{user.id.slice(-8)}</span> • {user.email}
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition"
        >
          <ShoppingBag className="w-4 h-4" /> Shop to Keep Streak
        </Link>
      </div>

      {/* Prominent Loyalty Card with Visual Countdown */}
      <LoyaltyCountdownCard />

      {/* Tabs: Orders & Notifications */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`text-sm font-bold flex items-center gap-2 pb-3 -mb-3 transition border-b-2 ${
                activeTab === 'orders'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Order History ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`text-sm font-bold flex items-center gap-2 pb-3 -mb-3 transition border-b-2 ${
                activeTab === 'notifications'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications ({notifications.filter((n) => !n.readAt).length} new)</span>
            </button>
          </div>

          {activeTab === 'notifications' && notifications.some((n) => !n.readAt) && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No orders yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Place your first order to unlock the 10-day Regular Customer discount and start your streak!
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 underline"
                >
                  Start shopping now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {order.discountAmount > 0 && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            {order.discountPercent}% Discount (-${order.discountAmount.toFixed(2)})
                          </span>
                        )}

                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            order.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'refunded'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 font-medium">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="text-slate-900 font-semibold">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-sm">
                      <span className="text-xs text-slate-500 font-medium">
                        Total Paid:
                      </span>
                      <span className="text-base font-black text-slate-900">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
                <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No notifications</h3>
                <p className="text-xs text-slate-500">
                  You will receive reminders on Day 7 and Day 9 to keep your discount active.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition flex items-start gap-3 ${
                    !n.readAt
                      ? 'bg-indigo-50/70 border-indigo-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

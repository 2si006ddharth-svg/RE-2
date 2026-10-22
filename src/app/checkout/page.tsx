'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Flame,
  ArrowRight,
  Lock,
  Loader2,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loyalty, refreshLoyalty, refreshUser } = useAuth();
  const { items, clearCart, subtotal, discountPercent, discountAmount, total } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Mock Form State
  const [cardName, setCardName] = useState('Alex Active');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Your bag is empty</h2>
        <p className="text-slate-500">Add products to your cart before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-indigo-600 font-bold underline"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // Not logged in prompt
  if (!user && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Sign In to Checkout
          </h1>
          <p className="text-slate-600 text-sm">
            Sign in to automatically apply your 10-day Regular Customer discount and record your loyalty streak.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            href="/login?redirect=/checkout"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition shadow-sm"
          >
            Sign In
          </Link>
          <Link
            href="/register?redirect=/checkout"
            className="bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-6 rounded-xl text-sm border border-slate-200 transition"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  // Order Confirmed Screen
  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Completed Successfully
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Thank You For Your Order!
          </h1>
          <p className="text-slate-600 text-sm">
            Order Reference: <strong className="text-slate-900">#{confirmedOrder.id.slice(-8).toUpperCase()}</strong>
          </p>
        </div>

        {/* Loyalty Status Update Announcement */}
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl text-left border border-indigo-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-lg">
              Regular Customer Status Updated!
            </h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Your payment just reset your 10-day rolling timer. You are guaranteed the Regular Customer loyalty discount on all future orders placed within the next 10 days!
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">Rolling Timer</span>
              <span className="text-xl font-black text-amber-300">10 Days Left</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">Next Order Discount</span>
              <span className="text-xl font-black text-emerald-400">
                {confirmedOrder.discountPercent > 0 ? `${confirmedOrder.discountPercent}% OFF` : '10% OFF'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-md transition"
          >
            View Loyalty Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-xl text-sm border border-slate-200 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete checkout');
      }

      setConfirmedOrder(data.order);
      clearCart();
      await refreshLoyalty();
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Server-authoritative discount verification & mock payment gateway.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Payment & Shipping Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Payment Method (Mock Stripe Sandbox)
              </h2>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                Test Mode
              </span>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Expiration (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-base shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Authorizing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Pay ${total.toFixed(2)} Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          <h2 className="text-lg font-black text-slate-900 tracking-tight border-b border-slate-100 pb-3">
            Items in Order ({items.length})
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 text-sm">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-900 block truncate text-xs">
                    {item.name}
                  </span>
                  <span className="text-slate-400 text-xs">Qty: {item.quantity}</span>
                </div>
                <span className="font-bold text-slate-900 text-xs">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs">
                <span>Regular Discount ({discountPercent}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Delivery</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-base font-black text-slate-900">Total</span>
              <span className="text-2xl font-black text-slate-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

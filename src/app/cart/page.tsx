'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Flame,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function CartPage() {
  const { user, loyalty } = useAuth();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    discountPercent,
    discountAmount,
    total,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Explore our curated products and start building your 10-day loyalty streak today.
          </p>
        </div>
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-md shadow-indigo-200 transition"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Shopping Bag ({items.length} item{items.length > 1 ? 's' : ''})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
        >
          Clear bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-5"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-24 rounded-xl object-cover bg-slate-100 shrink-0"
              />

              <div className="flex-1 text-center sm:text-left space-y-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-bold text-slate-900 hover:text-indigo-600 transition text-base"
                >
                  {item.name}
                </Link>
                <div className="text-sm font-semibold text-slate-600">
                  ${item.price.toFixed(2)} each
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-inner">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition text-xs"
                >
                  -
                </button>
                <span className="px-3 py-1.5 font-bold text-xs text-slate-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition text-xs"
                >
                  +
                </button>
              </div>

              {/* Line Total */}
              <div className="text-right sm:w-24">
                <span className="block font-black text-slate-900 text-base">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.productId)}
                className="text-slate-400 hover:text-rose-600 p-2 transition"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary & Loyalty Discount Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          <h2 className="text-lg font-black text-slate-900 tracking-tight border-b border-slate-100 pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>

            {/* Loyalty Discount Applied */}
            {discountPercent > 0 ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex justify-between items-center text-emerald-800 font-bold">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Regular Customer Discount ({discountPercent}%)
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  You saved ${discountAmount.toFixed(2)} on this order!
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-indigo-700">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Regular Loyalty Perk
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Completing this purchase activates your 10-day Regular Customer status, unlocking 10% off your future orders!
                </p>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-base font-black text-slate-900 block">Total Due</span>
                {discountAmount > 0 && (
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Includes all loyalty savings
                  </span>
                )}
              </div>
              <span className="text-2xl font-black text-slate-900">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-sm shadow-lg shadow-indigo-200 transition"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Server-Verified Checkout • 100% Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  Sparkles,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Flame,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

function ProductDetailContent() {
  const params = useParams();
  const id = params?.id as string;
  const { user, loyalty } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) setProduct(data.product);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-500">The requested item is no longer available.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-indigo-600 font-bold underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const discountPercent = loyalty?.isRegular ? loyalty.discountPercent : 0;
  const discountedPrice = discountPercent > 0
    ? Math.round((product.price * (1 - discountPercent / 100)) * 100) / 100
    : null;

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Image */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 overflow-hidden shadow-sm">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg">
                {discountPercent}% OFF FOR REGULARS
              </span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
            <div className="flex items-baseline gap-3">
              {discountedPrice ? (
                <>
                  <span className="text-3xl font-black text-slate-900">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-lg text-slate-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Save ${(product.price - discountedPrice).toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-black text-slate-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Standard Retail Price
                  </span>
                </>
              )}
            </div>

            {loyalty?.isRegular ? (
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Regular Member discount applied automatically!
              </p>
            ) : (
              <p className="text-xs text-indigo-700 flex items-center gap-1.5 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Purchase this product to activate your 10% Regular Customer Discount!
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity and CTA */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-sm text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className={`flex-1 font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Check className="w-3.5 h-3.5" /> In stock ({product.stock} units available)
              </span>
              <span>Fast 2-day delivery</span>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">Free Shipping</span>
              <span className="text-[10px] text-slate-400">On all loyalty orders</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <RotateCcw className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">30-Day Returns</span>
              <span className="text-[10px] text-slate-400">Zero hassle refund</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">Verified Authentic</span>
              <span className="text-[10px] text-slate-400">Direct manufacturer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="text-sm font-medium">Loading product details...</p>
        </div>
      }
    >
      <ProductDetailContent />
    </React.Suspense>
  );
}

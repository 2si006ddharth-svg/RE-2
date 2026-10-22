'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: { id: string; name: string; price: number; imageUrl: string }, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemCount: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { loyalty } = useAuth();

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('loyalshop_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('loyalshop_cart', JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  const addItem = (product: { id: string; name: string; price: number; imageUrl: string }, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity,
        },
      ];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = Math.round(rawSubtotal * 100) / 100;

  // Discount percentage from user's current loyalty status
  const discountPercent = loyalty?.isRegular ? loyalty.discountPercent : 0;
  const rawDiscount = (subtotal * discountPercent) / 100;
  const discountAmount = Math.round(rawDiscount * 100) / 100;
  const total = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItemCount,
        subtotal,
        discountPercent,
        discountAmount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

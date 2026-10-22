/**
 * LoyalShop Discount Engine
 * 
 * Pure, well-tested module containing all loyalty discount business logic.
 * No side effects — all functions are deterministic given their inputs.
 */

import { DEFAULT_CONFIG } from './config';

export interface StreakTier {
  min: number;
  max: number;
  discount: number;
}

export interface LoyaltyInput {
  lastPurchaseAt: Date | null;
  streakCount: number;
  now?: Date; // For testing — defaults to current time
}

export interface LoyaltyResult {
  isRegular: boolean;
  discountPercent: number;
  daysRemaining: number;
  streakCount: number;
  expiresAt: Date | null;
}

export interface DiscountCalculation {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

/**
 * Get the discount percentage for a given streak count.
 */
export function getStreakDiscount(
  streakCount: number,
  tiers: readonly StreakTier[] = DEFAULT_CONFIG.STREAK_TIERS,
  maxCap: number = DEFAULT_CONFIG.MAX_DISCOUNT_CAP
): number {
  if (streakCount <= 0) return 0;

  for (const tier of tiers) {
    if (streakCount >= tier.min && streakCount <= tier.max) {
      return Math.min(tier.discount, maxCap);
    }
  }

  // If no tier matched (shouldn't happen with Infinity), use base
  return Math.min(DEFAULT_CONFIG.BASE_DISCOUNT, maxCap);
}

/**
 * Calculate how many days remain before the loyalty status expires.
 * Returns 0 if already expired, -1 if no purchase history.
 */
export function getDaysRemaining(
  lastPurchaseAt: Date | null,
  windowDays: number = DEFAULT_CONFIG.REGULAR_WINDOW_DAYS,
  now: Date = new Date()
): number {
  if (!lastPurchaseAt) return -1;

  const expiresAt = new Date(lastPurchaseAt.getTime() + windowDays * 24 * 60 * 60 * 1000);
  const remaining = expiresAt.getTime() - now.getTime();
  const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));

  return Math.max(0, days);
}

/**
 * Calculate the expiration date given a purchase date.
 */
export function getExpirationDate(
  purchaseDate: Date,
  windowDays: number = DEFAULT_CONFIG.REGULAR_WINDOW_DAYS
): Date {
  return new Date(purchaseDate.getTime() + windowDays * 24 * 60 * 60 * 1000);
}

/**
 * Determine if a customer qualifies as Regular based on their last purchase.
 */
export function isRegularCustomer(
  lastPurchaseAt: Date | null,
  windowDays: number = DEFAULT_CONFIG.REGULAR_WINDOW_DAYS,
  now: Date = new Date()
): boolean {
  if (!lastPurchaseAt) return false;
  return getDaysRemaining(lastPurchaseAt, windowDays, now) > 0;
}

/**
 * Core loyalty status calculation.
 * Given a customer's last purchase and streak, determines their full loyalty state.
 */
export function calculateLoyaltyStatus(
  input: LoyaltyInput,
  windowDays: number = DEFAULT_CONFIG.REGULAR_WINDOW_DAYS,
  tiers: readonly StreakTier[] = DEFAULT_CONFIG.STREAK_TIERS,
  maxCap: number = DEFAULT_CONFIG.MAX_DISCOUNT_CAP
): LoyaltyResult {
  const now = input.now || new Date();

  // No purchase history — not regular
  if (!input.lastPurchaseAt) {
    return {
      isRegular: false,
      discountPercent: 0,
      daysRemaining: -1,
      streakCount: 0,
      expiresAt: null,
    };
  }

  const daysRemaining = getDaysRemaining(input.lastPurchaseAt, windowDays, now);
  const regular = daysRemaining > 0;

  if (!regular) {
    // Expired — streak resets
    return {
      isRegular: false,
      discountPercent: 0,
      daysRemaining: 0,
      streakCount: 0,
      expiresAt: getExpirationDate(input.lastPurchaseAt, windowDays),
    };
  }

  // Active regular customer
  const discountPercent = getStreakDiscount(input.streakCount, tiers, maxCap);

  return {
    isRegular: true,
    discountPercent,
    daysRemaining,
    streakCount: input.streakCount,
    expiresAt: getExpirationDate(input.lastPurchaseAt, windowDays),
  };
}

/**
 * Calculate the discount amount for a given subtotal.
 * This is the server-side authoritative calculation.
 */
export function calculateDiscount(
  subtotal: number,
  discountPercent: number,
  maxCap: number = DEFAULT_CONFIG.MAX_DISCOUNT_CAP
): DiscountCalculation {
  const effectivePercent = Math.min(Math.max(discountPercent, 0), maxCap);
  const discountAmount = Math.round((subtotal * effectivePercent) / 100 * 100) / 100;
  const total = Math.round((subtotal - discountAmount) * 100) / 100;

  return {
    subtotal,
    discountPercent: effectivePercent,
    discountAmount,
    total: Math.max(0, total),
  };
}

/**
 * Determine the new streak count after a purchase.
 * If the customer is still within the window, increment streak.
 * If they've lapsed, reset to 1 (this purchase starts a new streak).
 */
export function calculateNewStreak(
  lastPurchaseAt: Date | null,
  currentStreak: number,
  windowDays: number = DEFAULT_CONFIG.REGULAR_WINDOW_DAYS,
  now: Date = new Date()
): number {
  if (!lastPurchaseAt) return 1; // First purchase

  const isStillRegular = isRegularCustomer(lastPurchaseAt, windowDays, now);

  if (isStillRegular) {
    return currentStreak + 1;
  }

  // Lapsed — start new streak
  return 1;
}

/**
 * Check if a reminder notification should be sent.
 * Returns the reminder type or null.
 */
export function shouldSendReminder(
  lastPurchaseAt: Date | null,
  windowDays: number = DEFAULT_CONFIG.REGULAR_WINDOW_DAYS,
  reminderDays: readonly number[] = DEFAULT_CONFIG.REMINDER_DAYS,
  now: Date = new Date()
): number | null {
  if (!lastPurchaseAt) return null;

  const diffMs = now.getTime() - lastPurchaseAt.getTime();
  const daysSincePurchase = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  // Only send if still within window but approaching expiry
  if (daysSincePurchase >= windowDays) return null;

  for (const reminderDay of reminderDays) {
    if (daysSincePurchase === reminderDay) {
      return reminderDay;
    }
  }

  return null;
}

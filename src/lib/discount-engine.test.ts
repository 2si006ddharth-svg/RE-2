import { describe, it, expect } from 'vitest';
import {
  calculateLoyaltyStatus,
  calculateDiscount,
  calculateNewStreak,
  getStreakDiscount,
  getDaysRemaining,
  isRegularCustomer,
  shouldSendReminder,
  getExpirationDate,
} from './discount-engine';

describe('Discount Engine - Pure Loyalty Business Logic', () => {
  const baseTiers = [
    { min: 1, max: 2, discount: 10 },
    { min: 3, max: 5, discount: 15 },
    { min: 6, max: Infinity, discount: 20 },
  ];
  const maxCap = 25;
  const windowDays = 10;

  describe('1. First-time customer', () => {
    it('returns not regular and 0% discount when customer has never purchased', () => {
      const result = calculateLoyaltyStatus({
        lastPurchaseAt: null,
        streakCount: 0,
        now: new Date('2026-10-13T12:00:00Z'),
      });

      expect(result.isRegular).toBe(false);
      expect(result.discountPercent).toBe(0);
      expect(result.streakCount).toBe(0);
      expect(result.daysRemaining).toBe(-1);
      expect(result.expiresAt).toBeNull();
    });

    it('new streak after first purchase is 1', () => {
      const newStreak = calculateNewStreak(null, 0, windowDays);
      expect(newStreak).toBe(1);
    });
  });

  describe('2. Active Regular customer and Streak Tiers', () => {
    const purchaseDate = new Date('2026-10-10T12:00:00Z');
    const now = new Date('2026-10-12T12:00:00Z'); // 2 days later

    it('Streak 1 gives 10% discount', () => {
      const status = calculateLoyaltyStatus({
        lastPurchaseAt: purchaseDate,
        streakCount: 1,
        now,
      });
      expect(status.isRegular).toBe(true);
      expect(status.discountPercent).toBe(10);
      expect(status.daysRemaining).toBe(8);
    });

    it('Streak 2 gives 10% discount', () => {
      expect(getStreakDiscount(2, baseTiers, maxCap)).toBe(10);
    });

    it('Streak 3-5 gives 15% discount', () => {
      expect(getStreakDiscount(3, baseTiers, maxCap)).toBe(15);
      expect(getStreakDiscount(4, baseTiers, maxCap)).toBe(15);
      expect(getStreakDiscount(5, baseTiers, maxCap)).toBe(15);
    });

    it('Streak 6+ gives 20% discount', () => {
      expect(getStreakDiscount(6, baseTiers, maxCap)).toBe(20);
      expect(getStreakDiscount(10, baseTiers, maxCap)).toBe(20);
    });
  });

  describe('3. Exactly Day 10 Boundary', () => {
    it('customer is still Regular at day 9.999 (within 10 days window)', () => {
      const purchaseDate = new Date('2026-10-01T12:00:00.000Z');
      // Exactly 9 days and 23 hours later:
      const now = new Date('2026-10-11T11:00:00.000Z');

      const status = calculateLoyaltyStatus({
        lastPurchaseAt: purchaseDate,
        streakCount: 2,
        now,
      });

      expect(status.isRegular).toBe(true);
      expect(status.daysRemaining).toBe(1);
      expect(status.discountPercent).toBe(10);
    });

    it('getDaysRemaining returns 0 once the 10-day 240-hour limit is passed', () => {
      const purchaseDate = new Date('2026-10-01T12:00:00.000Z');
      // Exactly 10 days and 1 second later:
      const now = new Date('2026-10-11T12:00:01.000Z');

      expect(getDaysRemaining(purchaseDate, 10, now)).toBe(0);
      expect(isRegularCustomer(purchaseDate, 10, now)).toBe(false);
    });
  });

  describe('4. Day 11 Expiration & Lapsed Status', () => {
    it('returns not regular, 0% discount, streak reset to 0 on day 11', () => {
      const purchaseDate = new Date('2026-10-01T12:00:00Z');
      const now = new Date('2026-10-12T12:00:00Z'); // 11 days later

      const status = calculateLoyaltyStatus({
        lastPurchaseAt: purchaseDate,
        streakCount: 4,
        now,
      });

      expect(status.isRegular).toBe(false);
      expect(status.discountPercent).toBe(0);
      expect(status.streakCount).toBe(0);
      expect(status.daysRemaining).toBe(0);
    });

    it('purchasing on day 11 wins back status with a fresh streak of 1', () => {
      const purchaseDate = new Date('2026-10-01T12:00:00Z');
      const now = new Date('2026-10-12T12:00:00Z'); // 11 days later

      const newStreak = calculateNewStreak(purchaseDate, 4, windowDays, now);
      expect(newStreak).toBe(1); // Streak was broken, resets to 1
    });
  });

  describe('5. Multiple orders in one day', () => {
    it('advances streak correctly when multiple orders happen on the same day', () => {
      const firstOrderTime = new Date('2026-10-10T10:00:00Z');
      const secondOrderTime = new Date('2026-10-10T15:00:00Z');

      // First order started streak 1
      const streak1 = calculateNewStreak(null, 0, windowDays, firstOrderTime);
      expect(streak1).toBe(1);

      // Second order within the 10-day window increments streak to 2
      const streak2 = calculateNewStreak(firstOrderTime, streak1, windowDays, secondOrderTime);
      expect(streak2).toBe(2);
    });
  });

  describe('6. Discount Cap Enforcement', () => {
    it('strictly caps the discount at MAX_DISCOUNT_CAP (25%)', () => {
      // Custom crazy tiers
      const crazyTiers = [{ min: 1, max: Infinity, discount: 50 }];
      const discount = getStreakDiscount(10, crazyTiers, 25);
      expect(discount).toBe(25);

      const calc = calculateDiscount(100, 30, 25);
      expect(calc.discountPercent).toBe(25);
      expect(calc.discountAmount).toBe(25.0);
      expect(calc.total).toBe(75.0);
    });

    it('calculates standard cart discount amounts with exact rounding', () => {
      const calc = calculateDiscount(149.99, 10, 25);
      expect(calc.subtotal).toBe(149.99);
      expect(calc.discountPercent).toBe(10);
      expect(calc.discountAmount).toBe(15.0); // 149.99 * 0.1 = 14.999 -> 15.00
      expect(calc.total).toBe(134.99);
    });
  });

  describe('7. UTC Timezone Handling', () => {
    it('properly handles date arithmetic across UTC and timezones', () => {
      const utcDate = new Date(Date.UTC(2026, 9, 1, 0, 0, 0));
      const exp = getExpirationDate(utcDate, 10);

      expect(exp.toISOString()).toBe('2026-10-11T00:00:00.000Z');

      const testNow = new Date(Date.UTC(2026, 9, 8, 0, 0, 0));
      const daysLeft = getDaysRemaining(utcDate, 10, testNow);
      expect(daysLeft).toBe(3);
    });
  });

  describe('8. Reminder Notifications (Day 7 and Day 9)', () => {
    const purchase = new Date('2026-10-01T00:00:00Z');

    it('flags reminder on day 7', () => {
      const day7 = new Date('2026-10-08T05:00:00Z'); // 7 days later
      expect(shouldSendReminder(purchase, 10, [7, 9], day7)).toBe(7);
    });

    it('flags reminder on day 9', () => {
      const day9 = new Date('2026-10-10T08:00:00Z'); // 9 days later
      expect(shouldSendReminder(purchase, 10, [7, 9], day9)).toBe(9);
    });

    it('does not flag reminder on other days (e.g. day 4 or day 8)', () => {
      const day4 = new Date('2026-10-05T00:00:00Z');
      expect(shouldSendReminder(purchase, 10, [7, 9], day4)).toBeNull();

      const day8 = new Date('2026-10-09T00:00:00Z');
      expect(shouldSendReminder(purchase, 10, [7, 9], day8)).toBeNull();
    });

    it('does not send reminder if already expired past window', () => {
      const day12 = new Date('2026-10-13T00:00:00Z');
      expect(shouldSendReminder(purchase, 10, [7, 9], day12)).toBeNull();
    });
  });
});

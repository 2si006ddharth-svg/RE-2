import { prisma } from '@/lib/db';
import { calculateLoyaltyStatus, calculateNewStreak } from '@/lib/discount-engine';

/**
 * Re-evaluate a customer's loyalty status from scratch based on their paid orders.
 * Called when an order is cancelled, refunded, or manually adjusted.
 */
export async function syncUserLoyaltyStatus(userId: string, atTime: Date = new Date()) {
  // Find all completed (paid) orders for the user, ordered by paidAt ascending
  const paidOrders = await prisma.order.findMany({
    where: {
      userId,
      status: 'paid',
      paidAt: { not: null },
    },
    orderBy: { paidAt: 'asc' },
  });

  if (paidOrders.length === 0) {
    // No paid orders left
    return await prisma.loyaltyStatus.upsert({
      where: { userId },
      update: {
        isRegular: false,
        streakCount: 0,
        currentDiscountPercent: 0,
        lastPurchaseAt: null,
        expiresAt: null,
      },
      create: {
        userId,
        isRegular: false,
        streakCount: 0,
        currentDiscountPercent: 0,
        lastPurchaseAt: null,
        expiresAt: null,
      },
    });
  }

  // Replay streaks chronologically across all paid orders
  let streak = 0;
  let lastPurchase: Date | null = null;

  for (const order of paidOrders) {
    const orderPaidAt = order.paidAt!;
    streak = calculateNewStreak(lastPurchase, streak, 10, orderPaidAt);
    lastPurchase = orderPaidAt;
  }

  // Calculate current status at the target time
  const currentStatus = calculateLoyaltyStatus({
    lastPurchaseAt: lastPurchase,
    streakCount: streak,
    now: atTime,
  });

  return await prisma.loyaltyStatus.upsert({
    where: { userId },
    update: {
      isRegular: currentStatus.isRegular,
      streakCount: currentStatus.streakCount,
      currentDiscountPercent: currentStatus.discountPercent,
      lastPurchaseAt: lastPurchase,
      expiresAt: currentStatus.expiresAt,
    },
    create: {
      userId,
      isRegular: currentStatus.isRegular,
      streakCount: currentStatus.streakCount,
      currentDiscountPercent: currentStatus.discountPercent,
      lastPurchaseAt: lastPurchase,
      expiresAt: currentStatus.expiresAt,
    },
  });
}

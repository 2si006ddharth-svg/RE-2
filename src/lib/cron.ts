import cron from 'node-cron';
import { prisma } from './db';
import { calculateLoyaltyStatus, shouldSendReminder } from './discount-engine';
import { DEFAULT_CONFIG } from './config';

/**
 * Recalculates loyalty status for all customers and sends notifications.
 * Can be run by the scheduler or invoked directly via API for testing/simulation.
 */
export async function runDailyLoyaltyJob(now: Date = new Date()) {
  console.log(`[Loyalty Cron] Starting daily loyalty check at ${now.toISOString()}...`);

  const customers = await prisma.user.findMany({
    where: { role: 'customer' },
    include: { loyalty: true },
  });

  let expiredCount = 0;
  let reminderCount = 0;

  for (const customer of customers) {
    const loyalty = customer.loyalty;
    if (!loyalty || !loyalty.lastPurchaseAt) continue;

    const currentStatus = calculateLoyaltyStatus({
      lastPurchaseAt: loyalty.lastPurchaseAt,
      streakCount: loyalty.streakCount,
      now,
    });

    // Check if status transitioned from Regular to Lapsed
    if (loyalty.isRegular && !currentStatus.isRegular) {
      expiredCount++;
      await prisma.loyaltyStatus.update({
        where: { userId: customer.id },
        data: {
          isRegular: false,
          currentDiscountPercent: 0,
          streakCount: 0,
        },
      });

      // Send win-back notification
      await prisma.notification.create({
        data: {
          userId: customer.id,
          type: 'status_change',
          message:
            '⚠️ Your Regular Customer discount has expired! Make any purchase to win back your 10% discount and restart your streak.',
        },
      });
    }

    // Check if customer is approaching expiration (Day 7 or Day 9)
    const reminderDay = shouldSendReminder(
      loyalty.lastPurchaseAt,
      DEFAULT_CONFIG.REGULAR_WINDOW_DAYS,
      DEFAULT_CONFIG.REMINDER_DAYS,
      now
    );

    if (reminderDay !== null && loyalty.isRegular) {
      reminderCount++;
      const daysLeft = DEFAULT_CONFIG.REGULAR_WINDOW_DAYS - reminderDay;

      // Ensure we haven't already sent a reminder today
      const todayStart = new Date(now);
      todayStart.setUTCHours(0, 0, 0, 0);

      const existingReminder = await prisma.notification.findFirst({
        where: {
          userId: customer.id,
          type: 'reminder',
          createdAt: { gte: todayStart },
        },
      });

      if (!existingReminder) {
        await prisma.notification.create({
          data: {
            userId: customer.id,
            type: 'reminder',
            message: `⏳ Reminder: Only ${daysLeft} day${daysLeft === 1 ? '' : 's'} left to keep your ${loyalty.currentDiscountPercent}% Regular Customer discount! Place an order soon.`,
          },
        });
      }
    }
  }

  console.log(
    `[Loyalty Cron] Completed: ${expiredCount} expired, ${reminderCount} reminders checked.`
  );

  return { expiredCount, reminderCount, totalChecked: customers.length };
}

let cronStarted = false;

export function initLoyaltyScheduler() {
  if (cronStarted) return;
  cronStarted = true;

  // Run daily at midnight UTC
  cron.schedule('0 0 * * *', async () => {
    try {
      await runDailyLoyaltyJob();
    } catch (err) {
      console.error('[Loyalty Cron] Error running scheduled job:', err);
    }
  });

  console.log('[Loyalty Cron] Scheduler initialized (0 0 * * *).');
}

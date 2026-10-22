import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validations';
import {
  calculateLoyaltyStatus,
  calculateDiscount,
  calculateNewStreak,
} from '@/lib/discount-engine';

// GET — list user's orders
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: auth.userId },
      include: {
        items: {
          include: { product: { select: { name: true, imageUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — checkout (create order + mock payment)
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items } = parsed.data;

    // Fetch products and validate stock
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found or inactive' },
        { status: 400 }
      );
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    subtotal = Math.round(subtotal * 100) / 100;

    // Get loyalty status for discount
    const loyalty = await prisma.loyaltyStatus.findUnique({
      where: { userId: auth.userId },
    });

    const now = new Date();
    const loyaltyResult = calculateLoyaltyStatus({
      lastPurchaseAt: loyalty?.lastPurchaseAt || null,
      streakCount: loyalty?.streakCount || 0,
      now,
    });

    // Calculate discount (server-side authoritative)
    const discountCalc = calculateDiscount(subtotal, loyaltyResult.discountPercent);

    // Create order with mock payment (auto-paid)
    const paidAt = now;
    const order = await prisma.order.create({
      data: {
        userId: auth.userId,
        subtotal: discountCalc.subtotal,
        discountPercent: discountCalc.discountPercent,
        discountAmount: discountCalc.discountAmount,
        total: discountCalc.total,
        status: 'paid',
        paidAt,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    // Update stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Update loyalty status
    const newStreak = calculateNewStreak(
      loyalty?.lastPurchaseAt || null,
      loyalty?.streakCount || 0,
      undefined,
      now
    );

    const newLoyaltyResult = calculateLoyaltyStatus({
      lastPurchaseAt: paidAt,
      streakCount: newStreak,
      now,
    });

    await prisma.loyaltyStatus.upsert({
      where: { userId: auth.userId },
      update: {
        isRegular: true,
        streakCount: newStreak,
        currentDiscountPercent: newLoyaltyResult.discountPercent,
        lastPurchaseAt: paidAt,
        expiresAt: newLoyaltyResult.expiresAt,
      },
      create: {
        userId: auth.userId,
        isRegular: true,
        streakCount: newStreak,
        currentDiscountPercent: newLoyaltyResult.discountPercent,
        lastPurchaseAt: paidAt,
        expiresAt: newLoyaltyResult.expiresAt,
      },
    });

    // Create streak notification if relevant
    if (newStreak > 1) {
      await prisma.notification.create({
        data: {
          userId: auth.userId,
          type: 'streak',
          message: `🔥 Your loyalty streak is now ${newStreak}! You're earning ${newLoyaltyResult.discountPercent}% off on your orders.`,
        },
      });
    } else if (newStreak === 1 && (loyalty?.streakCount || 0) === 0) {
      await prisma.notification.create({
        data: {
          userId: auth.userId,
          type: 'status_change',
          message: `🎉 Congratulations! You're now a Regular Customer with ${newLoyaltyResult.discountPercent}% off. Keep purchasing within 10 days to maintain your status!`,
        },
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Checkout error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

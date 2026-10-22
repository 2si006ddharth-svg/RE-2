import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total sales (paid orders)
    const salesAgg = await prisma.order.aggregate({
      where: { status: 'paid' },
      _sum: { total: true, discountAmount: true },
      _count: true,
    });

    // Recent sales (last 30 days)
    const recentSales = await prisma.order.aggregate({
      where: { status: 'paid', paidAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
      _count: true,
    });

    // Total customers
    const totalCustomers = await prisma.user.count({ where: { role: 'customer' } });

    // Regular customers
    const regularCustomers = await prisma.loyaltyStatus.count({
      where: { isRegular: true },
    });

    // Customers about to lose status (expires within 2 days)
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const aboutToLose = await prisma.loyaltyStatus.count({
      where: {
        isRegular: true,
        expiresAt: { lte: twoDaysFromNow, gte: now },
      },
    });

    // Repeat purchase rate
    const customersWithMultipleOrders = await prisma.order.groupBy({
      by: ['userId'],
      where: { status: 'paid' },
      _count: true,
      having: { userId: { _count: { gt: 1 } } },
    });

    const customersWithOrders = await prisma.order.groupBy({
      by: ['userId'],
      where: { status: 'paid' },
    });

    const repeatRate = customersWithOrders.length > 0
      ? Math.round((customersWithMultipleOrders.length / customersWithOrders.length) * 100)
      : 0;

    // Recent orders for chart data (last 30 days, grouped by day)
    const recentOrders = await prisma.order.findMany({
      where: { status: 'paid', paidAt: { gte: thirtyDaysAgo } },
      select: { paidAt: true, total: true },
      orderBy: { paidAt: 'asc' },
    });

    const salesByDay: Record<string, number> = {};
    recentOrders.forEach((order) => {
      if (order.paidAt) {
        const day = order.paidAt.toISOString().split('T')[0];
        salesByDay[day] = (salesByDay[day] || 0) + order.total;
      }
    });

    return NextResponse.json({
      stats: {
        totalSales: salesAgg._sum.total || 0,
        totalOrders: salesAgg._count,
        totalDiscountGiven: salesAgg._sum.discountAmount || 0,
        recentSales: recentSales._sum.total || 0,
        recentOrders: recentSales._count,
        totalCustomers,
        regularCustomers,
        aboutToLose,
        repeatRate,
        salesByDay,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { orderStatusSchema } from '@/lib/validations';
import { syncUserLoyaltyStatus } from '@/lib/loyalty-sync';

// Admin: Update order status (pending, paid, cancelled, refunded)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = orderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const newStatus = parsed.data.status;
    const updateData: Record<string, unknown> = { status: newStatus };

    // If changing to paid, set paidAt if not set
    if (newStatus === 'paid' && !currentOrder.paidAt) {
      updateData.paidAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // CRITICAL: Re-sync loyalty status for user since cancelled/refunded orders don't count
    await syncUserLoyaltyStatus(currentOrder.userId);

    // Notify user of status update
    await prisma.notification.create({
      data: {
        userId: currentOrder.userId,
        type: 'status_change',
        message: `Order #${id.slice(-6)} status updated to "${newStatus}".`,
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

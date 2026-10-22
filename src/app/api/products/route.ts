import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    const where: Record<string, unknown> = { active: true };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'name') orderBy = { name: 'asc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    // Get distinct categories
    const categories = await prisma.product.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ['category'],
    });

    return NextResponse.json({
      products,
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error('Products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

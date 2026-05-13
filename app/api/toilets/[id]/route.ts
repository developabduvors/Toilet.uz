import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  idParamSchema,
  reviewsQuerySchema,
  parseSearchParams,
} from '@/lib/validation';
import { handleApiError, jsonError, jsonOk } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const params = await ctx.params;
    const idParsed = idParamSchema.safeParse(params);
    if (!idParsed.success) return jsonError('Invalid id', 422);

    const qParsed = parseSearchParams(
      reviewsQuerySchema,
      request.nextUrl.searchParams
    );
    if (!qParsed.success) {
      return jsonError('Invalid query', 422, qParsed.error.flatten());
    }
    const { page, pageSize } = qParsed.data;

    const location = await prisma.location.findUnique({
      where: { id: idParsed.data.id },
    });

    if (!location) return jsonError('Location not found', 404);

    const [total, reviewRows] = await Promise.all([
      prisma.review.count({ where: { locationId: idParsed.data.id } }),
      prisma.review.findMany({
        where: { locationId: idParsed.data.id },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      }),
    ]);

    return jsonOk({
      location: {
        ...location,
        priceAmount: location.priceAmount.toString(),
      },
      reviews: {
        data: reviewRows,
        page,
        pageSize,
        total,
        hasMore: (page - 1) * pageSize + reviewRows.length < total,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

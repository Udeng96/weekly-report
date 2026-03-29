import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const dayStatusSchema = z.object({
  weekKey: z.string(),
  dateLabel: z.string(),
  status: z.enum(['normal', 'annual', 'am_half', 'pm_half', 'holiday', 'dayoff']),
})

const summarySchema = z.object({
  weekKey: z.string(),
  thisWeek: z.string().optional(),
  nextWeek: z.string().optional(),
})

export const weekRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  // 주차 전체 데이터 (entries + dayStatuses + summary)
  fastify.get('/:weekKey', auth, async (request) => {
    const { userId } = request.user as { userId: number }
    const { weekKey } = request.params as { weekKey: string }

    const [entries, dayStatuses, summary] = await Promise.all([
      fastify.prisma.entry.findMany({
        where: { userId, weekKey },
        include: { project: { select: { id: true, name: true, siteCode: true, client: true } } },
        orderBy: [{ dateLabel: 'asc' }, { timeSlot: 'asc' }],
      }),
      fastify.prisma.dayStatus.findMany({ where: { userId, weekKey } }),
      fastify.prisma.weekSummary.findUnique({ where: { userId_weekKey: { userId, weekKey } } }),
    ])

    return { data: { entries, dayStatuses, summary } }
  })

  // 보관함 목록 (데이터가 있는 주차 목록)
  fastify.get('/', auth, async (request) => {
    const { userId } = request.user as { userId: number }
    const weeks = await fastify.prisma.entry.groupBy({
      by: ['weekKey'],
      where: { userId },
      _count: { id: true },
      orderBy: { weekKey: 'desc' },
    })
    return { data: weeks.map(w => ({ weekKey: w.weekKey, entryCount: w._count.id })) }
  })

  // dayStatus upsert
  fastify.put('/day-status', auth, async (request) => {
    const { userId } = request.user as { userId: number }
    const body = dayStatusSchema.parse(request.body)
    const result = await fastify.prisma.dayStatus.upsert({
      where: { userId_weekKey_dateLabel: { userId, weekKey: body.weekKey, dateLabel: body.dateLabel } },
      update: { status: body.status },
      create: { userId, ...body },
    })
    return { data: result }
  })

  // summary upsert
  fastify.put('/summary', auth, async (request) => {
    const { userId } = request.user as { userId: number }
    const body = summarySchema.parse(request.body)
    const result = await fastify.prisma.weekSummary.upsert({
      where: { userId_weekKey: { userId, weekKey: body.weekKey } },
      update: { thisWeek: body.thisWeek, nextWeek: body.nextWeek },
      create: { userId, ...body },
    })
    return { data: result }
  })
}

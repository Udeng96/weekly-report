import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const treeNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.union([z.string(), z.number()]),
    text: z.string(),
    children: z.array(treeNodeSchema).optional(),
  })
)

const entrySchema = z.object({
  weekKey: z.string(),
  dateLabel: z.string(),
  dayOfWeek: z.string(),
  timeSlot: z.enum(['오전', '오후']),
  projectId: z.number().optional().nullable(),
  customProjectName: z.string().optional(),
  tree: z.array(treeNodeSchema).default([]),
  isOffsite: z.boolean().default(false),
  offsitePlace: z.string().optional(),
  note: z.string().optional(),
})

export const entryRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  // 주차별 엔트리 목록
  fastify.get('/week/:weekKey', auth, async (request) => {
    const { userId } = request.user as { userId: number }
    const { weekKey } = request.params as { weekKey: string }
    const entries = await fastify.prisma.entry.findMany({
      where: { userId, weekKey },
      include: { project: { select: { id: true, name: true, siteCode: true, client: true } } },
      orderBy: [{ dateLabel: 'asc' }, { timeSlot: 'asc' }],
    })
    return { data: entries }
  })

  // 생성
  fastify.post('/', auth, async (request, reply) => {
    const { userId } = request.user as { userId: number }
    const body = entrySchema.parse(request.body)
    const entry = await fastify.prisma.entry.create({
      data: { ...body, userId },
      include: { project: { select: { id: true, name: true, siteCode: true, client: true } } },
    })
    return reply.code(201).send({ data: entry })
  })

  // 수정
  fastify.put('/:id', auth, async (request, reply) => {
    const { userId } = request.user as { userId: number }
    const { id } = request.params as { id: string }
    const body = entrySchema.partial().parse(request.body)
    const existing = await fastify.prisma.entry.findFirst({ where: { id: Number(id), userId } })
    if (!existing) return reply.notFound('엔트리를 찾을 수 없습니다')
    const entry = await fastify.prisma.entry.update({
      where: { id: Number(id) },
      data: body,
      include: { project: { select: { id: true, name: true, siteCode: true, client: true } } },
    })
    return { data: entry }
  })

  // 삭제
  fastify.delete('/:id', auth, async (request, reply) => {
    const { userId } = request.user as { userId: number }
    const { id } = request.params as { id: string }
    await fastify.prisma.entry.deleteMany({ where: { id: Number(id), userId } })
    return reply.code(204).send()
  })
}

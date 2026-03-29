import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const projectSchema = z.object({
  name: z.string().min(1),
  siteCode: z.string().optional(),
  client: z.string().optional(),
  gitlabUrl: z.string().optional(),
  gitlabToken: z.string().optional(),
  gitlabProjectId: z.string().optional(),
  gitlabBranch: z.string().optional(),
  gitlabAuthorEmail: z.string().optional(),
})

export const projectRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  // 목록
  fastify.get('/', auth, async (request) => {
    const { userId } = request.user as { userId: number }
    const projects = await fastify.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })
    return { data: projects }
  })

  // 생성
  fastify.post('/', auth, async (request, reply) => {
    const { userId } = request.user as { userId: number }
    const body = projectSchema.parse(request.body)
    const project = await fastify.prisma.project.create({
      data: { ...body, userId },
    })
    return reply.code(201).send({ data: project })
  })

  // 수정
  fastify.put('/:id', auth, async (request, reply) => {
    const { userId } = request.user as { userId: number }
    const { id } = request.params as { id: string }
    const body = projectSchema.partial().parse(request.body)
    const project = await fastify.prisma.project.updateMany({
      where: { id: Number(id), userId },
      data: body,
    })
    if (!project.count) return reply.notFound('프로젝트를 찾을 수 없습니다')
    return { data: await fastify.prisma.project.findUnique({ where: { id: Number(id) } }) }
  })

  // 삭제
  fastify.delete('/:id', auth, async (request, reply) => {
    const { userId } = request.user as { userId: number }
    const { id } = request.params as { id: string }
    await fastify.prisma.project.deleteMany({ where: { id: Number(id), userId } })
    return reply.code(204).send()
  })
}

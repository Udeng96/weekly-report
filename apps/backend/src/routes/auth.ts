import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const registerSchema = z.object({
  name: z.string().min(1),
  dept: z.string().min(1),
  rank: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // 회원가입
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body)
    const exists = await fastify.prisma.user.findUnique({ where: { email: body.email } })
    if (exists) return reply.conflict('이미 사용중인 이메일입니다')

    const hashed = await bcrypt.hash(body.password, 10)
    const user = await fastify.prisma.user.create({
      data: { ...body, password: hashed },
      select: { id: true, name: true, dept: true, rank: true, email: true },
    })
    const token = fastify.jwt.sign({ userId: user.id, email: user.email })
    return { data: { user, token } }
  })

  // 로그인
  fastify.post('/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body)
    const user = await fastify.prisma.user.findUnique({ where: { email } })
    if (!user) return reply.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return reply.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다')

    const token = fastify.jwt.sign({ userId: user.id, email: user.email })
    const { password: _, ...userWithoutPw } = user
    return { data: { user: userWithoutPw, token } }
  })

  // 내 정보
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request) => {
    const { userId } = request.user as { userId: number }
    const user = await fastify.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, dept: true, rank: true, email: true },
    })
    return { data: user }
  })

  // 내 정보 수정
  const updateMeSchema = z.object({
    name: z.string().min(1).optional(),
    dept: z.string().min(1).optional(),
    rank: z.string().min(1).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6).optional(),
  })

  fastify.patch('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: number }
    const body = updateMeSchema.parse(request.body)

    const current = await fastify.prisma.user.findUniqueOrThrow({ where: { id: userId } })

    // 비밀번호 변경 요청 시 현재 비밀번호 확인
    let hashedNew: string | undefined
    if (body.newPassword) {
      if (!body.currentPassword) return reply.badRequest('현재 비밀번호를 입력해주세요')
      const valid = await bcrypt.compare(body.currentPassword, current.password)
      if (!valid) return reply.unauthorized('현재 비밀번호가 올바르지 않습니다')
      hashedNew = await bcrypt.hash(body.newPassword, 10)
    }

    // 이메일 중복 확인
    if (body.email && body.email !== current.email) {
      const exists = await fastify.prisma.user.findUnique({ where: { email: body.email } })
      if (exists) return reply.conflict('이미 사용중인 이메일입니다')
    }

    const user = await fastify.prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.dept && { dept: body.dept }),
        ...(body.rank && { rank: body.rank }),
        ...(body.email && { email: body.email }),
        ...(hashedNew && { password: hashedNew }),
      },
      select: { id: true, name: true, dept: true, rank: true, email: true },
    })
    return { data: user }
  })
}

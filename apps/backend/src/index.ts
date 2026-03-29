import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import sensible from '@fastify/sensible'
import { authRoutes } from './routes/auth'
import { projectRoutes } from './routes/projects'
import { entryRoutes } from './routes/entries'
import { weekRoutes } from './routes/weeks'
import { statsRoutes } from './routes/stats'
import { prismaPlugin } from './plugins/prisma'

const app = Fastify({ logger: true })

// ── Plugins ──
await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
})
await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
})
await app.register(sensible)
await app.register(prismaPlugin)

// ── Auth decorator ──
app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify()
  } catch {
    reply.unauthorized('로그인이 필요합니다')
  }
})

// ── Routes ──
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(projectRoutes, { prefix: '/api/projects' })
await app.register(entryRoutes, { prefix: '/api/entries' })
await app.register(weekRoutes, { prefix: '/api/weeks' })
await app.register(statsRoutes, { prefix: '/api/stats' })

// ── Health check ──
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

const PORT = Number(process.env.BACKEND_PORT) || 4000
try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

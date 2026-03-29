import { FastifyPluginAsync } from 'fastify'

export const statsRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  // 연간 통계
  fastify.get('/annual/:year', auth, async (request) => {
    const { userId } = request.user as { userId: number }
    const { year } = request.params as { year: string }

    // weekKey 패턴: "2026-W..."
    const entries = await fastify.prisma.entry.findMany({
      where: {
        userId,
        weekKey: { startsWith: `${year}-W` },
        projectId: { not: null },
      },
      include: { project: { select: { id: true, name: true } } },
    })

    // 프로젝트별 집계
    const statsMap = new Map<number, {
      projectId: number
      projectName: string
      months: Set<number>
      slots: number
    }>()

    entries.forEach(entry => {
      if (!entry.projectId || !entry.project) return
      const monthMatch = entry.dateLabel.match(/^(\d+)월/)
      if (!monthMatch) return
      const month = parseInt(monthMatch[1])

      if (!statsMap.has(entry.projectId)) {
        statsMap.set(entry.projectId, {
          projectId: entry.projectId,
          projectName: entry.project.name,
          months: new Set(),
          slots: 0,
        })
      }
      const stat = statsMap.get(entry.projectId)!
      stat.months.add(month)
      stat.slots += 1
    })

    const stats = Array.from(statsMap.values()).map(s => ({
      projectId: s.projectId,
      projectName: s.projectName,
      year: Number(year),
      months: Array.from(s.months).sort((a, b) => a - b),
      slots: s.slots,
      days: s.slots * 0.5,
      mm: Math.round((s.slots * 0.5 / 20) * 100) / 100,
    }))

    return { data: stats }
  })
}

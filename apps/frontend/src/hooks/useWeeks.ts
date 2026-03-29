import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpsertDayStatusDto, UpsertSummaryDto } from '@weekly/shared'
import { api } from '@/lib/api'

export const weekKeys = {
  data: (weekKey: string) => ['week', weekKey] as const,
  list: ['weeks'] as const,
}

export function useWeekData(weekKey: string) {
  return useQuery({
    queryKey: weekKeys.data(weekKey),
    queryFn: async () => {
      const res = await api.get(`/api/weeks/${weekKey}`)
      return res.data.data
    },
    enabled: !!weekKey,
    staleTime: 1000 * 30,
  })
}

export function useWeekList() {
  return useQuery({
    queryKey: weekKeys.list,
    queryFn: async () => {
      const res = await api.get('/api/weeks')
      return res.data.data
    },
    staleTime: 1000 * 60,
  })
}

export function useUpsertDayStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpsertDayStatusDto) => {
      const res = await api.put('/api/weeks/day-status', data)
      return res.data.data
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: weekKeys.data(variables.weekKey) })
    },
  })
}

export function useUpsertSummary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpsertSummaryDto) => {
      const res = await api.put('/api/weeks/summary', data)
      return res.data.data
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: weekKeys.data(variables.weekKey) })
    },
  })
}

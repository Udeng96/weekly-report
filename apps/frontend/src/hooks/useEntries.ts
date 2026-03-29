import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateEntryDto, UpdateEntryDto } from '@weekly/shared'
import { api } from '@/lib/api'

export const entryKeys = {
  byWeek: (weekKey: string) => ['entries', weekKey] as const,
}

export function useEntries(weekKey: string) {
  return useQuery({
    queryKey: entryKeys.byWeek(weekKey),
    queryFn: async () => {
      const res = await api.get(`/api/entries/week/${weekKey}`)
      return res.data.data
    },
    enabled: !!weekKey,
    staleTime: 1000 * 30,
  })
}

export function useCreateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateEntryDto) => {
      const res = await api.post('/api/entries', data)
      return res.data.data
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: entryKeys.byWeek(variables.weekKey) })
    },
  })
}

export function useUpdateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, weekKey, ...data }: UpdateEntryDto & { id: number; weekKey: string }) => {
      const res = await api.put(`/api/entries/${id}`, data)
      return res.data.data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: entryKeys.byWeek(data.weekKey) })
    },
  })
}

export function useDeleteEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, weekKey }: { id: number; weekKey: string }) => {
      await api.delete(`/api/entries/${id}`)
      return { weekKey }
    },
    onSuccess: ({ weekKey }) => {
      qc.invalidateQueries({ queryKey: entryKeys.byWeek(weekKey) })
    },
  })
}

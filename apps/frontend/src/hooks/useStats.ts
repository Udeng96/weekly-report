import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useAnnualStats(year: number) {
  return useQuery({
    queryKey: ['stats', 'annual', year],
    queryFn: async () => {
      const res = await api.get(`/api/stats/annual/${year}`)
      return res.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

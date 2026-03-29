import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateProjectDto, UpdateProjectDto } from '@weekly/shared'
import { api } from '@/lib/api'

export const projectKeys = {
  all: ['projects'] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: async () => {
      const res = await api.get('/api/projects')
      return res.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateProjectDto) => {
      const res = await api.post('/api/projects', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateProjectDto & { id: number }) => {
      const res = await api.put(`/api/projects/${id}`, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/projects/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

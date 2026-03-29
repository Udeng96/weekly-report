'use client'

import { useState } from 'react'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import type { Project, CreateProjectDto } from '@weekly/shared'

const PROJECT_COLORS = [
  { bg: '#eef2ff', text: '#4338ca', dot: '#6366f1' },
  { bg: '#f0fdf4', text: '#166534', dot: '#22c55e' },
  { bg: '#fff7ed', text: '#9a3412', dot: '#f97316' },
  { bg: '#fdf2f8', text: '#86198f', dot: '#d946ef' },
  { bg: '#f0f9ff', text: '#0c4a6e', dot: '#0ea5e9' },
  { bg: '#fefce8', text: '#713f12', dot: '#eab308' },
]

const EMPTY_FORM: CreateProjectDto = { name: '', siteCode: '', client: '', gitlabUrl: '', gitlabToken: '', gitlabProjectId: '', gitlabBranch: '', gitlabAuthorEmail: '' }

export default function ProjectsPage() {
  const { data: projects = [] } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<CreateProjectDto>(EMPTY_FORM)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    if (editId !== null) {
      await updateProject.mutateAsync({ id: editId, ...form })
      setEditId(null)
    } else {
      await createProject.mutateAsync(form)
    }
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const handleEdit = (p: Project) => {
    setForm({ name: p.name, siteCode: p.siteCode||'', client: p.client||'', gitlabUrl: p.gitlabUrl||'', gitlabToken: p.gitlabToken||'', gitlabProjectId: p.gitlabProjectId||'', gitlabBranch: p.gitlabBranch||'', gitlabAuthorEmail: p.gitlabAuthorEmail||'' })
    setEditId(p.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">🗂️ 프로젝트 관리</h2>
          <p className="text-sm text-gray-400">등록된 프로젝트 {projects.length}개</p>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}>
            + 프로젝트 등록
          </button>
        )}
      </div>

      {showForm && (
        <div className="card border border-indigo-100 space-y-3">
          <h3 className="text-sm font-bold text-primary">{editId !== null ? '✏️ 프로젝트 수정' : '➕ 새 프로젝트 등록'}</h3>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">프로젝트명 <span className="text-red-400">*</span></label>
            <input className="input" placeholder="예: 남해군 스마트 경로당 시스템 구축" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">현장코드</label>
              <input className="input" placeholder="예: NHG-2025" value={form.siteCode} onChange={e => set('siteCode', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">발주처</label>
              <input className="input" placeholder="예: 남해군청" value={form.client} onChange={e => set('client', e.target.value)} />
            </div>
          </div>
          {/* GitLab */}
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 space-y-2">
            <p className="text-xs font-bold text-orange-500">🦊 GitLab 연동 (선택)</p>
            <input className="input text-xs" placeholder="GitLab URL (예: http://210.97.42.250:5002)" value={form.gitlabUrl} onChange={e => set('gitlabUrl', e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input text-xs" placeholder="프로젝트 ID (예: 994)" value={form.gitlabProjectId} onChange={e => set('gitlabProjectId', e.target.value)} />
              <input className="input text-xs" placeholder="브랜치명 (예: dev)" value={form.gitlabBranch} onChange={e => set('gitlabBranch', e.target.value)} />
            </div>
            <input className="input text-xs" placeholder="내 이메일 (커밋 필터용)" value={form.gitlabAuthorEmail} onChange={e => set('gitlabAuthorEmail', e.target.value)} />
            <input className="input text-xs" type="password" placeholder="Personal Access Token (glpat-...)" value={form.gitlabToken} onChange={e => set('gitlabToken', e.target.value)} />
            <p className="text-xs text-gray-400">GitLab → Settings → Access Tokens → read_api 권한으로 발급</p>
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM) }}>취소</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={!form.name.trim()}>
              {editId !== null ? '수정 완료' : '등록하기'}
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 && !showForm ? (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🗂️</div>
          <p className="font-semibold text-sm">등록된 프로젝트가 없어요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((p: Project, i: number) => {
            const c = PROJECT_COLORS[i % PROJECT_COLORS.length]
            return (
              <div key={p.id} className="card p-4 flex items-center gap-3" style={{ borderLeft: `3px solid ${c.dot}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.bg }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.dot }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                  <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                    {p.siteCode && <span>📍 {p.siteCode}</span>}
                    {p.client && <span>🏢 {p.client}</span>}
                    {p.gitlabProjectId && <span style={{ color: '#fc6d26' }}>🦊 {p.gitlabBranch || '전체 브랜치'}</span>}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md font-semibold hover:bg-indigo-100" onClick={() => handleEdit(p)}>수정</button>
                  <button className="btn-danger" onClick={() => deleteProject.mutate(p.id)}>삭제</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

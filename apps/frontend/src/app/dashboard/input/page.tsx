'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWeekStore } from '@/store/weekStore'
import { useCreateEntry, useUpdateEntry, useEntries } from '@/hooks/useEntries'
import { useProjects } from '@/hooks/useProjects'
import { useWeekData, useUpsertDayStatus } from '@/hooks/useWeeks'
import { getWeekDates, getWeekKey } from '@/lib/weekUtils'
import { TreeEditor } from '@/components/TreeEditor'
import type { TreeNode, DayStatus } from '@weekly/shared'

const DAY_STATUS_CONFIG: Record<DayStatus, { label: string; color: string; bg: string; noContent: boolean; blockTime: string | null }> = {
  normal:  { label: '일반',     color: '#3b3f8c', bg: '#eef2ff', noContent: false, blockTime: null },
  annual:  { label: '연차',     color: '#dc2626', bg: '#fef2f2', noContent: true,  blockTime: 'all' },
  am_half: { label: '오전반차', color: '#d97706', bg: '#fffbeb', noContent: false, blockTime: '오전' },
  pm_half: { label: '오후반차', color: '#7c3aed', bg: '#f5f3ff', noContent: false, blockTime: '오후' },
  holiday: { label: '공휴일',   color: '#dc2626', bg: '#fef2f2', noContent: true,  blockTime: 'all' },
  dayoff:  { label: '쉬는날',   color: '#6b7280', bg: '#f3f4f6', noContent: true,  blockTime: 'all' },
}

const PROJECT_COLORS = [
  { bg: '#eef2ff', text: '#4338ca', dot: '#6366f1' },
  { bg: '#f0fdf4', text: '#166534', dot: '#22c55e' },
  { bg: '#fff7ed', text: '#9a3412', dot: '#f97316' },
  { bg: '#fdf2f8', text: '#86198f', dot: '#d946ef' },
  { bg: '#f0f9ff', text: '#0c4a6e', dot: '#0ea5e9' },
  { bg: '#fefce8', text: '#713f12', dot: '#eab308' },
]

export default function InputPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('editId')

  const { weekOffset } = useWeekStore()
  const weekKey = getWeekKey(weekOffset)
  const weekDates = getWeekDates(weekOffset)

  const { data: weekData } = useWeekData(weekKey)
  const { data: entries = [] } = useEntries(weekKey)
  const { data: projects = [] } = useProjects()
  const createEntry = useCreateEntry()
  const updateEntry = useUpdateEntry()
  const upsertDayStatus = useUpsertDayStatus()

  const dayStatuses: Record<string, string> = {}
  weekData?.dayStatuses?.forEach((ds: any) => { dayStatuses[ds.dateLabel] = ds.status })

  const [form, setForm] = useState({
    dateLabel: weekDates[0].label,
    dayOfWeek: weekDates[0].day,
    timeSlot: '오전' as '오전' | '오후',
    projectId: undefined as number | undefined,
    customProjectName: '',
    tree: [] as TreeNode[],
    isOffsite: false,
    offsitePlace: '',
    note: '',
  })

  // 수정 모드: 기존 데이터 로드
  useEffect(() => {
    if (!editId) return
    const entry = entries.find((e: any) => String(e.id) === editId)
    if (entry) {
      setForm({
        dateLabel: entry.dateLabel,
        dayOfWeek: entry.dayOfWeek,
        timeSlot: entry.timeSlot as '오전' | '오후',
        projectId: entry.projectId ?? undefined,
        customProjectName: entry.customProjectName || '',
        tree: (entry.tree as TreeNode[]) || [],
        isOffsite: entry.isOffsite,
        offsitePlace: entry.offsitePlace || '',
        note: entry.note || '',
      })
    }
  }, [editId, entries])

  const currentStatusKey = (dateLabel: string): DayStatus =>
    (dayStatuses[dateLabel] as DayStatus) || 'normal'
  const formStatus = DAY_STATUS_CONFIG[currentStatusKey(form.dateLabel)]
  const isTimeBlocked = (time: string) => {
    const bt = formStatus.blockTime
    return bt === 'all' || bt === time
  }

  const selProject = form.projectId ? projects.find((p: any) => p.id === form.projectId) : null
  const getProjColor = (id: number) => {
    const idx = projects.findIndex((p: any) => p.id === id)
    return PROJECT_COLORS[idx % PROJECT_COLORS.length] || PROJECT_COLORS[0]
  }

  const isValid = formStatus.noContent || form.tree.some(l1 => l1.text.trim())

  const handleSubmit = async () => {
    if (!isValid) return
    const data = {
      weekKey,
      dateLabel: form.dateLabel,
      dayOfWeek: form.dayOfWeek,
      timeSlot: form.timeSlot,
      projectId: form.projectId,
      customProjectName: form.customProjectName || undefined,
      tree: formStatus.noContent ? [] : form.tree,
      isOffsite: form.isOffsite,
      offsitePlace: form.offsitePlace || undefined,
      note: form.note || undefined,
    }
    if (editId) {
      await updateEntry.mutateAsync({ id: Number(editId), ...data })
    } else {
      await createEntry.mutateAsync(data)
    }
    router.push('/dashboard')
  }

  const handleDateChange = (label: string) => {
    const wd = weekDates.find(d => d.label === label)
    setForm(f => ({ ...f, dateLabel: label, dayOfWeek: wd?.day || '' }))
  }

  const handleDayStatus = async (key: DayStatus) => {
    await upsertDayStatus.mutateAsync({ weekKey, dateLabel: form.dateLabel, status: key })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">{editId ? '✏️ 업무 수정' : '➕ 업무 입력'}</h2>

      <div className="card space-y-5">
        {/* 날짜 */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">날짜</label>
          <select className="input" value={form.dateLabel} onChange={e => handleDateChange(e.target.value)}>
            {weekDates.map(d => <option key={d.label} value={d.label}>{d.label} ({d.day})</option>)}
          </select>
        </div>

        {/* 날짜 구분 */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">날짜 구분</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(DAY_STATUS_CONFIG) as [DayStatus, typeof DAY_STATUS_CONFIG[DayStatus]][]).map(([key, val]) => {
              const active = currentStatusKey(form.dateLabel) === key
              return (
                <button key={key} onClick={() => handleDayStatus(key)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors"
                  style={{ borderColor: active ? val.color : '#e5e7eb', background: active ? val.bg : '#fff', color: active ? val.color : '#6b7280' }}>
                  {val.label}
                </button>
              )
            })}
          </div>
        </div>

        {formStatus.noContent ? (
          <div className="rounded-xl p-5 text-center" style={{ background: formStatus.bg }}>
            <div className="text-2xl mb-2">{currentStatusKey(form.dateLabel) === 'annual' ? '🌴' : currentStatusKey(form.dateLabel) === 'holiday' ? '🎉' : '😴'}</div>
            <p className="font-bold text-sm" style={{ color: formStatus.color }}>{formStatus.label}</p>
            <p className="text-xs text-gray-400 mt-1">업무 내용 없이 저장됩니다</p>
          </div>
        ) : (
          <>
            {/* 시간대 */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">시간대</label>
              <div className="flex gap-2">
                {(['오전', '오후'] as const).map(t => {
                  const blocked = isTimeBlocked(t)
                  return (
                    <button key={t} onClick={() => !blocked && setForm(f => ({ ...f, timeSlot: t }))} disabled={blocked}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                        blocked ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' :
                        form.timeSlot === t ? 'bg-primary-light text-primary border-primary' : 'bg-white text-gray-500 border-gray-200'
                      }`}>
                      {t}{blocked && <span className="block text-xs text-gray-300">{formStatus.label}</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 프로젝트 */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">프로젝트</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setForm(f => ({ ...f, projectId: undefined }))}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${!form.projectId ? 'bg-primary-light text-primary border-primary' : 'bg-white text-gray-400 border-gray-200'}`}>
                  직접 입력
                </button>
                {projects.map((p: any, i: number) => {
                  const c = PROJECT_COLORS[i % PROJECT_COLORS.length]
                  const sel = form.projectId === p.id
                  return (
                    <button key={p.id} onClick={() => setForm(f => ({ ...f, projectId: p.id }))}
                      className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1"
                      style={{ borderColor: sel ? c.dot : '#e5e7eb', background: sel ? c.bg : '#fff', color: sel ? c.text : '#6b7280' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
                      {p.name}
                    </button>
                  )
                })}
              </div>
              {!form.projectId && (
                <input className="input mt-2 text-sm" placeholder="업무명 직접 입력 (선택)"
                  value={form.customProjectName} onChange={e => setForm(f => ({ ...f, customProjectName: e.target.value }))} />
              )}
              {selProject && (() => {
                const c = getProjColor(form.projectId!)
                return (
                  <div className="mt-2 px-3 py-2 rounded-lg flex gap-4 text-xs" style={{ background: c.bg, color: c.text }}>
                    {selProject.siteCode && <span>📍 {selProject.siteCode}</span>}
                    {selProject.client && <span>🏢 {selProject.client}</span>}
                  </div>
                )
              })()}
            </div>

            {/* 업무 내용 */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                업무 내용 <span className="text-red-400">*</span>
                {selProject && <span className="font-normal text-gray-400 ml-1">□ {selProject.name} 아래에 입력됩니다</span>}
              </label>
              <TreeEditor tree={form.tree} onChange={tree => setForm(f => ({ ...f, tree }))} />
            </div>

            {/* 특이사항 */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">특이사항</label>
              <div className="flex gap-2 items-start flex-wrap">
                <button onClick={() => setForm(f => ({ ...f, isOffsite: !f.isOffsite }))}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                    form.isOffsite ? 'bg-orange-50 text-orange-600 border-orange-300' : 'bg-white text-gray-400 border-gray-200'
                  }`}>
                  🚗 외근{form.isOffsite ? ' ✓' : ''}
                </button>
                {form.isOffsite && (
                  <input className="input flex-1" placeholder="외근 장소" value={form.offsitePlace}
                    onChange={e => setForm(f => ({ ...f, offsitePlace: e.target.value }))} />
                )}
              </div>
              <input className="input mt-2" placeholder="기타 비고" value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            </div>
          </>
        )}

        {/* 버튼 */}
        <div className="flex gap-2 justify-end pt-1">
          {editId && (
            <button className="btn-secondary" onClick={() => router.back()}>취소</button>
          )}
          <button className="btn-primary" onClick={handleSubmit} disabled={!isValid || createEntry.isPending || updateEntry.isPending}>
            {createEntry.isPending || updateEntry.isPending ? '저장 중...' : editId ? '수정 완료' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

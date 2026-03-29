'use client'

import { useWeekStore } from '@/store/weekStore'
import { useWeekData, useUpsertSummary } from '@/hooks/useWeeks'
import { useEntries, useDeleteEntry } from '@/hooks/useEntries'
import { useProjects } from '@/hooks/useProjects'
import { getWeekDates, getWeekLabel, getWeekKey } from '@/lib/weekUtils'
import { treeToText } from '@/lib/treeUtils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MiniCalendar } from '@/components/MiniCalendar'
import { WeekNavigator } from '@/components/WeekNavigator'
import { SummaryCard } from '@/components/SummaryCard'
import type { Entry } from '@weekly/shared'

const DAY_STATUS_LABELS: Record<string, string> = {
  annual: '연차', holiday: '공휴일', dayoff: '쉬는날',
  am_half: '오전반차', pm_half: '오후반차',
}
const PROJECT_COLORS = [
  { bg: '#eef2ff', text: '#4338ca', dot: '#6366f1' },
  { bg: '#f0fdf4', text: '#166534', dot: '#22c55e' },
  { bg: '#fff7ed', text: '#9a3412', dot: '#f97316' },
  { bg: '#fdf2f8', text: '#86198f', dot: '#d946ef' },
  { bg: '#f0f9ff', text: '#0c4a6e', dot: '#0ea5e9' },
  { bg: '#fefce8', text: '#713f12', dot: '#eab308' },
]

export default function DashboardPage() {
  const router = useRouter()
  const { weekOffset, setWeekOffset } = useWeekStore()
  const weekKey = getWeekKey(weekOffset)
  const weekDates = getWeekDates(weekOffset)

  const { data: weekData } = useWeekData(weekKey)
  const { data: entries = [] } = useEntries(weekKey)
  const { data: projects = [] } = useProjects()
  const deleteEntry = useDeleteEntry()

  const dayStatuses: Record<string, string> = {}
  weekData?.dayStatuses?.forEach((ds: any) => { dayStatuses[ds.dateLabel] = ds.status })

  const getProject = (id?: number) => projects.find((p: any) => p.id === id)
  const getProjColor = (id?: number) => {
    const idx = projects.findIndex((p: any) => p.id === id)
    return PROJECT_COLORS[idx % PROJECT_COLORS.length] || PROJECT_COLORS[0]
  }

  const grouped = weekDates.map(wd => ({
    ...wd,
    statusKey: dayStatuses[wd.label] || 'normal',
    amEntries: entries.filter((e: Entry) => e.dateLabel === wd.label && e.timeSlot === '오전'),
    pmEntries: entries.filter((e: Entry) => e.dateLabel === wd.label && e.timeSlot === '오후'),
  }))

  return (
    <div className="space-y-4">
      <MiniCalendar weekOffset={weekOffset} onSelectWeek={setWeekOffset} />
      <WeekNavigator weekOffset={weekOffset} onChangeOffset={setWeekOffset} />

      {/* 액션 버튼 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">총 {entries.length}건</span>
        <button className="btn-primary" onClick={() => router.push('/dashboard/input')}>
          + 업무 입력
        </button>
      </div>

      {/* 요약 카드 */}
      {entries.length > 0 && (
        <SummaryCard weekKey={weekKey} summary={weekData?.summary} entries={entries} projects={projects} />
      )}

      {/* 업무 목록 */}
      {entries.length === 0 && Object.keys(dayStatuses).length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📝</div>
          <p className="font-semibold text-sm mb-4">이 주차에 입력된 업무가 없어요</p>
          <button className="btn-primary" onClick={() => router.push('/dashboard/input')}>업무 입력하러 가기</button>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(g => {
            const st = g.statusKey
            const hasContent = g.amEntries.length > 0 || g.pmEntries.length > 0
            const isSpecial = st !== 'normal'
            const statusLabel = DAY_STATUS_LABELS[st]

            return (
              <div key={g.label} className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge bg-primary text-white">{g.label}</span>
                  <span className="text-sm font-semibold text-gray-500">{g.day}요일</span>
                  {isSpecial && (
                    <span className="badge bg-red-50 text-red-600">{statusLabel}</span>
                  )}
                  {!isSpecial && !hasContent && (
                    <span className="text-xs text-gray-300">업무 없음</span>
                  )}
                </div>

                {['오전', '오후'].map(time => {
                  const slotEntries = time === '오전' ? g.amEntries : g.pmEntries
                  const isBlocked =
                    (st === 'annual' || st === 'holiday' || st === 'dayoff') ||
                    (st === 'am_half' && time === '오전') ||
                    (st === 'pm_half' && time === '오후')

                  if (!slotEntries.length && !isBlocked) return null

                  return (
                    <div key={time} className="bg-gray-50 rounded-xl p-3 mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge ${time === '오전' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{time}</span>
                        {isBlocked && statusLabel && (
                          <span className="badge bg-red-50 text-red-500">{statusLabel}</span>
                        )}
                      </div>
                      {slotEntries.map((entry: Entry) => {
                        const proj = getProject(entry.projectId ?? undefined)
                        const c = proj ? getProjColor(entry.projectId ?? undefined) : null
                        return (
                          <div key={entry.id} className="bg-white rounded-lg p-3 mb-1.5 border border-gray-100 flex justify-between gap-3 items-start">
                            <div className="flex-1 min-w-0">
                              {proj && c && (
                                <span className="badge mb-1.5 mr-1" style={{ background: c.bg, color: c.text }}>
                                  <span className="w-1.5 h-1.5 rounded-full mr-1 inline-block" style={{ background: c.dot }} />
                                  {proj.name}
                                </span>
                              )}
                              {!proj && entry.customProjectName && (
                                <span className="badge bg-gray-100 text-gray-600 mb-1.5">{entry.customProjectName}</span>
                              )}
                              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">
                                {treeToText((entry.tree as any) || [])}
                              </pre>
                              {entry.isOffsite && (
                                <p className="text-xs text-orange-500 font-semibold mt-1">
                                  🚗 외근{entry.offsitePlace ? ` — ${entry.offsitePlace}` : ''}
                                </p>
                              )}
                              {entry.note && <p className="text-xs text-gray-400 mt-1">📝 {entry.note}</p>}
                            </div>
                            <div className="flex gap-1 flex-shrink-0 self-start">
                              <button
                                className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors"
                                title="수정"
                                onClick={() => router.push(`/dashboard/input?editId=${entry.id}`)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button
                                className="text-red-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                title="삭제"
                                onClick={() => deleteEntry.mutate({ id: entry.id, weekKey })}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

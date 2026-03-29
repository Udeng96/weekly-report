'use client'

import { useState } from 'react'
import { useAnnualStats } from '@/hooks/useStats'
import type { ProjectStat } from '@weekly/shared'

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const PROJECT_COLORS = [
  { bg: '#eef2ff', text: '#4338ca', dot: '#6366f1' },
  { bg: '#f0fdf4', text: '#166534', dot: '#22c55e' },
  { bg: '#fff7ed', text: '#9a3412', dot: '#f97316' },
  { bg: '#fdf2f8', text: '#86198f', dot: '#d946ef' },
  { bg: '#f0f9ff', text: '#0c4a6e', dot: '#0ea5e9' },
  { bg: '#fefce8', text: '#713f12', dot: '#eab308' },
]

export default function StatsPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data: stats = [], isLoading } = useAnnualStats(year)

  const totalSlots = stats.reduce((sum: number, s: ProjectStat) => sum + s.slots, 0)
  const totalMM = stats.reduce((sum: number, s: ProjectStat) => sum + s.mm, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">📊 통계</h2>
          <p className="text-sm text-gray-400">프로젝트별 연간 투입 현황</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear(y => y - 1)} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary text-sm">‹</button>
          <span className="text-sm font-bold text-gray-700">{year}년</span>
          <button onClick={() => setYear(y => y + 1)} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary text-sm">›</button>
        </div>
      </div>

      {isLoading ? (
        <div className="card text-center py-10 text-gray-400 text-sm">불러오는 중...</div>
      ) : stats.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-semibold text-sm">{year}년 통계 데이터가 없어요</p>
        </div>
      ) : (
        <div className="card">
          {/* 연간 요약 */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="text-xl font-black text-primary">{year}년</div>
            <div className="text-xs text-gray-400">총 <b className="text-gray-600">{(totalSlots * 0.5).toFixed(1)}일</b> 투입 · <b className="text-primary">{totalMM.toFixed(2)} M/M</b></div>
          </div>

          {/* 월별 헤더 */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-gray-500 font-semibold pb-2 pr-3 min-w-[140px]">프로젝트</th>
                  {MONTHS.map(m => (
                    <th key={m} className="text-center text-gray-400 font-semibold pb-2 w-8">{m.replace('월','')}</th>
                  ))}
                  <th className="text-center text-gray-500 font-semibold pb-2 px-2">투입일</th>
                  <th className="text-center text-primary font-bold pb-2 px-2">M/M</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s: ProjectStat, i: number) => {
                  const c = PROJECT_COLORS[i % PROJECT_COLORS.length]
                  const ratio = totalSlots > 0 ? (s.slots / totalSlots * 100).toFixed(0) : 0
                  return (
                    <tr key={s.projectId} className="border-t border-gray-50">
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.dot }} />
                          <span className="text-gray-700 font-semibold truncate max-w-[120px]" title={s.projectName}>{s.projectName}</span>
                        </div>
                      </td>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <td key={m} className="text-center py-2">
                          {s.months.includes(m) ? (
                            <span className="inline-block w-4 h-4 rounded-sm" style={{ background: c.bg, border: `1.5px solid ${c.dot}` }} />
                          ) : (
                            <span className="inline-block w-4 h-4 rounded-sm bg-gray-50" />
                          )}
                        </td>
                      ))}
                      <td className="text-center py-2 text-gray-500 font-semibold px-2">{s.days.toFixed(1)}</td>
                      <td className="text-center py-2 px-2">
                        <span className="badge font-bold" style={{ background: c.bg, color: c.text }}>{s.mm.toFixed(2)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 투입 비율 바 */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">투입 비율</p>
            <div className="flex h-3 rounded-full overflow-hidden gap-px">
              {stats.map((s: ProjectStat, i: number) => {
                const c = PROJECT_COLORS[i % PROJECT_COLORS.length]
                const ratio = totalSlots > 0 ? s.slots / totalSlots * 100 : 0
                return ratio > 0 ? (
                  <div key={s.projectId} title={`${s.projectName}: ${ratio.toFixed(1)}%`}
                    className="h-full transition-all" style={{ width: `${ratio}%`, background: c.dot, minWidth: '4px' }} />
                ) : null
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {stats.map((s: ProjectStat, i: number) => {
                const c = PROJECT_COLORS[i % PROJECT_COLORS.length]
                const ratio = totalSlots > 0 ? (s.slots / totalSlots * 100).toFixed(1) : 0
                return (
                  <span key={s.projectId} className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-sm" style={{ background: c.dot }} />
                    {s.projectName} <b className="text-gray-700">{ratio}%</b>
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

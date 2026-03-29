'use client'

import { useState } from 'react'
import { startOfWeek, addDays, format } from 'date-fns'

interface Props {
  weekOffset: number
  onSelectWeek: (offset: number) => void
}

const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일']
const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export function MiniCalendar({ weekOffset, onSelectWeek }: Props) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date())
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  // 선택된 주의 월요일
  const getMonday = (offset: number) => {
    const d = startOfWeek(new Date(), { weekStartsOn: 1 })
    d.setDate(d.getDate() + offset * 7)
    d.setHours(0,0,0,0)
    return d
  }
  const selectedMonday = getMonday(weekOffset)

  // 달력 셀 생성
  const firstDay = new Date(year, month, 1)
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]
  // 7의 배수로 맞추기
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

  const isSameWeek = (date: Date | null) => {
    if (!date) return false
    const mon = startOfWeek(date, { weekStartsOn: 1 })
    mon.setHours(0,0,0,0)
    return mon.getTime() === selectedMonday.getTime()
  }

  const isToday = (date: Date | null) =>
    date?.toDateString() === today.toDateString()

  const handleClickWeek = (week: (Date | null)[]) => {
    const firstDate = week.find(d => d !== null)
    if (!firstDate) return
    const todayMonday = getMonday(0)
    const clickMonday = startOfWeek(firstDate, { weekStartsOn: 1 })
    clickMonday.setHours(0,0,0,0)
    const diff = Math.round((clickMonday.getTime() - todayMonday.getTime()) / (7*24*60*60*1000))
    onSelectWeek(diff)
  }

  return (
    <div className="card p-4">
      {/* 월 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary text-sm">‹</button>
        <span className="text-sm font-bold text-gray-800">{year}년 {MONTH_NAMES[month]}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary text-sm">›</button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d, i) => (
          <div key={d} className={`text-center text-xs font-semibold py-1 ${i >= 5 ? 'text-red-400' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>

      {/* 주 행 */}
      {weeks.map((week, wi) => {
        const isSelected = week.some(d => isSameWeek(d))
        return (
          <div key={wi} onClick={() => handleClickWeek(week)}
            className={`grid grid-cols-7 rounded-lg cursor-pointer mb-0.5 transition-colors ${isSelected ? 'bg-primary-light' : 'hover:bg-gray-50'}`}>
            {week.map((date, di) => (
              <div key={di} className="flex items-center justify-center py-1">
                {date ? (
                  isToday(date) ? (
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold">{date.getDate()}</span>
                  ) : (
                    <span className={`text-xs ${di >= 5 ? 'text-red-400' : isSelected ? 'text-primary font-semibold' : 'text-gray-600'}`}>{date.getDate()}</span>
                  )
                ) : null}
              </div>
            ))}
          </div>
        )
      })}

      {/* 범례 */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-primary-light inline-block border border-primary/20" />선택 주
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-primary inline-block" />오늘
        </span>
        <span className="ml-auto">주 단위 클릭</span>
      </div>
    </div>
  )
}

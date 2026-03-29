import { startOfWeek, addDays, format, addWeeks } from 'date-fns'
import { ko } from 'date-fns/locale'

const DAYS = ['월', '화', '수', '목', '금'] as const

export function getMonday(offset = 0): Date {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  return addWeeks(monday, offset)
}

export function getWeekKey(offset = 0): string {
  const monday = getMonday(offset)
  return `${monday.getFullYear()}-W${String(monday.getMonth() + 1).padStart(2, '0')}${String(monday.getDate()).padStart(2, '0')}`
}

export function getWeekDates(offset = 0) {
  const monday = getMonday(offset)
  return Array.from({ length: 5 }, (_, i) => {
    const d = addDays(monday, i)
    return {
      label: `${d.getMonth() + 1}월${String(d.getDate()).padStart(2, '0')}일`,
      day: DAYS[i],
      date: d,
    }
  })
}

export function getWeekLabel(offset = 0): string {
  const dates = getWeekDates(offset)
  const s = format(dates[0].date, 'M/d')
  const e = format(dates[4].date, 'M/d')
  if (offset === 0) return `이번 주 (${s} ~ ${e})`
  if (offset === -1) return `지난 주 (${s} ~ ${e})`
  if (offset === 1) return `다음 주 (${s} ~ ${e})`
  return `${s} ~ ${e}`
}

export function weekKeyFromDate(date: Date): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 })
  return `${monday.getFullYear()}-W${String(monday.getMonth() + 1).padStart(2, '0')}${String(monday.getDate()).padStart(2, '0')}`
}

export function weekOffsetFromKey(weekKey: string): number {
  const currentKey = getWeekKey(0)
  const [curYear, curW] = currentKey.split('-W')
  const [tgtYear, tgtW] = weekKey.split('-W')
  const curMonday = new Date(Number(curYear), parseInt(curW.slice(0,2))-1, parseInt(curW.slice(2,4)))
  const tgtMonday = new Date(Number(tgtYear), parseInt(tgtW.slice(0,2))-1, parseInt(tgtW.slice(2,4)))
  return Math.round((tgtMonday.getTime() - curMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
}

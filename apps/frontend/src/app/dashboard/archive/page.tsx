'use client'

import { useWeekList } from '@/hooks/useWeeks'
import { useWeekStore } from '@/store/weekStore'
import { weekOffsetFromKey } from '@/lib/weekUtils'
import { useRouter } from 'next/navigation'

export default function ArchivePage() {
  const router = useRouter()
  const { data: weeks = [], isLoading } = useWeekList()
  const { setWeekOffset } = useWeekStore()
  const currentKey = useWeekStore(s => s.currentWeekKey())

  const archived = weeks.filter((w: any) => w.weekKey !== currentKey)

  const getLabel = (weekKey: string) => {
    const [yr, w] = weekKey.split('-W')
    const m = w.slice(0, 2); const d = w.slice(2, 4)
    const start = new Date(Number(yr), parseInt(m) - 1, parseInt(d))
    const end = new Date(start); end.setDate(start.getDate() + 4)
    return `${start.getMonth()+1}/${start.getDate()} ~ ${end.getMonth()+1}/${end.getDate()}`
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">📦 보관함</h2>
        <p className="text-sm text-gray-400">지난 주차 보고서 목록</p>
      </div>

      {isLoading ? (
        <div className="card text-center py-10 text-gray-400 text-sm">불러오는 중...</div>
      ) : archived.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-semibold text-sm">보관된 주차가 없어요</p>
          <p className="text-xs mt-1">다음 주가 되면 이번 주 데이터가 여기에 보관돼요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {archived.map((w: any) => (
            <div key={w.weekKey} className="card p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-400">주간</span>
                <span className="text-sm font-black text-gray-600 leading-none">{w.weekKey.split('-W')[0].slice(2)}년</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{getLabel(w.weekKey)}</p>
                <p className="text-xs text-gray-400">업무 {w.entryCount}건</p>
              </div>
              <button
                onClick={() => { setWeekOffset(weekOffsetFromKey(w.weekKey)); router.push('/dashboard') }}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 font-semibold hover:border-primary hover:text-primary transition-colors">
                열어보기
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

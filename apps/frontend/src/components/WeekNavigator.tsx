'use client'

import { getWeekLabel } from '@/lib/weekUtils'

interface Props {
  weekOffset: number
  onChangeOffset: (offset: number) => void
}

export function WeekNavigator({ weekOffset, onChangeOffset }: Props) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
      <button onClick={() => onChangeOffset(weekOffset - 1)}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors">
        ‹
      </button>
      <div className="text-center">
        <p className="text-sm font-bold text-gray-800">{getWeekLabel(weekOffset)}</p>
        {weekOffset !== 0 && (
          <button onClick={() => onChangeOffset(0)}
            className="text-xs text-primary font-semibold mt-0.5">
            오늘로 돌아가기
          </button>
        )}
      </div>
      <button onClick={() => onChangeOffset(weekOffset + 1)}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors">
        ›
      </button>
    </div>
  )
}

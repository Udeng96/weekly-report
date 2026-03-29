'use client'

import { useState } from 'react'
import { useUpsertSummary } from '@/hooks/useWeeks'
import type { Entry, Project } from '@weekly/shared'

interface Props {
  weekKey: string
  summary?: { thisWeek?: string; nextWeek?: string } | null
  entries: Entry[]
  projects: Project[]
}

export function SummaryCard({ weekKey, summary, entries, projects }: Props) {
  const upsert = useUpsertSummary()
  const [loading, setLoading] = useState(false)
  const [apiKey] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('anthropic_api_key') || '' : '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keyInput, setKeyInput] = useState(apiKey)

  const saveKey = () => {
    localStorage.setItem('anthropic_api_key', keyInput)
    setShowKeyInput(false)
  }

  const handleAiSummary = async () => {
    const key = localStorage.getItem('anthropic_api_key') || ''
    if (!key) { setShowKeyInput(true); return }
    setLoading(true)
    try {
      const getProject = (id?: number) => projects.find(p => p.id === id)
      const treeToText = (tree: any[]): string => {
        const lines: string[] = []
        tree?.forEach(l1 => {
          if (l1.text) lines.push(` - ${l1.text}`)
          l1.children?.forEach((l2: any) => {
            if (l2.text) lines.push(`  + ${l2.text}`)
            l2.children?.forEach((l3: any) => { if (l3.text) lines.push(`   : ${l3.text}`) })
          })
        })
        return lines.join('\n')
      }
      const text = entries.map(e => {
        const p = e.projectId ? getProject(e.projectId) : null
        const prefix = p ? `□ ${p.name}` : e.customProjectName ? `□ ${e.customProjectName}` : ''
        return [e.dateLabel, e.timeSlot, prefix, treeToText(e.tree as any)].filter(Boolean).join(' ')
      }).join('\n')

      const prompt = `아래 업무 내용을 바탕으로 금주 실적과 차주 계획 요약을 작성하세요.\n\n${text}\n\n형식:\n===금주실적===\n(요약)\n===차주계획===\n(요약)`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
      })
      const data = await res.json()
      const responseText = data.content?.find((b: any) => b.type === 'text')?.text || ''
      const thisMatch = responseText.match(/===금주실적===\n([\s\S]*?)(?=\n===차주계획===|$)/)
      const nextMatch = responseText.match(/===차주계획===\n([\s\S]*?)$/)
      await upsert.mutateAsync({
        weekKey,
        thisWeek: thisMatch ? thisMatch[1].trim() : summary?.thisWeek,
        nextWeek: nextMatch ? nextMatch[1].trim() : summary?.nextWeek,
      })
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div className="card border border-indigo-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-primary">📋 업무 요약</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowKeyInput(v => !v)}
            className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${apiKey ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {apiKey ? '🔑 키 등록됨' : '🔑 키 필요'}
          </button>
          <button onClick={handleAiSummary} disabled={loading}
            className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50">
            {loading ? '✨ 요약 중...' : '✨ AI 요약'}
          </button>
        </div>
      </div>

      {showKeyInput && (
        <div className="bg-indigo-50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-2">Anthropic API 키 입력</p>
          <div className="flex gap-2">
            <input type="password" className="input text-xs flex-1" placeholder="sk-ant-..."
              value={keyInput} onChange={e => setKeyInput(e.target.value)} />
            <button onClick={saveKey} className="btn-primary text-xs px-3">저장</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1.5">
            <span className="badge bg-indigo-100 text-indigo-700">금주 업무 실적</span>
          </p>
          <textarea
            className="input text-xs min-h-[80px] resize-y leading-relaxed"
            placeholder="AI 요약 생성 또는 직접 입력"
            value={summary?.thisWeek || ''}
            onChange={e => upsert.mutate({ weekKey, thisWeek: e.target.value, nextWeek: summary?.nextWeek })}
          />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1.5">
            <span className="badge bg-green-100 text-green-700">차주 업무 계획</span>
          </p>
          <textarea
            className="input text-xs min-h-[80px] resize-y leading-relaxed"
            placeholder="AI 요약 생성 또는 직접 입력"
            value={summary?.nextWeek || ''}
            onChange={e => upsert.mutate({ weekKey, thisWeek: summary?.thisWeek, nextWeek: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

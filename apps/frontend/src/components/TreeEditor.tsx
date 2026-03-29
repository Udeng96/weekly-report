'use client'

import { useRef, useEffect } from 'react'
import type { TreeNode } from '@weekly/shared'
import { newId } from '@/lib/treeUtils'

interface Props {
  tree: TreeNode[]
  onChange: (tree: TreeNode[]) => void
}

function AutoInput({ value, onChange, onKeyDown, placeholder, autoFocus }: {
  value: string; onChange: (v: string) => void; onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string; autoFocus?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (autoFocus && ref.current) ref.current.focus() }, [autoFocus])
  return (
    <input ref={ref} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown}
      className="flex-1 min-w-0 border-none outline-none bg-transparent text-sm text-gray-800 placeholder-gray-300 font-sans"
    />
  )
}

export function TreeEditor({ tree, onChange }: Props) {
  const addL1 = () => onChange([...tree, { id: newId(), text: '', children: [] }])
  const addL2 = (l1id: any) => onChange(tree.map(l1 => l1.id === l1id ? { ...l1, children: [...(l1.children||[]), { id: newId(), text: '', children: [] }] } : l1))
  const addL3 = (l1id: any, l2id: any) => onChange(tree.map(l1 => l1.id === l1id ? { ...l1, children: (l1.children||[]).map(l2 => l2.id === l2id ? { ...l2, children: [...(l2.children||[]), { id: newId(), text: '' }] } : l2) } : l1))
  const upL1 = (id: any, text: string) => onChange(tree.map(l1 => l1.id === id ? { ...l1, text } : l1))
  const upL2 = (l1id: any, id: any, text: string) => onChange(tree.map(l1 => l1.id === l1id ? { ...l1, children: (l1.children||[]).map(l2 => l2.id === id ? { ...l2, text } : l2) } : l1))
  const upL3 = (l1id: any, l2id: any, id: any, text: string) => onChange(tree.map(l1 => l1.id === l1id ? { ...l1, children: (l1.children||[]).map(l2 => l2.id === l2id ? { ...l2, children: (l2.children||[]).map(l3 => l3.id === id ? { ...l3, text } : l3) } : l2) } : l1))
  const rmL1 = (id: any) => onChange(tree.filter(l1 => l1.id !== id))
  const rmL2 = (l1id: any, id: any) => onChange(tree.map(l1 => l1.id === l1id ? { ...l1, children: (l1.children||[]).filter(l2 => l2.id !== id) } : l1))
  const rmL3 = (l1id: any, l2id: any, id: any) => onChange(tree.map(l1 => l1.id === l1id ? { ...l1, children: (l1.children||[]).map(l2 => l2.id === l2id ? { ...l2, children: (l2.children||[]).filter(l3 => l3.id !== id) } : l2) } : l1))

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
      {tree.length === 0 && <p className="text-xs text-gray-300 mb-2">아래 버튼으로 작업 내용을 추가하세요</p>}

      {tree.map((l1, li) => (
        <div key={String(l1.id)} className="mb-2">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
            <span className="text-indigo-500 font-bold text-sm w-4 flex-shrink-0">-</span>
            <AutoInput value={l1.text} placeholder="작업 내용 요약" onChange={v => upL1(l1.id, v)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addL1() } if (e.key === 'Tab') { e.preventDefault(); addL2(l1.id) } }}
              autoFocus={li === tree.length - 1 && !l1.text} />
            <button onClick={() => rmL1(l1.id)} className="text-gray-300 hover:text-red-400 text-sm flex-shrink-0">×</button>
          </div>

          {(l1.children || []).map((l2, l2i) => (
            <div key={String(l2.id)} className="pl-5 mt-1">
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                <span className="text-sky-500 font-bold text-sm w-4 flex-shrink-0">+</span>
                <AutoInput value={l2.text} placeholder="자세한 작업 내용" onChange={v => upL2(l1.id, l2.id, v)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addL2(l1.id) } if (e.key === 'Tab') { e.preventDefault(); addL3(l1.id, l2.id) } }}
                  autoFocus={l2i === (l1.children||[]).length - 1 && !l2.text} />
                <button onClick={() => rmL2(l1.id, l2.id)} className="text-gray-300 hover:text-red-400 text-sm flex-shrink-0">×</button>
              </div>

              {(l2.children || []).map((l3, l3i) => (
                <div key={String(l3.id)} className="pl-5 mt-1">
                  <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 rounded-lg px-2.5 py-1.5">
                    <span className="text-amber-500 font-bold text-sm w-4 flex-shrink-0">:</span>
                    <AutoInput value={l3.text} placeholder="세부 내용" onChange={v => upL3(l1.id, l2.id, l3.id, v)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addL3(l1.id, l2.id) } }}
                      autoFocus={l3i === (l2.children||[]).length - 1 && !l3.text} />
                    <button onClick={() => rmL3(l1.id, l2.id, l3.id)} className="text-gray-300 hover:text-red-400 text-sm flex-shrink-0">×</button>
                  </div>
                </div>
              ))}
              <button onClick={() => addL3(l1.id, l2.id)} className="text-xs text-amber-500 font-semibold pl-5 mt-0.5 hover:underline">+ : 세부내용 추가</button>
            </div>
          ))}
          <button onClick={() => addL2(l1.id)} className="text-xs text-sky-500 font-semibold pl-5 mt-0.5 hover:underline">+ 자세한 작업 추가</button>
        </div>
      ))}

      <button onClick={addL1}
        className="mt-2 w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 font-semibold hover:border-primary hover:text-primary transition-colors">
        + 작업 내용 추가 (-)
      </button>

      <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100 flex-wrap">
        {[{sym:'-',c:'text-indigo-500',l:'작업 요약'},{sym:'+',c:'text-sky-500',l:'자세한 작업'},{sym:':',c:'text-amber-500',l:'세부 내용'}].map(({sym,c,l}) => (
          <span key={sym} className="text-xs text-gray-400 flex items-center gap-1">
            <b className={c}>{sym}</b> {l}
          </span>
        ))}
        <span className="ml-auto text-xs text-gray-300">Enter: 다음 · Tab: 하위</span>
      </div>
    </div>
  )
}

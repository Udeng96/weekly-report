'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

const NAV_ITEMS = [
  { href: '/dashboard', label: '목록', icon: '📋' },
  { href: '/dashboard/input', label: '업무 입력', icon: '✍️' },
  { href: '/dashboard/archive', label: '보관함', icon: '📦' },
  { href: '/dashboard/projects', label: '프로젝트', icon: '🗂️' },
  { href: '/dashboard/stats', label: '통계', icon: '📊' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, token, logout } = useAuthStore()

  useEffect(() => {
    if (!token) router.replace('/login')
  }, [token, router])

  if (!token || !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="font-bold text-primary text-sm">주간보고서</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{user.dept} · {user.rank} · {user.name}</span>
            <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600">로그아웃</button>
          </div>
        </div>
        {/* Tab nav */}
        <div className="max-w-3xl mx-auto px-4 pb-0">
          <div className="flex gap-1 overflow-x-auto">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href}
                className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  pathname === item.href
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        {children}
      </main>
    </div>
  )
}

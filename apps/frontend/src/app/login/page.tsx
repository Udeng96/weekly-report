'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { login, register } = useAuthStore()
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(true)
  const [form, setForm] = useState({
    name: '', dept: '', rank: '', email: '', password: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isRegister) {
        await register(form)
      } else {
        await login(form.email, form.password, remember)
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 좌측 브랜드 패널 */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #3b3f8c 0%, #6366f1 50%, #8b5cf6 100%)' }}
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
              📋
            </div>
            <span className="text-white font-bold text-lg">주간보고서 작성기</span>
          </div>
        </div>

        <div>
          <blockquote className="text-white/90 text-2xl font-light leading-relaxed mb-6">
            "업무를 기록하고,<br />
            성장을 확인하세요."
          </blockquote>
          <p className="text-white/60 text-sm">솔루션 개발 본부</p>
        </div>

        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-white/80" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </div>

      {/* 우측 로그인 폼 */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm">
          {/* 모바일에서만 보이는 헤더 */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-4xl mb-2">📋</div>
            <h1 className="text-xl font-bold text-primary">주간보고서 작성기</h1>
            <p className="text-xs text-gray-400 mt-1">솔루션 개발 본부</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isRegister ? '계정 만들기' : '다시 오셨군요!'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isRegister ? '정보를 입력하고 시작하세요' : '이메일과 비밀번호를 입력해주세요'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">이름</label>
                  <input
                    className="input"
                    placeholder="홍길동"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">소속</label>
                    <input
                      className="input"
                      placeholder="솔루션 개발 본부"
                      value={form.dept}
                      onChange={e => set('dept', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">직급</label>
                    <input
                      className="input"
                      placeholder="주임"
                      value={form.rank}
                      onChange={e => set('rank', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">이메일</label>
              <input
                className="input"
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">비밀번호</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
              />
            </div>

            {!isRegister && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-xs text-gray-500">로그인 상태 유지</span>
              </label>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <span className="text-red-400 text-xs">⚠</span>
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3 mt-2 text-base"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  처리 중...
                </span>
              ) : isRegister ? '회원가입' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs text-gray-400">
              {isRegister ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}
            </span>{' '}
            <button
              onClick={() => { setIsRegister(v => !v); setError('') }}
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              {isRegister ? '로그인' : '회원가입'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function ProfilePage() {
  const { user, updateMe } = useAuthStore()

  const [info, setInfo] = useState({
    name: user?.name ?? '',
    dept: user?.dept ?? '',
    rank: user?.rank ?? '',
    email: user?.email ?? '',
  })
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [infoLoading, setInfoLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [infoMsg, setInfoMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInfoLoading(true)
    setInfoMsg(null)
    try {
      await updateMe(info)
      setInfoMsg({ type: 'ok', text: '정보가 수정되었습니다.' })
    } catch (err: any) {
      setInfoMsg({ type: 'err', text: err.response?.data?.message || '오류가 발생했습니다.' })
    } finally {
      setInfoLoading(false)
    }
  }

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ type: 'err', text: '새 비밀번호가 일치하지 않습니다.' })
      return
    }
    setPwLoading(true)
    setPwMsg(null)
    try {
      await updateMe({ currentPassword: pw.currentPassword, newPassword: pw.newPassword })
      setPwMsg({ type: 'ok', text: '비밀번호가 변경되었습니다.' })
      setPw({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err: any) {
      setPwMsg({ type: 'err', text: err.response?.data?.message || '오류가 발생했습니다.' })
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-lg font-bold text-gray-800">내 정보 수정</h1>

      {/* 기본 정보 */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-4">기본 정보</h2>
        <form onSubmit={handleInfoSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">이름</label>
            <input className="input" value={info.name} onChange={e => setInfo(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">소속</label>
              <input className="input" value={info.dept} onChange={e => setInfo(f => ({ ...f, dept: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">직급</label>
              <input className="input" value={info.rank} onChange={e => setInfo(f => ({ ...f, rank: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">이메일</label>
            <input className="input" type="email" value={info.email} onChange={e => setInfo(f => ({ ...f, email: e.target.value }))} required />
          </div>

          {infoMsg && (
            <p className={`text-xs ${infoMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
              {infoMsg.type === 'ok' ? '✓' : '⚠'} {infoMsg.text}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={infoLoading}>
            {infoLoading ? '저장 중...' : '저장'}
          </button>
        </form>
      </div>

      {/* 비밀번호 변경 */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-4">비밀번호 변경</h2>
        <form onSubmit={handlePwSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">현재 비밀번호</label>
            <input className="input" type="password" placeholder="••••••••" value={pw.currentPassword}
              onChange={e => setPw(f => ({ ...f, currentPassword: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">새 비밀번호</label>
            <input className="input" type="password" placeholder="6자 이상" value={pw.newPassword}
              onChange={e => setPw(f => ({ ...f, newPassword: e.target.value }))} required minLength={6} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">새 비밀번호 확인</label>
            <input className="input" type="password" placeholder="••••••••" value={pw.confirm}
              onChange={e => setPw(f => ({ ...f, confirm: e.target.value }))} required />
          </div>

          {pwMsg && (
            <p className={`text-xs ${pwMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
              {pwMsg.type === 'ok' ? '✓' : '⚠'} {pwMsg.text}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={pwLoading}>
            {pwLoading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  )
}

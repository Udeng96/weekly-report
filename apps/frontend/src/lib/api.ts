import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
})

// 요청마다 토큰 자동 첨부 (localStorage 또는 sessionStorage 확인)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401이면 로그인 페이지로
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

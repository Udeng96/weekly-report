# 주간보고서 작성기

솔루션 개발 본부 주간 업무 보고서 작성 시스템

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14, TypeScript, Zustand, React Query, Tailwind CSS |
| Backend | Fastify, TypeScript, Prisma |
| Database | PostgreSQL |
| 공통 타입 | @weekly/shared (pnpm workspace) |
| 개발 환경 | Docker Compose (DB), pnpm monorepo |

## 프로젝트 구조

```
weekly/
├── apps/
│   ├── frontend/         Next.js 앱
│   │   └── src/
│   │       ├── app/      페이지 (App Router)
│   │       ├── components/  공통 컴포넌트
│   │       ├── hooks/    React Query 훅
│   │       ├── store/    Zustand 스토어
│   │       └── lib/      유틸리티
│   └── backend/          Fastify API 서버
│       ├── prisma/       DB 스키마 & 마이그레이션
│       └── src/
│           ├── routes/   API 라우터
│           └── plugins/  Fastify 플러그인
└── packages/
    └── shared/           공통 TypeScript 타입
```

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
# .env 파일에서 비밀번호 등 변경
```

### 3. DB 실행

```bash
docker-compose up -d
```

### 4. DB 마이그레이션

```bash
pnpm db:migrate
```

### 5. 개발 서버 실행

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/login | 로그인 |
| GET | /api/auth/me | 내 정보 |
| GET | /api/projects | 프로젝트 목록 |
| POST | /api/projects | 프로젝트 생성 |
| PUT | /api/projects/:id | 프로젝트 수정 |
| DELETE | /api/projects/:id | 프로젝트 삭제 |
| GET | /api/entries/week/:weekKey | 주차별 엔트리 |
| POST | /api/entries | 엔트리 생성 |
| PUT | /api/entries/:id | 엔트리 수정 |
| DELETE | /api/entries/:id | 엔트리 삭제 |
| GET | /api/weeks | 주차 목록 (보관함) |
| GET | /api/weeks/:weekKey | 주차 데이터 |
| PUT | /api/weeks/day-status | 날짜 구분 설정 |
| PUT | /api/weeks/summary | 요약 저장 |
| GET | /api/stats/annual/:year | 연간 통계 |

## 주요 기능

- 📋 주차별 업무 입력 (3단계 트리 구조: - / + / :)
- 📅 캘린더 주차 네비게이션
- 🦊 GitLab 커밋 연동 + AI 자동 변환
- ✨ AI 요약 생성 (Anthropic Claude API)
- 📥 엑셀 다운로드 (원본 서식 유지)
- 📊 연간 통계 (M/M 계산)
- 📦 보관함 (지난 주차 조회)
- 🔐 JWT 인증

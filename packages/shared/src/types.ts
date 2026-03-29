// ── 공통 타입 정의 ──

export type TimeSlot = '오전' | '오후'
export type DayStatus = 'normal' | 'annual' | 'am_half' | 'pm_half' | 'holiday' | 'dayoff'

export interface TreeNode {
  id: string | number
  text: string
  children?: TreeNode[]
}

export interface Project {
  id: number
  name: string
  siteCode?: string
  client?: string
  gitlabUrl?: string
  gitlabToken?: string
  gitlabProjectId?: string
  gitlabBranch?: string
  gitlabAuthorEmail?: string
  createdAt: string
}

export interface Entry {
  id: number
  weekKey: string
  dateLabel: string
  dayOfWeek: string
  timeSlot: TimeSlot
  projectId?: number
  project?: Pick<Project, 'id' | 'name' | 'siteCode' | 'client'>
  customProjectName?: string
  tree: TreeNode[]
  isOffsite: boolean
  offsitePlace?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface DayStatusRecord {
  id: number
  weekKey: string
  dateLabel: string
  status: DayStatus
}

export interface WeekSummary {
  id: number
  weekKey: string
  thisWeek?: string
  nextWeek?: string
}

export interface AuthorInfo {
  id: number
  name: string
  dept: string
  rank: string
  email: string
}

// ── API 요청/응답 타입 ──

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface CreateEntryDto {
  weekKey: string
  dateLabel: string
  dayOfWeek: string
  timeSlot: TimeSlot
  projectId?: number
  customProjectName?: string
  tree: TreeNode[]
  isOffsite?: boolean
  offsitePlace?: string
  note?: string
}

export interface UpdateEntryDto extends Partial<CreateEntryDto> {}

export interface CreateProjectDto {
  name: string
  siteCode?: string
  client?: string
  gitlabUrl?: string
  gitlabToken?: string
  gitlabProjectId?: string
  gitlabBranch?: string
  gitlabAuthorEmail?: string
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export interface UpsertDayStatusDto {
  weekKey: string
  dateLabel: string
  status: DayStatus
}

export interface UpsertSummaryDto {
  weekKey: string
  thisWeek?: string
  nextWeek?: string
}

export interface WeekData {
  entries: Entry[]
  dayStatuses: DayStatusRecord[]
  summary?: WeekSummary
}

// ── 통계 타입 ──

export interface ProjectStat {
  projectId: number
  projectName: string
  year: number
  months: number[]       // 작업한 월 목록
  slots: number          // 오전/오후 슬롯 수
  days: number           // slots * 0.5
  mm: number             // days / 20
}

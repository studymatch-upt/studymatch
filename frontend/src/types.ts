// Mirrors the backend DTOs in com.qs.groupmatcher.dto.

export type Role = 'TEACHER' | 'STUDENT'

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface Group {
  id: number
  number: number
  name: string
  members: User[]
}

export interface ProjectDetail {
  id: number
  name: string
  description: string | null
  groupSize: number
  teacher: User
  createdAt: string
  groups: Group[]
}

export interface ProjectSummary {
  id: number
  name: string
  groupSize: number
  groupCount: number
  studentCount: number
  createdAt: string
}

export interface CreateProjectRequest {
  name: string
  description: string
  groupSize: number
  teacherId: number
  studentIds: number[]
}

import type { CreateProjectRequest, ProjectDetail, ProjectSummary } from '../types'
import { apiRequest } from './client'

export function createProject(request: CreateProjectRequest): Promise<ProjectDetail> {
  return apiRequest<ProjectDetail>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function fetchProject(id: number): Promise<ProjectDetail> {
  return apiRequest<ProjectDetail>(`/api/projects/${id}`)
}

export function fetchProjectsForTeacher(teacherId: number): Promise<ProjectSummary[]> {
  return apiRequest<ProjectSummary[]>(`/api/projects?teacherId=${teacherId}`)
}

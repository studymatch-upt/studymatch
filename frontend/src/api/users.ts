import type { Role, User } from '../types'
import { apiRequest } from './client'

export function fetchUsersByRole(role: Role): Promise<User[]> {
  return apiRequest<User[]>(`/api/users?role=${role}`)
}

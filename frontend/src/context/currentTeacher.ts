import { createContext, useContext } from 'react'
import type { User } from '../types'

/**
 * Stand-in for authentication: the teacher picks who they are from a dropdown.
 * Replace with the logged-in user once Spring Security is in place.
 */
export interface CurrentTeacherValue {
  teachers: User[]
  currentTeacher: User | undefined
  selectTeacher: (id: number) => void
  loading: boolean
  error: Error | undefined
}

export const CurrentTeacherContext = createContext<CurrentTeacherValue | undefined>(undefined)

export function useCurrentTeacher(): CurrentTeacherValue {
  const value = useContext(CurrentTeacherContext)
  if (!value) {
    throw new Error('useCurrentTeacher must be used inside <CurrentTeacherProvider>')
  }
  return value
}

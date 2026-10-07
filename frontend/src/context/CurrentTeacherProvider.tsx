import { useState, type ReactNode } from 'react'
import { useApi } from '../api/useApi'
import { fetchUsersByRole } from '../api/users'
import { CurrentTeacherContext } from './currentTeacher'

export function CurrentTeacherProvider({ children }: { children: ReactNode }) {
  const { data: teachers = [], loading, error } = useApi(
    () => fetchUsersByRole('TEACHER'),
    'teachers',
  )
  const [selectedId, setSelectedId] = useState<number>()

  const currentTeacher = teachers.find((t) => t.id === selectedId) ?? teachers[0]

  return (
    <CurrentTeacherContext.Provider
      value={{ teachers, currentTeacher, selectTeacher: setSelectedId, loading, error }}
    >
      {children}
    </CurrentTeacherContext.Provider>
  )
}

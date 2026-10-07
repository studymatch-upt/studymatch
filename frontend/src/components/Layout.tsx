import { Link, Outlet } from 'react-router'
import { useCurrentTeacher } from '../context/currentTeacher'

export function Layout() {
  const { teachers, currentTeacher, selectTeacher, error } = useCurrentTeacher()

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/projects" className="brand">
          Group Matcher
        </Link>
        <label className="acting-as">
          <span>Acting as</span>
          <select
            value={currentTeacher?.id ?? ''}
            onChange={(e) => selectTeacher(Number(e.target.value))}
            disabled={teachers.length === 0}
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main className="content">
        {error ? (
          <p role="alert" className="error">
            Could not reach the backend: {error.message}
          </p>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}

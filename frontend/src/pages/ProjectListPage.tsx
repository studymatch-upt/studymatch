import { Link } from 'react-router'
import { fetchProjectsForTeacher } from '../api/projects'
import { useApi } from '../api/useApi'
import { useCurrentTeacher } from '../context/currentTeacher'

export function ProjectListPage() {
  const { currentTeacher, loading: teacherLoading } = useCurrentTeacher()
  const teacherId = currentTeacher?.id ?? null
  const { data: projects, loading, error } = useApi(
    () => fetchProjectsForTeacher(teacherId!),
    teacherId,
  )

  return (
    <section>
      <div className="page-header">
        <h1>My projects</h1>
        <Link to="/projects/new" className="button primary">
          New project
        </Link>
      </div>

      {(teacherLoading || loading) && <p>Loading…</p>}
      {error && (
        <p role="alert" className="error">
          {error.message}
        </p>
      )}
      {projects && projects.length === 0 && (
        <p className="empty">No projects yet. Create one to form student groups.</p>
      )}
      {projects && projects.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Students</th>
              <th>Groups</th>
              <th>Max per group</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/projects/${p.id}`}>{p.name}</Link>
                </td>
                <td>{p.studentCount}</td>
                <td>{p.groupCount}</td>
                <td>{p.groupSize}</td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

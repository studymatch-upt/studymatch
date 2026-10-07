import { Link, useParams } from 'react-router'
import { fetchProject } from '../api/projects'
import { useApi } from '../api/useApi'

export function ProjectDetailPage() {
  const { id } = useParams()
  const projectId = Number(id)
  const validId = Number.isInteger(projectId) && projectId > 0
  const { data: project, loading, error } = useApi(
    () => fetchProject(projectId),
    validId ? projectId : null,
  )

  if (!validId) return <p className="error">Invalid project id.</p>
  if (loading) return <p>Loading…</p>
  if (error) {
    return (
      <p role="alert" className="error">
        {error.message}
      </p>
    )
  }
  if (!project) return null

  const studentCount = project.groups.reduce((sum, g) => sum + g.members.length, 0)

  return (
    <section>
      <Link to="/projects" className="back">
        ← All projects
      </Link>
      <div className="page-header">
        <h1>{project.name}</h1>
      </div>
      {project.description && <p className="description">{project.description}</p>}
      <p className="muted">
        {studentCount} students · {project.groups.length} groups · max {project.groupSize} per
        group
      </p>

      <div className="group-grid">
        {project.groups.map((group) => (
          <article key={group.id} className="group-card" aria-label={group.name}>
            <h2>
              {group.name} <span className="muted">({group.members.length})</span>
            </h2>
            <ul>
              {group.members.map((m) => (
                <li key={m.id}>{m.name}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

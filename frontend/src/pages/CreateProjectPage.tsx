import { useId, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { createProject } from '../api/projects'
import { useApi } from '../api/useApi'
import { fetchUsersByRole } from '../api/users'
import { useCurrentTeacher } from '../context/currentTeacher'

const MAX_GROUP_SIZE = 50

type FieldErrors = Partial<Record<'name' | 'groupSize' | 'studentIds', string>>

export function CreateProjectPage() {
  const navigate = useNavigate()
  const ids = useId()
  const { currentTeacher } = useCurrentTeacher()
  const { data: students = [], loading, error: loadError } = useApi(
    () => fetchUsersByRole('STUDENT'),
    'students',
  )

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [groupSize, setGroupSize] = useState('3')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const allSelected = students.length > 0 && selected.size === students.length

  function toggleStudent(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(students.map((s) => s.id)))
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    if (!name.trim()) errors.name = 'Name is required'
    const size = Number(groupSize)
    if (!Number.isInteger(size) || size < 1 || size > MAX_GROUP_SIZE) {
      errors.groupSize = `Enter a whole number between 1 and ${MAX_GROUP_SIZE}`
    }
    if (selected.size === 0) errors.studentIds = 'Select at least one student'
    return errors
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(undefined)
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0 || !currentTeacher) return

    setSubmitting(true)
    try {
      // Keep the on-screen order so groups follow the list the teacher sees.
      const studentIds = students.filter((s) => selected.has(s.id)).map((s) => s.id)
      const project = await createProject({
        name: name.trim(),
        description: description.trim(),
        groupSize: Number(groupSize),
        teacherId: currentTeacher.id,
        studentIds,
      })
      navigate(`/projects/${project.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors)
        setSubmitError(err.message)
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
      setSubmitting(false)
    }
  }

  return (
    <section>
      <div className="page-header">
        <h1>New project</h1>
        <Link to="/projects">Cancel</Link>
      </div>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor={`${ids}-name`}>Project name</label>
          <input
            id={`${ids}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? `${ids}-name-error` : undefined}
          />
          {fieldErrors.name && (
            <small id={`${ids}-name-error`} className="error">
              {fieldErrors.name}
            </small>
          )}
        </div>

        <div className="field">
          <label htmlFor={`${ids}-description`}>Description (optional)</label>
          <textarea
            id={`${ids}-description`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={3}
          />
        </div>

        <div className="field narrow">
          <label htmlFor={`${ids}-size`}>Students per group</label>
          <input
            id={`${ids}-size`}
            type="number"
            min={1}
            max={MAX_GROUP_SIZE}
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
            aria-invalid={!!fieldErrors.groupSize}
            aria-describedby={`${ids}-size-hint`}
          />
          <small id={`${ids}-size-hint`} className="hint">
            Maximum per group. Groups are balanced, so some may have one fewer.
          </small>
          {fieldErrors.groupSize && <small className="error">{fieldErrors.groupSize}</small>}
        </div>

        <fieldset className="field">
          <legend>
            Students <span className="muted">({selected.size} selected)</span>
          </legend>
          {loading && <p>Loading students…</p>}
          {loadError && (
            <p role="alert" className="error">
              {loadError.message}
            </p>
          )}
          {students.length > 0 && (
            <>
              <label className="checkbox select-all">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                Select all
              </label>
              <div className="student-grid">
                {students.map((s) => (
                  <label key={s.id} className="checkbox">
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggleStudent(s.id)}
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </>
          )}
          {fieldErrors.studentIds && <small className="error">{fieldErrors.studentIds}</small>}
        </fieldset>

        {submitError && (
          <p role="alert" className="error">
            {submitError}
          </p>
        )}

        <button type="submit" className="button primary" disabled={submitting || !currentTeacher}>
          {submitting ? 'Creating…' : 'Create project and form groups'}
        </button>
      </form>
    </section>
  )
}

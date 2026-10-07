import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CurrentTeacherProvider } from '../context/CurrentTeacherProvider'
import type { User } from '../types'
import { CreateProjectPage } from './CreateProjectPage'

const teacher: User = { id: 1, name: 'Ana Teacher', email: 'ana@test', role: 'TEACHER' }
const students: User[] = [
  { id: 10, name: 'Carla', email: 'c@test', role: 'STUDENT' },
  { id: 11, name: 'Diogo', email: 'd@test', role: 'STUDENT' },
  { id: 12, name: 'Eva', email: 'e@test', role: 'STUDENT' },
]

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === '/api/users?role=TEACHER') return json([teacher])
    if (url === '/api/users?role=STUDENT') return json(students)
    if (url === '/api/projects' && init?.method === 'POST') return json({ id: 77 }, 201)
    return json({ detail: `Unexpected ${url}` }, 500)
  })
  vi.stubGlobal('fetch', fetchMock)
})

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/projects/new']}>
      <CurrentTeacherProvider>
        <Routes>
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:id" element={<p>Detail page</p>} />
        </Routes>
      </CurrentTeacherProvider>
    </MemoryRouter>,
  )
}

function postedBody() {
  const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
  return call ? JSON.parse(call[1].body as string) : undefined
}

describe('CreateProjectPage', () => {
  it('shows validation errors and does not submit an incomplete form', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Carla')

    await user.click(screen.getByRole('button', { name: /create project/i }))

    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Select at least one student')).toBeInTheDocument()
    expect(postedBody()).toBeUndefined()
  })

  it('submits the project with the selected students and opens it', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Carla')

    await user.type(screen.getByLabelText('Project name'), '  Quality App ')
    const size = screen.getByLabelText('Students per group')
    await user.clear(size)
    await user.type(size, '2')
    await user.click(screen.getByLabelText('Select all'))
    await user.click(screen.getByLabelText('Diogo'))
    await user.click(screen.getByRole('button', { name: /create project/i }))

    expect(await screen.findByText('Detail page')).toBeInTheDocument()
    expect(postedBody()).toEqual({
      name: 'Quality App',
      description: '',
      groupSize: 2,
      teacherId: 1,
      studentIds: [10, 12],
    })
  })

  it('shows the server message when creation is rejected', async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === '/api/users?role=TEACHER') return json([teacher])
      if (url === '/api/users?role=STUDENT') return json(students)
      if (init?.method === 'POST') {
        return json({ title: 'Request not allowed', detail: 'Only teachers can create projects' }, 422)
      }
      return json({}, 500)
    })
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Carla')

    await user.type(screen.getByLabelText('Project name'), 'P')
    await user.click(screen.getByLabelText('Carla'))
    await user.click(screen.getByRole('button', { name: /create project/i }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Only teachers can create projects'),
    )
  })
})

import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { CurrentTeacherProvider } from './context/CurrentTeacherProvider'
import { CreateProjectPage } from './pages/CreateProjectPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { ProjectListPage } from './pages/ProjectListPage'

export default function App() {
  return (
    <BrowserRouter>
      <CurrentTeacherProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="projects" element={<ProjectListPage />} />
            <Route path="projects/new" element={<CreateProjectPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route
              path="*"
              element={
                <p>
                  Page not found. <Link to="/projects">Go to projects</Link>
                </p>
              }
            />
          </Route>
        </Routes>
      </CurrentTeacherProvider>
    </BrowserRouter>
  )
}

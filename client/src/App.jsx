import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CreatePostModal from './components/posts/CreatePostModal'
import { useAuthStore } from './store/authStore'

export default function App() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-bright)',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: 'var(--neon-green)', secondary: 'var(--bg-card)' },
          },
          error: {
            iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' },
          },
        }}
      />

      <Navbar onCreatePost={() => setShowCreateModal(true)} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>

      {showCreateModal && isAuthenticated() && (
        <CreatePostModal onClose={() => setShowCreateModal(false)} />
      )}
    </Router>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(username.trim(), password)
      toast.success('Welcome back! 🕶️')
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent), var(--neon-green))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px var(--accent-glow)',
          }}>
            <Zap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Your anonymous identity awaits
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32, border: '1px solid var(--border-bright)' }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Username
            </label>
            <input
              id="login-username"
              className="input"
              type="text"
              placeholder="Your random username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ marginBottom: 16 }}
            />

            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <input
                id="login-password"
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: '100%', padding: '12px' }}
            >
              {isLoading ? 'Logging in...' : 'Log In Anonymously'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--accent-bright)', fontWeight: 600, textDecoration: 'none' }}>
              Create an anonymous account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

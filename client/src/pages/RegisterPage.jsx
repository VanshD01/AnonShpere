import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, Zap, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    try {
      const user = await register(password)
      toast.success(`Welcome, ${user.username}! 🎭`)
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
      <div style={{ width: '100%', maxWidth: 420 }}>
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
            Join <span className="neon-text">AnonSphere</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No email. No real name. Just a password.
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32, border: '1px solid var(--border-bright)' }}>
          {/* Info banner */}
          <div style={{
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <Lock size={15} style={{ color: 'var(--accent-bright)', marginTop: 1, flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              We'll generate a <strong style={{ color: 'var(--accent-bright)' }}>random anonymous username</strong> for you. Only your password is stored (hashed).
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Choose a Password
            </label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                id="register-password"
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="At least 6 characters"
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

            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Confirm Password
            </label>
            <input
              id="register-confirm"
              className="input"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={{ marginBottom: 24 }}
            />

            <button
              id="register-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: '100%', padding: '12px' }}
            >
              {isLoading ? 'Creating your identity...' : 'Create Anonymous Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-bright)', fontWeight: 600, textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

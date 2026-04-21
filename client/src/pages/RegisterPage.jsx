import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, Zap, Lock, CheckCircle, Shield, Sparkles, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

// Password strength calculator
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'transparent' }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' }
  if (score === 2) return { score, label: 'Fair', color: '#f97316' }
  if (score === 3) return { score, label: 'Good', color: '#eab308' }
  return { score, label: 'Strong', color: '#00ff88' }
}

export default function RegisterPage() {
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [createdUser, setCreatedUser] = useState(null)
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 4,
    }))
  )

  const strength = getPasswordStrength(password)
  const passwordsMatch = confirm.length > 0 && password === confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    try {
      const user = await register(password)
      setCreatedUser(user)
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Auto-redirect after showing the username
  useEffect(() => {
    if (createdUser) {
      const timer = setTimeout(() => {
        toast.success(`Welcome, ${createdUser.username}! 🎭`)
        navigate('/')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [createdUser, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background gradient */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(0,255,136,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.id % 2 === 0 ? 'var(--accent)' : 'var(--neon-green)',
          opacity: 0.15,
          animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); opacity: 0.1; }
          to { transform: translateY(-30px) scale(1.5); opacity: 0.25; }
        }
        @keyframes successPop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,136,0.3); }
          50% { box-shadow: 0 0 40px rgba(0,255,136,0.6), 0 0 80px rgba(0,255,136,0.2); }
        }
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        .strength-bar {
          height: 4px;
          border-radius: 2px;
          transition: width 0.4s ease, background-color 0.4s ease;
        }
        .register-input:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--accent-glow) !important;
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* ── SUCCESS STATE ── */}
        {createdUser ? (
          <div style={{ textAlign: 'center', animation: 'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
            {/* Big green checkmark */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
              background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,255,136,0.05))',
              border: '2px solid var(--neon-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}>
              <CheckCircle size={40} color="var(--neon-green)" strokeWidth={1.5} />
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
              Identity <span className="neon-text">Created!</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 32 }}>
              Your anonymous username has been assigned
            </p>

            <div className="glass-card" style={{
              padding: '24px 32px',
              border: '1px solid rgba(0,255,136,0.25)',
              background: 'rgba(0,255,136,0.04)',
              marginBottom: 20,
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Your anonymous identity
              </p>
              <p style={{
                fontSize: '1.5rem', fontWeight: 800,
                background: 'linear-gradient(135deg, var(--neon-green), var(--accent-bright))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
              }}>
                {createdUser.username}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                <span style={{ color: '#ef4444' }}>⚠</span> Save this username — you'll need it to log in
              </p>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Redirecting you to the feed in a moment...
            </p>

            <button
              onClick={() => { toast.success(`Welcome, ${createdUser.username}! 🎭`); navigate('/') }}
              className="btn-primary"
              style={{ marginTop: 20, width: '100%', padding: '12px' }}
            >
              Enter AnonSphere <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* ── HEADER ── */}
            <div style={{ textAlign: 'center', marginBottom: 32, animation: 'slideUp 0.4s ease' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, margin: '0 auto 20px',
                background: 'linear-gradient(135deg, var(--accent), var(--neon-green))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px var(--accent-glow), 0 0 80px rgba(0,255,136,0.1)',
              }}>
                <Zap size={30} color="white" />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
                Join <span className="neon-text">AnonSphere</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No email. No real name. Just a password.
              </p>
            </div>

            {/* ── FORM CARD ── */}
            <div className="glass-card" style={{
              padding: '32px',
              border: '1px solid var(--border-bright)',
              animation: 'slideUp 0.4s ease 0.1s both',
            }}>
              {/* Info banner */}
              <div style={{
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 12, padding: '14px 16px', marginBottom: 28,
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield size={16} color="var(--accent-bright)" />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                    100% Anonymous
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    We'll generate a <strong style={{ color: 'var(--accent-bright)' }}>random username</strong> for you.
                    Only your hashed password is stored — no email, no tracking.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Password field */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Choose a Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="register-password"
                      className="input register-input"
                      type={showPw ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      style={{
                        position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                        padding: 2, display: 'flex', alignItems: 'center',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="strength-bar" style={{
                            flex: 1,
                            background: i <= strength.score ? strength.color : 'var(--border)',
                          }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Password strength</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: strength.color }}>
                          {strength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="register-confirm"
                      className="input register-input"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      style={{
                        paddingRight: 44,
                        borderColor: confirm.length > 0
                          ? passwordsMatch ? 'rgba(0,255,136,0.5)' : 'rgba(239,68,68,0.5)'
                          : undefined,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                        padding: 2, display: 'flex', alignItems: 'center',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirm.length > 0 && (
                    <p style={{
                      fontSize: '0.72rem', marginTop: 6,
                      color: passwordsMatch ? 'var(--neon-green)' : '#ef4444',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {passwordsMatch ? (
                        <><CheckCircle size={11} /> Passwords match</>
                      ) : (
                        <>✗ Passwords don't match</>
                      )}
                    </p>
                  )}
                </div>

                <button
                  id="register-submit-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                  style={{ width: '100%', padding: '13px', fontSize: '0.95rem', letterSpacing: '0.01em' }}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Generating your identity...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Create Anonymous Account
                    </>
                  )}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--accent-bright)', fontWeight: 600, textDecoration: 'none' }}>
                  Log in
                </Link>
              </p>
            </div>

            {/* Features row */}
            <div style={{
              display: 'flex', gap: 8, marginTop: 20, justifyContent: 'center',
              animation: 'slideUp 0.4s ease 0.2s both',
            }}>
              {[
                { icon: '🕵️', label: 'No tracking' },
                { icon: '🔒', label: 'Encrypted' },
                { icon: '🎭', label: 'Anonymous' },
              ].map(f => (
                <div key={f.label} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 999, fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                }}>
                  <span>{f.icon}</span> {f.label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

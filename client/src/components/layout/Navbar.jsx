import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LogOut, User, Zap, PlusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar({ onCreatePost }) {
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--neon-green))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span className="neon-text">Anon</span>
            <span style={{ color: 'var(--text-primary)' }}>Sphere</span>
          </span>
        </Link>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated() ? (
            <>
              <button
                id="create-post-btn"
                className="btn-primary"
                onClick={onCreatePost}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <PlusCircle size={16} />
                New Post
              </button>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), #5b21b6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: 'white',
                }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.username}
                </span>
              </div>
              <button className="btn-ghost" onClick={handleLogout} style={{ padding: '7px 12px' }}>
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="btn-ghost">Log In</button>
              </Link>
              <Link to="/register">
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Join Anonymously
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

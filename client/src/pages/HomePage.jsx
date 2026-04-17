import { useState } from 'react'
import Feed from '../components/posts/Feed'
import CreatePostModal from '../components/posts/CreatePostModal'
import { useAuthStore } from '../store/authStore'
import { Zap, Shield, Eye } from 'lucide-react'

export default function HomePage() {
  const [showModal, setShowModal] = useState(false)
  const { isAuthenticated } = useAuthStore()

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
      {/* Main feed */}
      <main>
        {/* Hero banner */}
        <div className="glass-card" style={{
          padding: '28px 28px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(0,255,136,0.05))',
          border: '1px solid rgba(124,58,237,0.3)',
        }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>
            Speak Freely on{' '}
            <span className="neon-text">AnonSphere</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            Your identity is hidden. Your voice is not. Post anything, vote on what matters, reply to everyone.
          </p>
          {!isAuthenticated() && (
            <a href="/register">
              <button className="btn-primary">
                <Zap size={15} />
                Join Anonymously — It's Free
              </button>
            </a>
          )}
          {isAuthenticated() && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Zap size={15} />
              Create Anonymous Post
            </button>
          )}
        </div>

        <Feed />
      </main>

      {/* Sidebar */}
      <aside>
        <div className="glass-card" style={{ padding: 20, marginBottom: 16, position: 'sticky', top: 80 }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            How it works
          </h3>
          {[
            { icon: <Shield size={16} style={{ color: 'var(--accent-bright)' }} />, title: 'Fully Anonymous', desc: 'A random username is assigned. No email needed.' },
            { icon: <Eye size={16} style={{ color: 'var(--neon-green)' }} />, title: 'AI Moderation', desc: 'Content is auto-checked for safety before posting.' },
            { icon: <Zap size={16} style={{ color: 'var(--upvote)' }} />, title: 'Trending Algorithm', desc: 'Posts rise & fall based on votes and time.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {showModal && <CreatePostModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

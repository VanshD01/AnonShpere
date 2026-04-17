import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUp, ArrowDown, MessageCircle, Trash2, Image } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { usePostStore } from '../../store/postStore'
import toast from 'react-hot-toast'

export default function PostCard({ post }) {
  const { user, isAuthenticated } = useAuthStore()
  const { votePost, deletePost } = usePostStore()
  const navigate = useNavigate()

  const [localVotes, setLocalVotes] = useState({
    upvotes: post.upvotes?.length ?? 0,
    downvotes: post.downvotes?.length ?? 0,
    userVote: null,
  })
  const [isVoting, setIsVoting] = useState(false)

  const isOwner = user && post.user?._id === user._id
  const voteCount = localVotes.upvotes - localVotes.downvotes

  const handleVote = async (voteType) => {
    if (!isAuthenticated()) {
      toast.error('Log in to vote')
      navigate('/login')
      return
    }
    if (isVoting) return
    setIsVoting(true)
    try {
      const result = await votePost(post._id, voteType)
      setLocalVotes({
        upvotes: result.upvotes,
        downvotes: result.downvotes,
        userVote: result.userVote,
      })
    } catch {
      toast.error('Failed to vote')
    } finally {
      setIsVoting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(post._id)
      toast.success('Post deleted')
    } catch {
      toast.error('Failed to delete post')
    }
  }

  return (
    <article className="glass-card fade-in" style={{ padding: '20px 24px', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, hsl(${hashColor(post.user?.username)}, 70%, 45%), hsl(${hashColor(post.user?.username) + 40}, 60%, 35%))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: 'white',
          }}>
            {post.user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {post.user?.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDelete}
            className="btn-ghost"
            style={{ padding: '4px 8px', color: 'var(--danger)', borderColor: 'transparent' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <Link to={`/post/${post._id}`} style={{ textDecoration: 'none' }}>
        <p style={{
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          marginBottom: 14,
          cursor: 'pointer',
        }}>
          {post.content}
        </p>

        {/* Image */}
        {post.imageUrl && (
          <div style={{ marginBottom: 14, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img
              src={post.imageUrl}
              alt="Post image"
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}
      </Link>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {post.tags.map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          id={`upvote-${post._id}`}
          className={`vote-btn ${localVotes.userVote === 'upvote' ? 'active-up' : ''}`}
          onClick={() => handleVote('upvote')}
          disabled={isVoting}
        >
          <ArrowUp size={14} />
          {localVotes.upvotes}
        </button>

        <button
          id={`downvote-${post._id}`}
          className={`vote-btn ${localVotes.userVote === 'downvote' ? 'active-down' : ''}`}
          onClick={() => handleVote('downvote')}
          disabled={isVoting}
        >
          <ArrowDown size={14} />
          {localVotes.downvotes}
        </button>

        <Link to={`/post/${post._id}`} style={{ textDecoration: 'none' }}>
          <button className="vote-btn">
            <MessageCircle size={14} />
            {typeof post.comments === 'number' ? post.comments : post.comments?.length ?? 0}
          </button>
        </Link>
      </div>
    </article>
  )
}

// Generate a consistent hue from a username string
function hashColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

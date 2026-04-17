import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePostStore } from '../store/postStore'
import CommentSection from '../components/comments/CommentSection'
import { ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { PostSkeleton } from '../components/ui/Skeleton'

export default function PostPage() {
  const { id } = useParams()
  const { currentPost, isLoading, fetchPostById } = usePostStore()

  useEffect(() => {
    fetchPostById(id)
  }, [id])

  if (isLoading) return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: '0 16px' }}>
      <PostSkeleton />
    </div>
  )

  if (!currentPost) return (
    <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--text-muted)' }}>
      Post not found.{' '}
      <Link to="/" style={{ color: 'var(--accent-bright)' }}>Go home</Link>
    </div>
  )

  const voteCount = currentPost.upvotes?.length - currentPost.downvotes?.length

  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: '0 16px' }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
        <ArrowLeft size={15} /> Back to feed
      </Link>

      <article className="glass-card fade-in" style={{ padding: '28px 28px', marginBottom: 0 }}>
        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: `linear-gradient(135deg, hsl(${hashColor(currentPost.user?.username)}, 70%, 45%), hsl(${hashColor(currentPost.user?.username) + 40}, 60%, 35%))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 700, color: 'white',
          }}>
            {currentPost.user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{currentPost.user?.username}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(currentPost.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Content */}
        <p style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
          {currentPost.content}
        </p>

        {/* Image */}
        {currentPost.imageUrl && (
          <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 20, border: '1px solid var(--border)' }}>
            <img src={currentPost.imageUrl} alt="Post" style={{ width: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Tags */}
        {currentPost.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {currentPost.tags.map((tag) => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Vote display (read-only on post page) */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 0', borderTop: '1px solid var(--border)' }}>
          <span className="vote-btn">
            <ArrowUp size={14} style={{ color: 'var(--upvote)' }} />
            {currentPost.upvotes?.length}
          </span>
          <span className="vote-btn">
            <ArrowDown size={14} style={{ color: 'var(--downvote)' }} />
            {currentPost.downvotes?.length}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 4 }}>
            {voteCount > 0 ? '+' : ''}{voteCount} net votes
          </span>
        </div>

        {/* Comments */}
        <CommentSection postId={id} />
      </article>
    </div>
  )
}

function hashColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

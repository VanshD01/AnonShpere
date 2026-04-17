import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUp, ArrowDown, Reply, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

// Recursive comment tree node
function CommentNode({ comment, allComments, depth = 0, postId, onReply, onDelete }) {
  const { user } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [localVotes, setLocalVotes] = useState({
    upvotes: comment.upvotes?.length ?? 0,
    downvotes: comment.downvotes?.length ?? 0,
    userVote: null,
  })

  const replies = allComments.filter(
    (c) => c.parentCommentId === comment._id
  )
  const isOwner = user && comment.user?._id === user._id

  const handleVote = async (voteType) => {
    if (!user) { toast.error('Log in to vote'); return }
    try {
      const { data } = await api.post(`/posts/${postId}/comments/${comment._id}/vote`, { voteType })
      setLocalVotes({ upvotes: data.data.upvotes, downvotes: data.data.downvotes, userVote: voteType })
    } catch { toast.error('Vote failed') }
  }

  return (
    <div style={{ marginLeft: depth > 0 ? Math.min(depth * 20, 60) : 0 }}>
      <div
        className="glass-card"
        style={{
          padding: '14px 16px',
          marginBottom: 8,
          borderLeft: depth > 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
          borderRadius: depth > 0 ? '0 12px 12px 0' : 12,
          opacity: collapsed ? 0.6 : 1,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: `linear-gradient(135deg, hsl(${hashColor(comment.user?.username)}, 70%, 40%), hsl(${hashColor(comment.user?.username) + 40}, 60%, 30%))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {comment.user?.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{comment.user?.username}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {replies.length > 0 && (
              <button
                className="btn-ghost"
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                {replies.length}
              </button>
            )}
            {isOwner && (
              <button
                className="btn-ghost"
                onClick={() => onDelete(comment._id)}
                style={{ padding: '2px 6px', color: 'var(--danger)', borderColor: 'transparent' }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 10 }}>
          {comment.content}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`vote-btn ${localVotes.userVote === 'upvote' ? 'active-up' : ''}`}
            onClick={() => handleVote('upvote')}
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
          >
            <ArrowUp size={12} /> {localVotes.upvotes}
          </button>
          <button
            className={`vote-btn ${localVotes.userVote === 'downvote' ? 'active-down' : ''}`}
            onClick={() => handleVote('downvote')}
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
          >
            <ArrowDown size={12} /> {localVotes.downvotes}
          </button>
          {depth < 4 && (
            <button
              className="btn-ghost"
              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              onClick={() => onReply(comment._id)}
            >
              <Reply size={12} /> Reply
            </button>
          )}
        </div>
      </div>

      {/* Recursive replies */}
      {!collapsed && replies.map((reply) => (
        <CommentNode
          key={reply._id}
          comment={reply}
          allComments={allComments}
          depth={depth + 1}
          postId={postId}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

// Main CommentSection component
export default function CommentSection({ postId }) {
  const { user, isAuthenticated } = useAuthStore()
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyTo, setReplyTo] = useState(null) // commentId being replied to
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments`)
      setComments(data.data)
    } catch { toast.error('Failed to load comments') }
    finally { setIsLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setIsSubmitting(true)
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, {
        content: content.trim(),
        parentCommentId: replyTo || undefined,
      })
      setComments((prev) => [...prev, data.data])
      setContent('')
      setReplyTo(null)
      toast.success('Comment posted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c._id !== commentId && c.parentCommentId !== commentId))
      toast.success('Comment deleted')
    } catch { toast.error('Failed to delete comment') }
  }

  // Only top-level comments (no parent)
  const topLevel = comments.filter((c) => !c.parentCommentId)

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-secondary)' }}>
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h3>

      {/* Comment form */}
      {isAuthenticated() ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          {replyTo && (
            <div style={{
              fontSize: '0.8rem', color: 'var(--accent-bright)',
              marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <Reply size={13} />
              Replying to a comment
              <button type="button" onClick={() => setReplyTo(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                × cancel
              </button>
            </div>
          )}
          <textarea
            id="comment-input"
            className="textarea"
            placeholder="Add a comment anonymously..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            style={{ marginBottom: 10 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              id="submit-comment-btn"
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !content.trim()}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-card" style={{ padding: 16, marginBottom: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <a href="/login" style={{ color: 'var(--accent-bright)' }}>Log in</a> to join the conversation
        </div>
      )}

      {/* Comment tree */}
      {isLoading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Loading comments...</div>
      ) : topLevel.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20, fontSize: '0.875rem' }}>
          No comments yet. Be the first!
        </div>
      ) : (
        topLevel.map((c) => (
          <CommentNode
            key={c._id}
            comment={c}
            allComments={comments}
            postId={postId}
            onReply={setReplyTo}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  )
}

function hashColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

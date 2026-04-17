import { useState, useEffect, useRef } from 'react'
import { usePostStore } from '../../store/postStore'
import PostCard from './PostCard'
import { FeedSkeleton } from '../ui/Skeleton'
import { TrendingUp, Clock, Frown } from 'lucide-react'

export default function Feed() {
  const { posts, isLoading, pagination, activeTab, setTab, fetchPosts } = usePostStore()
  const [page, setPage] = useState(1)
  const loaderRef = useRef(null)

  // Fetch when tab changes
  useEffect(() => {
    setPage(1)
    fetchPosts(1, true)
  }, [activeTab])

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current || activeTab === 'trending') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && pagination.hasMore) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchPosts(nextPage)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [isLoading, pagination, page, activeTab])

  return (
    <div>
      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
      }}>
        {[
          { key: 'latest', label: 'Latest', icon: <Clock size={15} /> },
          { key: 'trending', label: 'Trending', icon: <TrendingUp size={15} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            id={`tab-${key}`}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              background: activeTab === key
                ? 'linear-gradient(135deg, var(--accent), #5b21b6)'
                : 'transparent',
              color: activeTab === key ? 'white' : 'var(--text-secondary)',
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {isLoading && posts.length === 0 ? (
        <FeedSkeleton count={4} />
      ) : posts.length === 0 && !isLoading ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: 'var(--text-muted)',
        }}>
          <Frown size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem' }}>No posts yet. Be the first to post anonymously!</p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      )}

      {/* Infinite scroll trigger + loading indicator */}
      <div ref={loaderRef} style={{ padding: 20, textAlign: 'center' }}>
        {isLoading && posts.length > 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading more posts...</div>
        )}
        {!pagination.hasMore && posts.length > 0 && activeTab === 'latest' && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>You've reached the end ✓</div>
        )}
      </div>
    </div>
  )
}

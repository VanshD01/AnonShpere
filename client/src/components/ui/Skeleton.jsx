// Skeleton loader for a post card
export function PostSkeleton() {
  return (
    <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: '20%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 16, marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 8 }} />
      </div>
    </div>
  )
}

// Feed skeleton (multiple cards)
export function FeedSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </>
  )
}

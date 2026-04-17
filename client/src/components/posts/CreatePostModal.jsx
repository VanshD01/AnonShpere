import { useState, useRef } from 'react'
import { X, Image, Tag, Send, AlertCircle } from 'lucide-react'
import { usePostStore } from '../../store/postStore'
import toast from 'react-hot-toast'

export default function CreatePostModal({ onClose }) {
  const { createPost } = usePostStore()
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileRef = useRef()

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) { toast.error('Write something first!'); return }
    if (content.length > 2000) { toast.error('Post is too long (max 2000 chars)'); return }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('content', content.trim())
      if (tags.trim()) formData.append('tags', tags)
      if (image) formData.append('image', image)

      await createPost(formData)
      toast.success('Post published anonymously 🕶️')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      animation: 'fadeIn 0.2s ease',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: 600,
        padding: 28,
        border: '1px solid var(--border-bright)',
        boxShadow: '0 0 60px rgba(124,58,237,0.2)',
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Post <span className="neon-text">Anonymously</span>
          </h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Content */}
          <textarea
            id="post-content"
            className="textarea"
            placeholder="What's on your mind? (You're anonymous here...)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            style={{ marginBottom: 4 }}
          />
          <div style={{
            textAlign: 'right', fontSize: '0.75rem',
            color: content.length > 1800 ? 'var(--danger)' : 'var(--text-muted)',
            marginBottom: 14
          }}>
            {content.length}/2000
          </div>

          {/* Tags */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Tag size={15} style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              id="post-tags"
              className="input"
              placeholder="Tags: tech, news, rant (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          {/* Image preview */}
          {preview && (
            <div style={{ position: 'relative', marginBottom: 14, borderRadius: 10, overflow: 'hidden' }}>
              <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />
              <button
                type="button"
                onClick={removeImage}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(0,0,0,0.7)', border: 'none',
                  borderRadius: '50%', padding: 4, cursor: 'pointer', color: 'white',
                  display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Footer actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => fileRef.current?.click()}
            >
              <Image size={15} />
              Add Image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              style={{ display: 'none' }}
            />

            <button
              id="submit-post-btn"
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !content.trim()}
            >
              <Send size={15} />
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

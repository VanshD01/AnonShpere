import { create } from 'zustand'
import api from '../services/api'

export const usePostStore = create((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, hasMore: true, totalPages: 1 },
  activeTab: 'latest', // 'latest' | 'trending'

  setTab: (tab) => {
    set({ activeTab: tab, posts: [], pagination: { page: 1, hasMore: true, totalPages: 1 } })
  },

  fetchPosts: async (page = 1, reset = false) => {
    const { activeTab } = get()
    set({ isLoading: true, error: null })
    try {
      let data
      if (activeTab === 'trending') {
        const res = await api.get('/posts/trending')
        data = { data: { data: res.data.data, pagination: { hasMore: false } } }
      } else {
        const res = await api.get(`/posts?page=${page}&limit=10`)
        data = res
      }

      const newPosts = data.data.data
      set((state) => ({
        posts: reset || page === 1 ? newPosts : [...state.posts, ...newPosts],
        pagination: data.data.pagination || { hasMore: false },
        isLoading: false,
      }))
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch posts', isLoading: false })
    }
  },

  fetchPostById: async (id) => {
    set({ isLoading: true, currentPost: null })
    try {
      const { data } = await api.get(`/posts/${id}`)
      set({ currentPost: data.data, isLoading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Post not found', isLoading: false })
    }
  },

  createPost: async (formData) => {
    const { data } = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    set((state) => ({ posts: [data.data, ...state.posts] }))
    return data.data
  },

  deletePost: async (id) => {
    await api.delete(`/posts/${id}`)
    set((state) => ({ posts: state.posts.filter((p) => p._id !== id) }))
  },

  votePost: async (id, voteType) => {
    const { data } = await api.post(`/posts/${id}/vote`, { voteType })
    set((state) => ({
      posts: state.posts.map((p) =>
        p._id === id
          ? { ...p, upvotes: Array(data.data.upvotes).fill(null), downvotes: Array(data.data.downvotes).fill(null) }
          : p
      ),
    }))
    return data.data
  },
}))

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  votePost,
  getTrendingPosts,
} = require('../controllers/postController');

const {
  createComment,
  getComments,
  deleteComment,
  voteComment,
} = require('../controllers/commentController');

const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Rate limiter: max 10 posts per 15 minutes per IP
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many posts. Please wait before posting again.' },
});

// Rate limiter: max 30 comments per 15 minutes per IP
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many comments. Please slow down.' },
});

// --- Post Routes ---

// GET /api/posts/trending   (must be before /:id to avoid param conflict)
router.get('/trending', getTrendingPosts);

// GET /api/posts
router.get('/', getPosts);

// POST /api/posts  (with image upload support and rate limiting)
router.post('/', protect, postLimiter, upload.single('image'), createPost);

// GET /api/posts/:id
router.get('/:id', getPostById);

// PUT /api/posts/:id
router.put('/:id', protect, updatePost);

// DELETE /api/posts/:id
router.delete('/:id', protect, deletePost);

// POST /api/posts/:id/vote
router.post('/:id/vote', protect, votePost);

// --- Comment Routes (nested under posts) ---

// GET /api/posts/:id/comments
router.get('/:id/comments', getComments);

// POST /api/posts/:id/comments  (with rate limiting)
router.post('/:id/comments', protect, commentLimiter, createComment);

// DELETE /api/posts/:id/comments/:commentId
router.delete('/:id/comments/:commentId', protect, deleteComment);

// POST /api/posts/:id/comments/:commentId/vote
router.post('/:id/comments/:commentId/vote', protect, voteComment);

module.exports = router;

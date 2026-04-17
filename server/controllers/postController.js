const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { content, tags } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Post content is required');
  }

  const postData = {
    user: req.user._id,
    content,
    tags: tags
      ? tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [],
  };

  // If an image was uploaded, Cloudinary URL is in req.file
  if (req.file) {
    postData.imageUrl = req.file.path;
    postData.imagePublicId = req.file.filename;
  }

  const post = await Post.create(postData);
  await post.populate('user', 'username');

  res.status(201).json({ success: true, data: post });
});

// @desc    Get all posts (Latest)
// @route   GET /api/posts?page=1&limit=10&tag=
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const tag = req.query.tag;

  const filter = tag ? { tags: tag } : {};

  const total = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .populate('user', 'username')
    .populate('comments') // Returns count only (virtual)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
});

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('user', 'username')
    .populate('comments');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  res.json({ success: true, data: post });
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (owner only)
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Only owner can update
  if (post.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this post');
  }

  const { content, tags } = req.body;
  if (content) post.content = content;
  if (tags) post.tags = tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

  const updatedPost = await post.save();
  await updatedPost.populate('user', 'username');

  res.json({ success: true, data: updatedPost });
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (owner only)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  // Delete image from Cloudinary if it exists
  if (post.imagePublicId) {
    await cloudinary.uploader.destroy(post.imagePublicId);
  }

  // Delete all associated comments
  await Comment.deleteMany({ post: post._id });

  await post.deleteOne();

  res.json({ success: true, message: 'Post deleted successfully' });
});

// @desc    Vote on a post (upvote or downvote)
// @route   POST /api/posts/:id/vote
// @access  Private
const votePost = asyncHandler(async (req, res) => {
  const { voteType } = req.body; // 'upvote' or 'downvote'

  if (!['upvote', 'downvote'].includes(voteType)) {
    res.status(400);
    throw new Error("voteType must be 'upvote' or 'downvote'");
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const userId = req.user._id;
  const hasUpvoted = post.upvotes.includes(userId);
  const hasDownvoted = post.downvotes.includes(userId);

  if (voteType === 'upvote') {
    if (hasUpvoted) {
      // Toggle off upvote
      post.upvotes.pull(userId);
    } else {
      post.upvotes.push(userId);
      // Remove from downvotes if switching
      post.downvotes.pull(userId);
    }
  } else {
    if (hasDownvoted) {
      // Toggle off downvote
      post.downvotes.pull(userId);
    } else {
      post.downvotes.push(userId);
      // Remove from upvotes if switching
      post.upvotes.pull(userId);
    }
  }

  await post.save();

  res.json({
    success: true,
    data: {
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      voteCount: post.upvotes.length - post.downvotes.length,
      userVote: post.upvotes.includes(userId)
        ? 'upvote'
        : post.downvotes.includes(userId)
        ? 'downvote'
        : null,
    },
  });
});

// @desc    Get trending posts (decay formula)
// @route   GET /api/posts/trending
// @access  Public
const getTrendingPosts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const hoursWindow = 48; // Only consider posts from last 48 hours for trending

  const since = new Date(Date.now() - hoursWindow * 60 * 60 * 1000);

  const posts = await Post.find({ createdAt: { $gte: since } })
    .populate('user', 'username')
    .populate('comments');

  // Trending score formula: (upvotes - downvotes + 1) / (hours_since_post + 2)^1.5
  const scored = posts.map((post) => {
    const votes = post.upvotes.length - post.downvotes.length;
    const hoursSincePost = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
    const score = (votes + 1) / Math.pow(hoursSincePost + 2, 1.5);
    return { ...post.toJSON(), trendingScore: score };
  });

  scored.sort((a, b) => b.trendingScore - a.trendingScore);

  res.json({ success: true, data: scored.slice(0, limit) });
});

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  votePost,
  getTrendingPosts,
};

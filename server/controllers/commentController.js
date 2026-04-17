const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Create a comment or reply on a post
// @route   POST /api/posts/:id/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { content, parentCommentId } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Comment content is required');
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // If it's a reply, verify the parent comment exists and belongs to this post
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment || parentComment.post.toString() !== req.params.id) {
      res.status(404);
      throw new Error('Parent comment not found');
    }
  }

  const comment = await Comment.create({
    post: req.params.id,
    user: req.user._id,
    content,
    parentCommentId: parentCommentId || null,
  });

  await comment.populate('user', 'username');

  res.status(201).json({ success: true, data: comment });
});

// @desc    Get all comments for a post (flat list — frontend assembles the tree)
// @route   GET /api/posts/:id/comments
// @access  Public
const getComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Fetch all comments for this post, sorted oldest first for proper tree building
  const comments = await Comment.find({ post: req.params.id })
    .populate('user', 'username')
    .sort({ createdAt: 1 });

  res.json({ success: true, data: comments });
});

// @desc    Delete a comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private (owner only)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  // Also delete all child replies
  await Comment.deleteMany({ parentCommentId: comment._id });
  await comment.deleteOne();

  res.json({ success: true, message: 'Comment deleted successfully' });
});

// @desc    Vote on a comment
// @route   POST /api/posts/:id/comments/:commentId/vote
// @access  Private
const voteComment = asyncHandler(async (req, res) => {
  const { voteType } = req.body;

  if (!['upvote', 'downvote'].includes(voteType)) {
    res.status(400);
    throw new Error("voteType must be 'upvote' or 'downvote'");
  }

  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const userId = req.user._id;
  const hasUpvoted = comment.upvotes.includes(userId);
  const hasDownvoted = comment.downvotes.includes(userId);

  if (voteType === 'upvote') {
    if (hasUpvoted) {
      comment.upvotes.pull(userId);
    } else {
      comment.upvotes.push(userId);
      comment.downvotes.pull(userId);
    }
  } else {
    if (hasDownvoted) {
      comment.downvotes.pull(userId);
    } else {
      comment.downvotes.push(userId);
      comment.upvotes.pull(userId);
    }
  }

  await comment.save();

  res.json({
    success: true,
    data: {
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
      voteCount: comment.upvotes.length - comment.downvotes.length,
    },
  });
});

module.exports = { createComment, getComments, deleteComment, voteComment };

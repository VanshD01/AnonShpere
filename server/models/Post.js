const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [2000, 'Post content cannot exceed 2000 characters'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String, // Cloudinary public ID (needed to delete the image later)
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Pre-calculated trending score (updated by a background process in Phase 5)
    trendingScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field: net vote count
postSchema.virtual('voteCount').get(function () {
  return this.upvotes.length - this.downvotes.length;
});

// Virtual field: comment count (populated via Comment model)
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true, // This returns just the count
});

// Index for performance (Phase 5)
postSchema.index({ createdAt: -1 });
postSchema.index({ trendingScore: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);

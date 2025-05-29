import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  mentions: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  mentions: [String],
  replies: [replySchema],
  likes: [mongoose.Schema.Types.Mixed],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['GENERAL', 'LOST_PETS', 'FOUND_PETS', 'ADOPTION', 'VOLUNTEER', 'HELP', 'SUCCESS_STORIES']
  },
  author: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  images: [{
    type: String,
    required: false
  }],
  mentions: [String],
  comments: [commentSchema],
  likes: [mongoose.Schema.Types.Mixed],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add text index for search functionality
postSchema.index({ title: 'text', content: 'text' });

const Post = mongoose.model('Post', postSchema);
export default Post; 
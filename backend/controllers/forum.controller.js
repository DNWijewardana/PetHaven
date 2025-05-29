import Post from '../models/Post.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

// Extract mentions from content
const extractMentions = async (content) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = content.match(mentionRegex) || [];
  const usernames = mentions.map(mention => mention.slice(1));
  
  if (usernames.length === 0) return [];
  
  const users = await User.find({ 
    name: { $in: usernames }
  });
  
  return users.map(user => user._id);
};

// Get all posts with pagination
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    
    const query = category ? { category } : {};
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name email picture')
      .populate('mentions', 'name email picture')
      .populate({
        path: 'comments',
        populate: [{
          path: 'author',
          select: 'name email picture'
        }, {
          path: 'mentions',
          select: 'name email picture'
        }, {
          path: 'likes',
          select: 'name email picture'
        }, {
          path: 'replies',
          populate: [{
            path: 'author',
            select: 'name email picture'
          }, {
            path: 'mentions',
            select: 'name email picture'
          }]
        }]
      })
      .populate('likes', 'name email picture');
      
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    throw new ApiError(500, 'Error fetching posts');
  }
};

// Get single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email picture')
      .populate({
        path: 'comments',
        populate: [{
          path: 'author',
          select: 'name email picture'
        }, {
          path: 'replies.author',
          select: 'name email picture'
        }]
      });
      
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    
    res.json(post);
  } catch (error) {
    if (error.name === 'CastError') {
      throw new ApiError(400, 'Invalid post ID');
    }
    throw error;
  }
};

// Create new post
export const createPost = async (req, res) => {
  try {
    const { title, content, category, images } = req.body;
    
    // Extract and validate mentions
    const mentions = await extractMentions(content);
    
    const post = new Post({
      title,
      content,
      category,
      images: images || [],
      mentions,
      author: req.user._id
    });
    
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email picture')
      .populate('mentions', 'name email picture');
      
    res.status(201).json(populatedPost);
  } catch (error) {
    throw new ApiError(500, 'Error creating post');
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    
    if (post.author.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to update this post');
    }
    
    const { title, content, category, image } = req.body;
    
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.image = image || post.image;
    
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email picture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name email picture'
        }
      });
      
    res.json(updatedPost);
  } catch (error) {
    if (error.name === 'CastError') {
      throw new ApiError(400, 'Invalid post ID');
    }
    throw error;
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    
    if (post.author.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to delete this post');
    }
    
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      throw new ApiError(400, 'Invalid post ID');
    }
    throw error;
  }
};

// Add comment to post
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    
    const { content } = req.body;
    const mentions = await extractMentions(content);
    
    post.comments.push({
      content,
      author: req.user._id,
      mentions
    });
    
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email picture')
      .populate('mentions', 'name email picture')
      .populate({
        path: 'comments',
        populate: [{
          path: 'author',
          select: 'name email picture'
        }, {
          path: 'mentions',
          select: 'name email picture'
        }, {
          path: 'likes',
          select: 'name email picture'
        }]
      });
      
    res.status(201).json(updatedPost);
  } catch (error) {
    if (error.name === 'CastError') {
      throw new ApiError(400, 'Invalid post ID');
    }
    throw error;
  }
};

// Add reply to comment
export const addReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    
    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }
    
    const { content } = req.body;
    const mentions = await extractMentions(content);
    
    comment.replies.push({
      content,
      author: req.user._id,
      mentions
    });
    
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email picture')
      .populate('mentions', 'name email picture')
      .populate({
        path: 'comments',
        populate: [{
          path: 'author',
          select: 'name email picture'
        }, {
          path: 'mentions',
          select: 'name email picture'
        }, {
          path: 'likes',
          select: 'name email picture'
        }, {
          path: 'replies',
          populate: [{
            path: 'author',
            select: 'name email picture'
          }, {
            path: 'mentions',
            select: 'name email picture'
          }]
        }]
      });
      
    res.status(201).json(updatedPost);
  } catch (error) {
    if (error.name === 'CastError') {
      throw new ApiError(400, 'Invalid post or comment ID');
    }
    throw error;
  }
};

// Toggle like on post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    
    const userLikeIndex = post.likes.indexOf(req.user._id);
    
    if (userLikeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(userLikeIndex, 1);
    }
    
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email picture')
      .populate('mentions', 'name email picture')
      .populate({
        path: 'comments',
        populate: [{
          path: 'author',
          select: 'name email picture'
        }, {
          path: 'mentions',
          select: 'name email picture'
        }, {
          path: 'likes',
          select: 'name email picture'
        }]
      })
      .populate('likes', 'name email picture');
      
    res.json(updatedPost);
  } catch (error) {
    if (error.name === 'CastError') {
      throw new ApiError(400, 'Invalid post ID');
    }
    throw error;
  }
}; 
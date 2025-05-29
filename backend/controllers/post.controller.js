import Post from '../models/Post.js';
import { ApiError } from '../utils/ApiError.js';

// Create a new post
export async function createPost(req, res) {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Get all posts
export async function getAllPosts(req, res) {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name email picture')
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'name email picture' },
          {
            path: 'replies',
            populate: { path: 'author', select: 'name email picture' }
          }
        ]
      });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get a single post
export async function getPostById(req, res) {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email picture')
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'name email picture' },
          {
            path: 'replies',
            populate: { path: 'author', select: 'name email picture' }
          }
        ]
      });
    
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    
    res.json(post);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

// Add a comment to a post
export async function addComment(req, res) {
  try {
    const { content, author } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    post.comments.push({ content, author });
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate('author', 'name email picture')
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'name email picture' },
          {
            path: 'replies',
            populate: { path: 'author', select: 'name email picture' }
          }
        ]
      });

    res.json(updatedPost);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

// Add a reply to a comment
export async function addReply(req, res) {
  try {
    const { content, author } = req.body;
    const { id, commentId } = req.params;
    
    const post = await Post.findById(id);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    comment.replies.push({ content, author });
    await post.save();

    const updatedPost = await Post.findById(id)
      .populate('author', 'name email picture')
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'name email picture' },
          {
            path: 'replies',
            populate: { path: 'author', select: 'name email picture' }
          }
        ]
      });

    res.json(updatedPost);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

// Toggle like on a post
export async function toggleLike(req, res) {
  try {
    const { id } = req.params;
    const { user } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    const userLikeIndex = post.likes.findIndex(like => 
      like.email === user.email
    );

    if (userLikeIndex === -1) {
      post.likes.push(user);
    } else {
      post.likes.splice(userLikeIndex, 1);
    }

    await post.save();

    const updatedPost = await Post.findById(id)
      .populate('author', 'name email picture')
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'name email picture' },
          {
            path: 'replies',
            populate: { path: 'author', select: 'name email picture' }
          }
        ]
      });

    res.json(updatedPost);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
} 
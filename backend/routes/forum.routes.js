import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get single post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Create post
router.post('/posts', async (req, res) => {
  try {
    const { title, content, category, author, image } = req.body;

    // First, find or create the user
    let user = await User.findOne({ email: author.email });
    if (!user) {
      user = await User.create({
        name: author.name,
        email: author.email,
        picture: author.picture
      });
    }

    const post = new Post({
      title,
      content,
      category,
      author: user._id, // Use the user's ObjectId
      image,
      comments: []
    });

    await post.save();
    
    // Populate the author details before sending response
    const populatedPost = await Post.findById(post._id).populate('author', 'name email picture');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update post
router.put('/posts/:id', async (req, res) => {
  try {
    const { title, content, category, image } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only allow author to update
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.title = title;
    post.content = content;
    post.category = category;
    if (image) post.image = image;

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Add a comment to a post
router.post('/posts/:id/comment', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { content, author } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    if (!author || !author.email) {
      return res.status(400).json({ message: 'Author information is required' });
    }

    // Create a new comment object with provided author data
    const newComment = {
      content,
      author: {
        name: author.name || 'Anonymous',
        email: author.email,
        picture: author.picture || '',
      },
      createdAt: new Date(),
      replies: []
    };
    
    post.comments.push(newComment);
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email picture')
      .populate('comments.author', 'name email picture')
      .populate('comments.replies.author', 'name email picture');
    
    res.status(200).json(populatedPost);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// Add a reply to a comment
router.post('/posts/:postId/comments/:commentId/reply', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { content, author } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    if (!author || !author.email) {
      return res.status(400).json({ message: 'Author information is required' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Create a new reply with provided author data
    const newReply = {
      content,
      author: {
        name: author.name || 'Anonymous',
        email: author.email,
        picture: author.picture || '',
      },
      createdAt: new Date()
    };
    
    comment.replies.push(newReply);
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email picture')
      .populate('comments.author', 'name email picture')
      .populate('comments.replies.author', 'name email picture');
    
    res.status(200).json(populatedPost);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Error adding reply', error: error.message });
  }
});

// Like a post
router.post('/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { user } = req.body;
    
    if (!user || !user.email) {
      return res.status(400).json({ message: 'User information is required' });
    }

    // Check if this user already liked the post
    const existingLike = post.likes.find(like => 
      (like.email && like.email === user.email) || 
      (like.author && like.author.email === user.email)
    );

    if (existingLike) {
      // User already liked the post, so remove the like
      post.likes = post.likes.filter(like => 
        (like.email && like.email !== user.email) && 
        (like.author && like.author.email !== user.email)
      );
    } else {
      // Add new like with user data
      post.likes.push({
        name: user.name || 'Anonymous',
        email: user.email,
        picture: user.picture || ''
      });
    }

    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email picture')
      .populate('comments.author', 'name email picture')
      .populate('comments.replies.author', 'name email picture');
    
    res.status(200).json(populatedPost);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
});

export default router; 
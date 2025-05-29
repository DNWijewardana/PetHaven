import express from 'express';
import * as postController from '../controllers/post.controller.js';

const router = express.Router();

// Get all posts
router.get('/', postController.getAllPosts);

// Get a single post
router.get('/:id', postController.getPostById);

// Create a new post
router.post('/', postController.createPost);

// Add a comment to a post
router.post('/:id/comments', postController.addComment);

// Add a reply to a comment
router.post('/:id/comments/:commentId/replies', postController.addReply);

// Toggle like on a post
router.post('/:id/like', postController.toggleLike);

export default router; 
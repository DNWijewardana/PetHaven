import express from 'express';
import { handleChatMessage } from '../controllers/chatbot.controller.js';

const router = express.Router();

/**
 * @route   POST /api/v1/chatbot
 * @desc    Process chatbot messages
 * @access  Public
 */
router.post('/', handleChatMessage);

export default router; 
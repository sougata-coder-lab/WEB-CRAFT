import express from 'express';
import { generateCode } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, generateCode);

export default router;

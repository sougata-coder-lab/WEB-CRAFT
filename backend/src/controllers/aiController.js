import { generateWebsiteCode } from '../utils/aiGenerator.js';

// @desc    Generate website code from prompt
// @route   POST /api/ai/generate
// @access  Private
export const generateCode = async (req, res, next) => {
  try {
    const { prompt, existingCode } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({ success: false, message: 'Prompt is too long (max 2000 characters)' });
    }

    const code = await generateWebsiteCode(prompt.trim(), existingCode || null);

    res.json({
      success: true,
      code,
    });
  } catch (error) {
    next(error);
  }
};

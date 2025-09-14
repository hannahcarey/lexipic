import { Router } from 'express';
import multer from 'multer';
import { analyzeImage, uploadImage, generateFlashcardFromImage, evaluateAnswers } from '../controllers/imageController';
import { optionalAuth, validateImageUpload } from '../middleware';

const router = Router();

// Configure multer for image uploads
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

// @route   POST /api/image/analyze
// @desc    Analyze image from base64 JSON (for mobile app)
// @access  Public (but better experience for authenticated users)
router.post('/analyze', optionalAuth, analyzeImage);

// @route   POST /api/image/analyze-upload  
// @desc    Analyze uploaded image file (for web/multipart uploads)
// @access  Public (but better experience for authenticated users)
router.post('/analyze-upload', optionalAuth, imageUpload.single('image'), validateImageUpload, analyzeImage);

// @route   POST /api/image/upload
// @desc    Upload image and get URL
// @access  Public
router.post('/upload', imageUpload.single('image'), validateImageUpload, uploadImage);

// @route   POST /api/image/generate-flashcard
// @desc    Generate flashcard from image URL (for AI-powered flashcard generation)
// @access  Public
router.post('/generate-flashcard', generateFlashcardFromImage);

// @route   POST /api/image/evaluate
// @desc    Evaluate student answers and provide detailed feedback
// @access  Public (but better experience for authenticated users)
router.post('/evaluate', optionalAuth, evaluateAnswers);

export default router;

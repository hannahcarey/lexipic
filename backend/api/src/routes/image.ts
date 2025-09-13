import { Router } from 'express';
import multer from 'multer';
import { analyzeImage, uploadImage, generateFlashcardFromImage } from '../controllers/imageController';
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
// @desc    Analyze image and return language learning flashcard
// @access  Public (but better experience for authenticated users)
router.post('/analyze', optionalAuth, imageUpload.single('image'), validateImageUpload, analyzeImage);

// @route   POST /api/image/upload
// @desc    Upload image and get URL
// @access  Public
router.post('/upload', imageUpload.single('image'), validateImageUpload, uploadImage);

// @route   POST /api/image/generate-flashcard
// @desc    Generate flashcard from image URL (for AI-powered flashcard generation)
// @access  Public
router.post('/generate-flashcard', generateFlashcardFromImage);

export default router;

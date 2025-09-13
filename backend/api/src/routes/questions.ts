import { Router } from 'express';
import { 
  getRandomFlashcard, 
  submitAnswer, 
  getAllFlashcards, 
  createFlashcard,
  getUserFlashcardHistory
} from '../controllers/flashcardController';
import { 
  authenticate, 
  optionalAuth,
  handleValidationErrors 
} from '../middleware';
import { body } from 'express-validator';

const router = Router();

// Validation for answer submission
const validateSubmitAnswer = [
  body('flashcard_id')
    .isUUID()
    .withMessage('Invalid flashcard ID'),
  body('user_answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required'),
  body('time_spent')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Time spent must be between 1 and 300 seconds')
];

// Validation for flashcard creation
const validateCreateFlashcard = [
  body('object_name')
    .trim()
    .notEmpty()
    .withMessage('Object name is required'),
  body('translation')
    .trim()
    .notEmpty()
    .withMessage('Translation is required'),
  body('image_url')
    .isURL()
    .withMessage('Valid image URL is required')
];

// @route   GET /api/flashcards/random
// @desc    Get a random flashcard for practice
// @access  Public (but different results for authenticated users)
router.get('/random', optionalAuth, getRandomFlashcard);

// @route   POST /api/flashcards/submit
// @desc    Submit an answer to a flashcard
// @access  Private
router.post('/submit', authenticate, validateSubmitAnswer, handleValidationErrors, submitAnswer);

// @route   GET /api/flashcards
// @desc    Get all flashcards (paginated)
// @access  Public
router.get('/', getAllFlashcards);

// @route   POST /api/flashcards
// @desc    Create a new flashcard
// @access  Private
router.post('/', authenticate, validateCreateFlashcard, handleValidationErrors, createFlashcard);

// @route   GET /api/flashcards/history
// @desc    Get user's flashcard practice history
// @access  Private
router.get('/history', authenticate, getUserFlashcardHistory);

export default router;

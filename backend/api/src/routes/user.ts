import { Router } from 'express';
import multer from 'multer';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserStats, 
  updateUserAvatar, 
  deleteUser,
  getLeaderboard
} from '../controllers/userController';
import { 
  authenticate, 
  validateUpdateProfile, 
  handleValidationErrors,
  validateImageUpload
} from '../middleware';

const router = Router();

// Configure multer for avatar uploads
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, getUserProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, validateUpdateProfile, handleValidationErrors, updateUserProfile);

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticate, getUserStats);

// @route   POST /api/user/avatar
// @desc    Update user avatar
// @access  Private
router.post('/avatar', authenticate, avatarUpload.single('avatar'), validateImageUpload, updateUserAvatar);

// @route   DELETE /api/user/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', authenticate, deleteUser);

// @route   GET /api/user/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', getLeaderboard);

export default router;

import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { ApiResponse } from '../types';

// Validation result handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array()
    };
    
    res.status(400).json(response);
    return;
  }
  
  next();
};

// Auth validations
export const validateRegister: ValidationChain[] = [
  body('display_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// User profile validations
export const validateUpdateProfile: ValidationChain[] = [
  body('display_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
    
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('preferredLanguages')
    .optional()
    .isArray()
    .withMessage('Preferred languages must be an array')
    .custom((languages: string[]) => {
      const validLanguages = ['Spanish', 'French', 'German', 'Italian', 'Portuguese', 'English'];
      return languages.every(lang => validLanguages.includes(lang));
    })
    .withMessage('Invalid language in preferred languages')
];

// Question submission validations
export const validateSubmitAnswer: ValidationChain[] = [
  body('questionId')
    .isMongoId()
    .withMessage('Invalid question ID'),
    
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required'),
    
  body('timeSpent')
    .isInt({ min: 1, max: 300 })
    .withMessage('Time spent must be between 1 and 300 seconds'),
    
  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('Invalid session ID format')
];

// Image upload validation
export const validateImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: 'No image file provided'
    });
    return;
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    res.status(400).json({
      success: false,
      error: 'Invalid file type. Only JPEG and PNG images are allowed.'
    });
    return;
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 10MB.'
    });
    return;
  }

  next();
};

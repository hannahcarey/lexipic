export { authenticate, optionalAuth } from './auth';
export { 
  handleValidationErrors, 
  validateRegister, 
  validateLogin, 
  validateUpdateProfile, 
  validateSubmitAnswer,
  validateImageUpload 
} from './validation';
export { globalErrorHandler, notFound, asyncHandler, AppError } from './errorHandler';

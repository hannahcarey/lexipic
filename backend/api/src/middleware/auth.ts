import { Response, NextFunction } from 'express';
import { AuthRequest, IUser } from '../types';
import { verifyToken } from '../utils/jwt';
import { DatabaseService } from '../utils/supabase';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token format.'
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user
    const user = await DatabaseService.getUserById(decoded.userId);
    if (!user || user.is_active === false) {
      res.status(401).json({
        success: false,
        error: 'Access denied. User not found or inactive.'
      });
      return;
    }

    // Update last login date
    await DatabaseService.updateUser(user.id, {
      last_login: new Date().toISOString()
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Access denied. Invalid token.'
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const decoded = verifyToken(token);
        const user = await DatabaseService.getUserById(decoded.userId);
        
        if (user && user.is_active !== false) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Don't fail the request for optional auth
    next();
  }
};

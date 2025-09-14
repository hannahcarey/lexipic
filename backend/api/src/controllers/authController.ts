import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { DatabaseService } from '../utils/supabase';
import { generateToken, generateUserResponse } from '../utils/jwt';
import { LoginRequest, RegisterRequest, ApiResponse, AuthResponse } from '../types';
import { asyncHandler } from '../middleware';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { display_name, email, password }: RegisterRequest = req.body;

  // Check if user already exists
  const existingUser = await DatabaseService.getUserByEmail(email);
  if (existingUser) {
    res.status(409).json({
      success: false,
      error: 'User with this email already exists'
    });
    return;
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create new user
  const user = await DatabaseService.createUser(email, passwordHash, display_name);

  // Generate token
  const token = generateToken(user.id);

  const response: ApiResponse<AuthResponse> = {
    success: true,
    message: 'User registered successfully',
    data: generateUserResponse(user, token)
  };

  res.status(201).json(response);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;

  // Find user
  const user = await DatabaseService.getUserByEmail(email);
  if (!user || !user.password_hash) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
    return;
  }

  // Check if user is active
  if (user.is_active === false) {
    res.status(401).json({
      success: false,
      error: 'Account has been deactivated'
    });
    return;
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
    return;
  }

  // Update last login date
  await DatabaseService.updateUser(user.id, {
    last_login: new Date().toISOString()
  });

  // Generate token
  const token = generateToken(user.id);

  const response: ApiResponse<AuthResponse> = {
    success: true,
    message: 'Login successful',
    data: generateUserResponse(user, token)
  };

  res.status(200).json(response);
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log this event or add token to a blacklist if needed

  const response: ApiResponse = {
    success: true,
    message: 'Logout successful'
  };

  res.status(200).json(response);
});

export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // This assumes the authenticate middleware has already run
  const user = (req as any).user;

  const response: ApiResponse = {
    success: true,
    data: {
      id: user.id,
      display_name: user.display_name,
      email: user.email,
      avatar: user.avatar,
      created_at: user.created_at,
      preferred_languages: user.preferred_languages,
      last_login: user.last_login,
      is_active: user.is_active
    }
  };

  res.status(200).json(response);
});

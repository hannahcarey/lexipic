import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../types';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & { userId: string };
    return { userId: decoded.userId };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateUserResponse = (user: IUser, token: string) => {
  return {
    token,
    user: {
      id: user.id,
      display_name: user.display_name,
      email: user.email,
      avatar: user.avatar,
      created_at: user.created_at,
      preferred_languages: user.preferred_languages,
      last_login: user.last_login
    }
  };
};

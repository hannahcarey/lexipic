import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import flashcardRoutes from './questions'; // Still using questions.ts file but with flashcard routes
import imageRoutes from './image';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Lexipic API is running with Supabase!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'Supabase PostgreSQL'
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/image', imageRoutes);

export default router;

import { Response } from 'express';
import { DatabaseService, supabase } from '../utils/supabase';
import { AuthRequest, ApiResponse, IFlashcard, PracticeResponse, AnswerSubmission } from '../types';
import { asyncHandler } from '../middleware';
import { randomUUID } from 'crypto';

export const getRandomFlashcard = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user;
  const language = req.query.language as string;

  // If user is logged in, try to get flashcards they haven't seen recently
  let excludeIds: string[] = [];
  if (user) {
    // Get recently seen flashcards (last 10)
    const recentActivity = await DatabaseService.getRecentUserActivity(user.id, 10);
    excludeIds = recentActivity.map(activity => activity.flashcard_id);
  }

  // Get random flashcard with language filter
  let flashcard = await DatabaseService.getRandomFlashcard(excludeIds, language);

  // If no new flashcards, allow repeated ones
  if (!flashcard) {
    flashcard = await DatabaseService.getRandomFlashcard([], language);
  }

  if (!flashcard) {
    res.status(404).json({
      success: false,
      error: 'No flashcards available'
    });
    return;
  }

  // Generate options for multiple choice from same language
  const allFlashcards = await DatabaseService.getAllFlashcards(20, 0, language);
  const otherOptions = allFlashcards
    .filter(f => f.id !== flashcard.id)
    .map(f => f.translation)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const options = [flashcard.translation, ...otherOptions].sort(() => 0.5 - Math.random());

  const response: ApiResponse<PracticeResponse> = {
    success: true,
    data: {
      flashcard,
      options
    }
  };

  res.status(200).json(response);
});

export const submitAnswer = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const { flashcard_id, user_answer, time_spent }: AnswerSubmission & { time_spent?: number } = req.body;

  // Get the flashcard to check correct answer
  const { data: flashcards, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', flashcard_id)
    .single();

  if (error || !flashcards) {
    res.status(404).json({
      success: false,
      error: 'Flashcard not found'
    });
    return;
  }

  const flashcard = flashcards as IFlashcard;

  // Check if answer is correct
  const isCorrect = user_answer.toLowerCase().trim() === flashcard.translation.toLowerCase().trim();

  // Update user stats
  const updatedStats = await DatabaseService.updateFlashcardStats(user.id, flashcard_id, isCorrect);

  // Get updated user stats
  const userStats = await DatabaseService.getUserStats(user.id);

  const response: ApiResponse = {
    success: true,
    message: isCorrect ? 'Correct answer!' : 'Incorrect answer',
    data: {
      is_correct: isCorrect,
      correct_answer: flashcard.translation,
      user_stats: userStats,
      flashcard_stats: updatedStats
    }
  };

  res.status(200).json(response);
});

export const getAllFlashcards = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const language = req.query.language as string;
  const offset = (page - 1) * limit;

  const flashcards = await DatabaseService.getAllFlashcards(limit, offset, language);

  // Get total count with language filter
  let countQuery = supabase
    .from('flashcards')
    .select('*', { count: 'exact', head: true });

  if (language) {
    countQuery = countQuery.eq('language', language);
  }

  const { count, error } = await countQuery;

  if (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get flashcards count'
    });
    return;
  }

  const total = count || 0;

  const response: ApiResponse = {
    success: true,
    data: {
      flashcards,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  };

  res.status(200).json(response);
});

export const createFlashcard = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const { object_name, translation, image_url, language } = req.body;

  if (!object_name || !translation || !image_url || !language) {
    res.status(400).json({
      success: false,
      error: 'object_name, translation, image_url, and language are required'
    });
    return;
  }

  const flashcard = await DatabaseService.createFlashcard(
    object_name,
    translation,
    image_url,
    language,
    user.id
  );

  const response: ApiResponse<IFlashcard> = {
    success: true,
    message: 'Flashcard created successfully',
    data: flashcard
  };

  res.status(201).json(response);
});

export const getUserFlashcardHistory = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const limit = parseInt(req.query.limit as string) || 20;

  const history = await DatabaseService.getRecentUserActivity(user.id, limit);

  const response: ApiResponse = {
    success: true,
    data: {
      history,
      total_seen: history.length
    }
  };

  res.status(200).json(response);
});

export const getAvailableLanguages = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('language')
    .order('language');

  if (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get available languages'
    });
    return;
  }

  // Get unique languages and their counts
  const languageCounts: { [key: string]: number } = {};
  data.forEach(item => {
    languageCounts[item.language] = (languageCounts[item.language] || 0) + 1;
  });

  const languages = Object.entries(languageCounts).map(([language, count]) => ({
    language,
    count,
    available: count > 0
  }));

  const response: ApiResponse = {
    success: true,
    data: {
      languages,
      total_languages: languages.length
    }
  };

  res.status(200).json(response);
});

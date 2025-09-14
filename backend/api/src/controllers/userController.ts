import { Response } from 'express';
import { DatabaseService, supabase } from '../utils/supabase';
import { AuthRequest, ApiResponse, UserStatsResponse } from '../types';
import { asyncHandler } from '../middleware';

export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;

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

export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const { display_name, email, preferred_languages } = req.body;

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Email is already taken'
      });
      return;
    }
  }

  // Prepare updates
  const updates: any = {};
  if (display_name !== undefined) updates.display_name = display_name;
  if (email !== undefined) updates.email = email;
  if (preferred_languages !== undefined) updates.preferred_languages = preferred_languages;

  // Update user
  const updatedUser = await DatabaseService.updateUser(user.id, updates);

  const response: ApiResponse = {
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: updatedUser.id,
      display_name: updatedUser.display_name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      created_at: updatedUser.created_at,
      preferred_languages: updatedUser.preferred_languages,
      last_login: updatedUser.last_login,
      is_active: updatedUser.is_active
    }
  };

  res.status(200).json(response);
});

export const getUserStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;

  // Get user stats from database service
  const userStats = await DatabaseService.getUserStats(user.id);

  // Get recent activity
  const recentActivity = await DatabaseService.getRecentUserActivity(user.id, 10);

  const userStatsResponse: UserStatsResponse = {
    accuracy: userStats.accuracy,
    current_streak: userStats.current_streak,
    level: userStats.level,
    xp: userStats.xp,
    total_flashcards_seen: userStats.total_flashcards_seen,
    total_correct: userStats.total_correct,
    total_score: userStats.total_score,
    recent_activity: recentActivity
  };

  const response: ApiResponse<UserStatsResponse> = {
    success: true,
    data: userStatsResponse
  };

  res.status(200).json(response);
});

export const updateUserAvatar = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: 'No image file provided'
    });
    return;
  }

  // In a real application, you would upload this to a cloud service like AWS S3
  // For now, we'll just store the filename
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  
  // Update user avatar in database
  await DatabaseService.updateUser(user.id, { avatar: avatarUrl });

  const response: ApiResponse = {
    success: true,
    message: 'Avatar updated successfully',
    data: { avatar: avatarUrl }
  };

  res.status(200).json(response);
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  
  // Instead of deleting, we deactivate the user
  await DatabaseService.updateUser(user.id, { is_active: false });

  const response: ApiResponse = {
    success: true,
    message: 'Account deactivated successfully'
  };

  res.status(200).json(response);
});

export const getLeaderboard = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;

  // Get all users with their stats
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id,
      display_name,
      avatar,
      created_at,
      user_flashcard_stats (
        times_seen,
        times_correct
      )
    `)
    .eq('is_active', true)
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
    return;
  }

  // Calculate scores and create leaderboard
  const leaderboard = users
    .map((user: any) => {
      const totalCorrect = user.user_flashcard_stats.reduce((sum: number, stat: any) => sum + stat.times_correct, 0);
      const totalSeen = user.user_flashcard_stats.reduce((sum: number, stat: any) => sum + stat.times_seen, 0);
      const accuracy = totalSeen > 0 ? (totalCorrect / totalSeen) * 100 : 0;
      const score = totalCorrect * 10; // Simple scoring system

      return {
        id: user.id,
        display_name: user.display_name || 'Anonymous',
        avatar: user.avatar,
        score: score,
        accuracy: Math.round(accuracy),
        total_correct: totalCorrect,
        total_seen: totalSeen
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((user, index) => ({
      rank: offset + index + 1,
      ...user
    }));

  const response: ApiResponse = {
    success: true,
    data: leaderboard
  };

  res.status(200).json(response);
});

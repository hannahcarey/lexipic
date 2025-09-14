import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service role client for backend operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions
export class DatabaseService {
  
  // User operations
  static async createUser(email: string, passwordHash: string, displayName?: string) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          display_name: displayName
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Flashcard operations
  static async getRandomFlashcard(excludeIds: string[] = [], language?: string) {
    let query = supabase
      .from('flashcards')
      .select('*');

    // Filter by language if specified
    if (language) {
      query = query.eq('language', language);
    }

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Return a random flashcard
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  static async createFlashcard(objectName: string, translation: string, imageUrl: string, language: string, createdBy?: string) {
    const { data, error } = await supabase
      .from('flashcards')
      .insert([
        {
          object_name: objectName,
          translation,
          image_url: imageUrl,
          language,
          created_by: createdBy
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAllFlashcards(limit: number = 50, offset: number = 0, language?: string) {
    let query = supabase
      .from('flashcards')
      .select('*');

    // Filter by language if specified
    if (language) {
      query = query.eq('language', language);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  // User flashcard stats operations
  static async getUserFlashcardStats(userId: string, flashcardId: string) {
    const { data, error } = await supabase
      .from('user_flashcard_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('flashcard_id', flashcardId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateFlashcardStats(userId: string, flashcardId: string, isCorrect: boolean) {
    // First, try to get existing stats
    let stats = await this.getUserFlashcardStats(userId, flashcardId);

    if (stats) {
      // Update existing stats
      const { data, error } = await supabase
        .from('user_flashcard_stats')
        .update({
          times_seen: stats.times_seen + 1,
          times_correct: stats.times_correct + (isCorrect ? 1 : 0),
          last_seen: new Date().toISOString()
        })
        .eq('id', stats.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new stats
      const { data, error } = await supabase
        .from('user_flashcard_stats')
        .insert([
          {
            user_id: userId,
            flashcard_id: flashcardId,
            times_seen: 1,
            times_correct: isCorrect ? 1 : 0,
            last_seen: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  static async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('user_flashcard_stats')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        total_flashcards_seen: 0,
        total_correct: 0,
        accuracy: 0,
        current_streak: 0,
        level: 1,
        xp: 0,
        total_score: 0
      };
    }

    const totalSeen = data.reduce((sum, stat) => sum + stat.times_seen, 0);
    const totalCorrect = data.reduce((sum, stat) => sum + stat.times_correct, 0);
    const accuracy = totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0;
    
    // XP calculation: 10 points per correct answer, bonus for accuracy
    const baseXP = totalCorrect * 10;
    const accuracyBonus = accuracy >= 80 ? totalCorrect * 5 : accuracy >= 60 ? totalCorrect * 2 : 0;
    const xp = baseXP + accuracyBonus;
    
    // Level calculation: Every 250 XP = 1 level (matches frontend expectation)
    const level = Math.floor(xp / 250) + 1;
    
    // Total Score: Combination of correct answers and accuracy bonus
    const totalScore = totalCorrect + Math.floor(accuracyBonus / 10);

    // Calculate day streak - consecutive days with activity
    const dayStreak = await this.calculateDayStreak(userId);

    return {
      total_flashcards_seen: totalSeen,
      total_correct: totalCorrect,
      accuracy,
      current_streak: dayStreak,
      level,
      xp,
      total_score: totalScore
    };
  }

  // Helper method to calculate consecutive days of activity
  static async calculateDayStreak(userId: string) {
    const { data, error } = await supabase
      .from('user_flashcard_stats')
      .select('last_seen')
      .eq('user_id', userId)
      .not('last_seen', 'is', null)
      .order('last_seen', { ascending: false });

    if (error || !data || data.length === 0) {
      return 0;
    }

    // Get unique dates of activity (in user's timezone - assuming UTC for simplicity)
    const activityDates = [...new Set(
      data.map(stat => {
        const date = new Date(stat.last_seen!);
        return date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      })
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (activityDates.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if user was active today or yesterday (to maintain streak)
    const mostRecentActivity = activityDates[0];
    if (mostRecentActivity !== today && mostRecentActivity !== yesterday) {
      return 0; // Streak broken if no activity today or yesterday
    }

    // Count consecutive days
    let currentDate = new Date(mostRecentActivity);
    for (let i = 0; i < activityDates.length; i++) {
      const expectedDate = new Date(currentDate.getTime() - (i * 86400000));
      const expectedDateString = expectedDate.toISOString().split('T')[0];
      
      if (activityDates[i] === expectedDateString) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  static async getRecentUserActivity(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('user_flashcard_stats')
      .select(`
        *,
        flashcards:flashcard_id (
          object_name,
          translation,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('last_seen', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

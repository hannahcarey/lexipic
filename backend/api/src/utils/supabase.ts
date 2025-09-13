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
  static async getRandomFlashcard(excludeIds: string[] = []) {
    let query = supabase
      .from('flashcards')
      .select('*');

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

  static async createFlashcard(objectName: string, translation: string, imageUrl: string, createdBy?: string) {
    const { data, error } = await supabase
      .from('flashcards')
      .insert([
        {
          object_name: objectName,
          translation,
          image_url: imageUrl,
          created_by: createdBy
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAllFlashcards(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .range(offset, offset + limit - 1);

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
        xp: 0
      };
    }

    const totalSeen = data.reduce((sum, stat) => sum + stat.times_seen, 0);
    const totalCorrect = data.reduce((sum, stat) => sum + stat.times_correct, 0);
    const accuracy = totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0;
    
    // Simple XP calculation: 10 points per correct answer
    const xp = totalCorrect * 10;
    const level = Math.floor(xp / 100) + 1; // Level up every 100 XP

    // Calculate streak (simplified - consecutive correct answers in recent activity)
    const recentStats = data
      .filter(stat => stat.last_seen)
      .sort((a, b) => new Date(b.last_seen!).getTime() - new Date(a.last_seen!).getTime())
      .slice(0, 10); // Last 10 activities

    let currentStreak = 0;
    for (const stat of recentStats) {
      if (stat.times_correct > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      total_flashcards_seen: totalSeen,
      total_correct: totalCorrect,
      accuracy,
      current_streak: currentStreak,
      level,
      xp
    };
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

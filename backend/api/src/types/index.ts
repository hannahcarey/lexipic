import { Request } from 'express';

// User Types (matching Supabase schema)
export interface IUser {
  id: string; // UUID
  email: string;
  password_hash?: string;
  display_name?: string;
  created_at: Date;
  // Additional fields for app functionality
  avatar?: string;
  preferred_languages?: string[];
  last_login?: Date;
  is_active?: boolean;
}

// Flashcard Types (matching Supabase schema)
export interface IFlashcard {
  id: string; // UUID
  object_name: string;
  translation: string;
  image_url: string;
  created_by?: string; // UUID reference to users
  created_at?: Date;
}

// User Flashcard Stats Types (matching Supabase schema)
export interface IUserFlashcardStats {
  id: string; // UUID
  user_id: string; // UUID reference to users
  flashcard_id: string; // UUID reference to flashcards
  times_seen: number;
  times_correct: number;
  last_seen?: Date;
  created_at?: Date;
}

// Extended user stats for API responses
export interface IUserStats {
  total_flashcards_seen: number;
  total_correct: number;
  accuracy: number;
  current_streak: number;
  level: number;
  xp: number;
  total_score: number;
}

// Auth Types
export interface AuthRequest extends Request {
  user?: IUser;
  file?: Express.Multer.File;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  display_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    display_name?: string;
    email: string;
    avatar?: string;
    created_at: Date;
    preferred_languages?: string[];
    last_login?: Date;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Image Analysis Types
export interface ImageAnalysisRequest {
  image?: Express.Multer.File;
  userId?: string;
}

// Updated Image Analysis Response for complete Q&A system
export interface ImageAnalysisResponse {
  image_analysis: {
    description: string;
    primary_object: string;
    detected_objects: string[];
    confidence: number;
  };
  learning_context: {
    language: string;
    level: string;
  };
  questions: QuestionSet[];
  total_questions: number;
  instructions: string;
  metadata?: {
    processed_at: string;
    user_id?: string;
    request_type: string;
  };
}

// Q&A Types
export interface QuestionSet {
  id: number;
  question: string;
  expected_answer: string;
  question_type: 'comprehension' | 'vocabulary' | 'grammar' | 'cultural';
  difficulty: number; // 1-5
  points: number; // 0-100
  feedback_template?: string;
}

export interface StudentEvaluation {
  question_id: number;
  question: string;
  expected_answer: string;
  student_answer: string;
  points_earned: number;
  max_points: number;
  percentage: number;
  feedback: string;
  areas_for_improvement: string[];
  strengths: string[];
}

export interface EvaluationSummary {
  evaluations: StudentEvaluation[];
  summary: {
    total_points: number;
    max_points: number;
    percentage: number;
    questions_answered: number;
    level: string;
    language: string;
  };
}

// Practice Types
export interface PracticeResponse {
  flashcard: IFlashcard;
  options?: string[];
}

export interface AnswerSubmission {
  flashcard_id: string;
  user_answer: string;
  is_correct: boolean;
  time_spent?: number;
}

// Statistics Types for API responses
export interface UserStatsResponse {
  accuracy: number;
  current_streak: number;
  level: number;
  xp: number;
  total_flashcards_seen: number;
  total_correct: number;
  total_score: number;
  recent_activity: IUserFlashcardStats[];
}

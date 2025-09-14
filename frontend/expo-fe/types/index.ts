export interface User {
  id: string;
  name: string;
  display_name?: string;
  email: string;
  avatar?: string;
  totalScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  joinedDate: string;
  preferredLanguages: string[];
  isGuest?: boolean;
}

export interface Question {
  id?: string;
  question: string;
  correctAnswer: string;
  options: string[];
  language?: string;
  imageUrl?: string;
}

export interface PracticeItem extends Question {
  id: string;
  imageUrl: string;
  language: string;
}

// Backend UserStats interface (what API returns)
export interface BackendUserStats {
  accuracy: number;
  current_streak: number;
  level: number;
  xp: number;
  total_flashcards_seen: number;
  total_correct: number;
  total_score: number;
  recent_activity: any[];
}

// Frontend UserStats interface (what UI expects)
export interface UserStats {
  accuracy: number;
  streak: number;
  level: number;
  xp: number;
  achievements: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface CameraPhoto {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

export interface AnalyzeImageRequest {
  image: FormData;
  userId?: string;
}

export interface AnalyzeImageResponse {
  question: Question;
  detectedObjects: string[];
  confidence: number;
}

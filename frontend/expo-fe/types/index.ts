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
  correctAnswer?: string;
  options?: string[];
  language?: string;
  imageUrl?: string;
}

// New types for the updated Q&A system
export interface QuestionSet {
  id: number;
  question: string;
  expected_answer: string;
  question_type: 'comprehension' | 'vocabulary' | 'grammar' | 'cultural';
  difficulty: number; // 1-5
  points: number; // 0-100
  feedback_template?: string;
}

export interface ImageAnalysisData {
  description: string;
  primary_object: string;
  detected_objects: string[];
  confidence: number;
}

export interface LearningContext {
  language: string;
  level: string;
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
  image_analysis: ImageAnalysisData;
  learning_context: LearningContext;
  questions: QuestionSet[];
  total_questions: number;
  instructions: string;
  metadata?: {
    processed_at: string;
    user_id?: string;
    request_type: string;
  };
}

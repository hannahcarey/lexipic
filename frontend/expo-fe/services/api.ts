import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiResponse,
  AuthResponse,
  User,
  Question,
  PracticeItem,
  UserStats,
  AnalyzeImageRequest,
  AnalyzeImageResponse,
  QuestionSet,
  EvaluationSummary,
  ImageAnalysisData,
  LearningContext,
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // TODO: Replace with your actual backend URL
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token && !token.startsWith('guest-')) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('user');
          // Redirect to auth screen would be handled by the component
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/register', {
      display_name: name,
      email,
      password,
    });
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  // User endpoints
  async getUserProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/user/profile');
    return response.data.data;
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/user/profile', data);
    return response.data.data;
  }

  async getUserStats(): Promise<UserStats> {
    const response: AxiosResponse<ApiResponse<UserStats>> = await this.api.get('/user/stats');
    return response.data.data;
  }

  // Image analysis endpoints
  async analyzeImage(
    base64Image: string, 
    language: string = 'Spanish', 
    level: string = 'A2'
  ): Promise<AnalyzeImageResponse> {
    const response: AxiosResponse<ApiResponse<AnalyzeImageResponse>> = await this.api.post(
      '/image/analyze',
      { 
        base64Image,
        language,
        level
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  }

  // Answer evaluation endpoint
  async evaluateAnswers(
    imageDescription: string,
    questions: QuestionSet[],
    studentAnswers: string[],
    language: string,
    level: string
  ): Promise<EvaluationSummary> {
    const response: AxiosResponse<ApiResponse<EvaluationSummary>> = await this.api.post(
      '/image/evaluate',
      {
        imageDescription,
        questions,
        studentAnswers,
        language,
        level
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  }

  // Practice/Question endpoints  
  async getRandomQuestion(language?: string): Promise<any> {
    const params = language ? { language } : {};
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/flashcards/random', { params });
    return response.data.data;
  }

  async getAvailableLanguages(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/flashcards/languages');
    return response.data.data;
  }

  async submitAnswer(questionId: string, answer: string, isCorrect: boolean): Promise<void> {
    await this.api.post('/flashcards/submit', {
      flashcard_id: questionId,
      user_answer: answer,
      is_correct: isCorrect,
    });
  }

  // Utility methods
  async uploadImage(imageUri: string): Promise<string> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);

    const response: AxiosResponse<ApiResponse<{ url: string }>> = await this.api.post(
      '/image/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.url;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();
export default apiService;

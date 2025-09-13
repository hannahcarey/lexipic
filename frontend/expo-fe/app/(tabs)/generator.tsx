import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { apiService } from '../../services/api';

interface PracticeItem {
  id: string;
  imageUrl: string;
  question: string;
  correctAnswer: string;
  options: string[];
  language: string;
}

export default function GeneratorScreen() {
  const [currentItem, setCurrentItem] = useState<PracticeItem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    generateNewQuestion();
  }, []);

  const mockPracticeItems: PracticeItem[] = [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=400',
      question: 'What is this in Spanish?',
      correctAnswer: 'mesa',
      options: ['mesa', 'silla', 'ventana', 'puerta'],
      language: 'Spanish'
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      question: 'What is this in French?',
      correctAnswer: 'chaise',
      options: ['chaise', 'table', 'fenêtre', 'porte'],
      language: 'French'
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      question: 'What is this in German?',
      correctAnswer: 'Fenster',
      options: ['Fenster', 'Tür', 'Stuhl', 'Tisch'],
      language: 'German'
    },
    {
      id: '4',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      question: 'What is this in Italian?',
      correctAnswer: 'porta',
      options: ['porta', 'finestra', 'tavolo', 'sedia'],
      language: 'Italian'
    },
    {
      id: '5',
      imageUrl: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400',
      question: 'What is this in Portuguese?',
      correctAnswer: 'carro',
      options: ['carro', 'casa', 'árvore', 'gato'],
      language: 'Portuguese'
    },
  ];

  const generateNewQuestion = async () => {
    setIsLoading(true);
    setUserAnswer('');
    setShowAnswer(false);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        router.replace('/auth');
        return;
      }

      // For guest users, use mock data
      if (userToken.startsWith('guest-')) {
        const randomIndex = Math.floor(Math.random() * mockPracticeItems.length);
        const randomItem = mockPracticeItems[randomIndex];
        setCurrentItem(randomItem);
        return;
      }

      // Fetch random question from API
      const randomQuestion = await apiService.getRandomQuestion();
      
      // Map API response to local interface
      const mappedItem: PracticeItem = {
        id: randomQuestion.id,
        imageUrl: randomQuestion.imageUrl,
        question: randomQuestion.question,
        correctAnswer: randomQuestion.correctAnswer,
        options: randomQuestion.options,
        language: randomQuestion.language
      };
      
      setCurrentItem(mappedItem);
    } catch (error) {
      console.error('Error fetching question:', error);
      
      // Fallback to mock data on error
      const randomIndex = Math.floor(Math.random() * mockPracticeItems.length);
      const randomItem = mockPracticeItems[randomIndex];
      setCurrentItem(randomItem);
      
      Alert.alert('Connection Issue', 'Using offline content. Check your internet connection for latest questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentItem || !userAnswer.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }

    const isCorrect = userAnswer.toLowerCase().trim() === currentItem.correctAnswer.toLowerCase();
    setTotalQuestions(prev => prev + 1);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Submit answer to backend (skip for guest users)
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken && !userToken.startsWith('guest-')) {
        await apiService.submitAnswer(currentItem.id, userAnswer, isCorrect);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Continue with UI update even if API call fails
    }
    
    if (isCorrect) {
      Alert.alert(
        'Correct! 🎉',
        `Great job! "${currentItem.correctAnswer}" is correct!`,
        [
          {
            text: 'Next Question',
            onPress: generateNewQuestion
          }
        ]
      );
    } else {
      setShowAnswer(true);
      Alert.alert(
        'Not quite right 😅',
        `The correct answer is: "${currentItem.correctAnswer}"`,
        [
          {
            text: 'Next Question',
            onPress: generateNewQuestion
          },
          {
            text: 'Study Answer',
            onPress: () => setShowAnswer(true)
          }
        ]
      );
    }
  };

  const selectOption = (option: string) => {
    setUserAnswer(option);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading new question...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Language Practice</Text>
        <Text style={styles.score}>Score: {score}/{totalQuestions}</Text>
      </View>

      {currentItem ? (
        <View style={styles.questionContainer}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: currentItem.imageUrl }} 
              style={styles.questionImage}
              placeholder="Loading..."
              transition={200}
            />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.language}>Language: {currentItem.language}</Text>
            <Text style={styles.questionText}>{currentItem.question}</Text>

            {showAnswer && (
              <View style={styles.answerContainer}>
                <Text style={styles.correctAnswer}>
                  Correct Answer: {currentItem.correctAnswer}
                </Text>
              </View>
            )}

            <TextInput
              style={styles.answerInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Type your answer here..."
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.optionsContainer}>
              <Text style={styles.optionsTitle}>Or choose from options:</Text>
              {currentItem.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    userAnswer === option && styles.optionButtonSelected,
                    showAnswer && option === currentItem.correctAnswer && styles.optionButtonCorrect,
                  ]}
                  onPress={() => selectOption(option)}
                >
                  <Text style={[
                    styles.optionText,
                    userAnswer === option && styles.optionTextSelected,
                    showAnswer && option === currentItem.correctAnswer && styles.optionTextCorrect,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
                onPress={submitAnswer}
                disabled={!userAnswer.trim()}
              >
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={generateNewQuestion}
              >
                <Text style={styles.skipButtonText}>Skip Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No questions available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateNewQuestion}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  score: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    backgroundColor: '#e9ecef',
  },
  contentContainer: {
    flex: 1,
  },
  language: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  answerContainer: {
    backgroundColor: '#d4edda',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeft: 4,
    borderLeftColor: '#28a745',
  },
  correctAnswer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
  },
  answerInput: {
    borderWidth: 2,
    borderColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666',
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginVertical: 3,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  optionButtonCorrect: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#155724',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  skipButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

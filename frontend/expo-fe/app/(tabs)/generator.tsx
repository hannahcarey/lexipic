import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
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

interface FlashcardResponse {
  flashcard: {
    id: string;
    object_name: string;
    translation: string;
    image_url: string;
    language: string;
    created_by?: string;
    created_at: string;
  };
  options: string[];
}

export default function GeneratorScreen() {
  const [currentItem, setCurrentItem] = useState<PracticeItem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Spanish']);
  const [availableLanguages, setAvailableLanguages] = useState<{language: string, count: number}[]>([]);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    loadAvailableLanguages();
    generateNewQuestion();
  }, []);

  useEffect(() => {
    // Generate new question when languages change
    if (selectedLanguages.length > 0) {
      generateNewQuestion();
    }
  }, [selectedLanguages]);


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

      // For guest users, redirect to authentication
      if (userToken.startsWith('guest-')) {
        Alert.alert('Sign In Required', 'Please sign in to access flashcards from the database.', [
          {
            text: 'Sign In',
            onPress: () => router.replace('/auth')
          }
        ]);
        return;
      }

      // Fetch random flashcard from API with language filter(s)
      // For now, pick a random language from selected languages for each question
      const randomLanguage = selectedLanguages[Math.floor(Math.random() * selectedLanguages.length)];
      const flashcardResponse: FlashcardResponse = await apiService.getRandomQuestion(randomLanguage);
      
      // Map API response (flashcard format) to local interface (practice item format)
      const mappedItem: PracticeItem = {
        id: flashcardResponse.flashcard.id,
        imageUrl: flashcardResponse.flashcard.image_url,
        question: `What is "${flashcardResponse.flashcard.object_name}" in another language?`,
        correctAnswer: flashcardResponse.flashcard.translation,
        options: flashcardResponse.options,
        language: flashcardResponse.flashcard.language
      };
      
      setCurrentItem(mappedItem);
    } catch (error) {
      console.error('Error fetching question:', error);
      
      // Show error without falling back to mock data
      Alert.alert(
        'Connection Issue', 
        'Unable to load questions from the database. Please check your internet connection and try again.',
        [
          {
            text: 'Retry',
            onPress: () => generateNewQuestion()
          }
        ]
      );
      setCurrentItem(null);
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
      setScore(prev => {
        const newScore = prev + 1;
        
        // Check for milestone (10 correct answers)
        if (newScore >= 10) {
          // Show congratulatory message and reset after user acknowledges
          setTimeout(() => {
            Alert.alert(
              '🎉 Congratulations! 🎉',
              'Amazing! You got 10 questions correct in a row!\n\nYour score will now reset and you can start a new streak.',
              [
                {
                  text: 'Keep Learning!',
                  onPress: () => {
                    setScore(0);
                    setTotalQuestions(0);
                    handleNextQuestion();
                  }
                }
              ],
              { cancelable: false }
            );
          }, 100); // Small delay to let the UI update first
          
          return newScore; // Return 10 briefly before reset
        }
        
        return newScore;
      });
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
    
    // Always show the answer after submission (both correct and incorrect)
    setShowAnswer(true);
  };

  const selectOption = (option: string) => {
    setUserAnswer(option);
  };

  const loadAvailableLanguages = async () => {
    try {
      const languagesData = await apiService.getAvailableLanguages();
      setAvailableLanguages(languagesData.languages || []);
    } catch (error) {
      console.error('Error loading available languages:', error);
      // Set default languages if API fails
      setAvailableLanguages([
        { language: 'Spanish', count: 15 },
        { language: 'Chinese', count: 15 },
        { language: 'Japanese', count: 15 }
      ]);
    }
  };

  const toggleLanguageSelection = (language: string) => {
    setSelectedLanguages(prev => {
      const newSelection = prev.includes(language) 
        ? prev.filter(lang => lang !== language)
        : [...prev, language];
      
      // Don't allow empty selection - keep at least one language
      if (newSelection.length === 0) {
        return prev;
      }
      
      return newSelection;
    });
    
    // Reset score when changing language selection
    setScore(0);
    setTotalQuestions(0);
  };

  const getLanguageDisplayText = () => {
    if (selectedLanguages.length === 1) {
      return selectedLanguages[0];
    } else if (selectedLanguages.length === 2) {
      return `${selectedLanguages[0]} + ${selectedLanguages[1]}`;
    } else if (selectedLanguages.length === 3) {
      return 'All Languages';
    } else {
      return `${selectedLanguages.length} Languages`;
    }
  };

  const getLanguageBadgeStyle = (language: string) => {
    switch (language) {
      case 'Spanish':
        return { backgroundColor: '#FF6B6B' };
      case 'Chinese':
        return { backgroundColor: '#4ECDC4' };
      case 'Japanese':
        return { backgroundColor: '#45B7D1' };
      default:
        return { backgroundColor: '#95A5A6' };
    }
  };

  const handleNextQuestion = () => {
    // Reset states and generate new question
    setShowAnswer(false);
    setUserAnswer('');
    generateNewQuestion();
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
        <TouchableOpacity 
          style={styles.languageSelector}
          onPress={() => setShowLanguageSelector(!showLanguageSelector)}
        >
          <Text style={styles.languageSelectorText}>🌍 {getLanguageDisplayText()}</Text>
          <Text style={styles.languageSelectorArrow}>▼</Text>
        </TouchableOpacity>
        <Text style={styles.score}>Score: {score}/{totalQuestions}</Text>
        <View style={styles.milestoneContainer}>
          <Text style={styles.milestoneText}>Streak Progress: {score}/10</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(score / 10) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <View style={styles.languageIndicator}>
              <Text style={styles.languageLabel}>From:</Text>
              <View style={[styles.languageBadge, getLanguageBadgeStyle(currentItem.language)]}>
                <Text style={styles.languageBadgeText}>{currentItem.language}</Text>
              </View>
            </View>
            <Text style={styles.questionText}>{currentItem.question}</Text>

            {showAnswer && (
              <View style={[
                styles.answerContainer,
                userAnswer.toLowerCase() === currentItem.correctAnswer.toLowerCase() 
                  ? styles.correctAnswerContainer 
                  : styles.incorrectAnswerContainer
              ]}>
                {userAnswer.toLowerCase() === currentItem.correctAnswer.toLowerCase() ? (
                  <View>
                    <Text style={styles.successMessage}>🎉 Correct! Well done!</Text>
                    <Text style={styles.correctAnswer}>
                      Answer: {currentItem.correctAnswer}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.incorrectMessage}>❌ Not quite right</Text>
                    <Text style={styles.correctAnswer}>
                      Correct Answer: {currentItem.correctAnswer}
                    </Text>
                    <Text style={styles.userAnswerText}>
                      Your Answer: {userAnswer}
                    </Text>
                  </View>
                )}
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
                style={[styles.submitButton, (!userAnswer.trim() || showAnswer) && styles.submitButtonDisabled]}
                onPress={submitAnswer}
                disabled={!userAnswer.trim() || showAnswer}
              >
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={showAnswer ? handleNextQuestion : generateNewQuestion}
              >
                <Text style={styles.skipButtonText}>
                  {showAnswer ? 'Next Question' : 'Skip Question'}
                </Text>
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
      </ScrollView>

      <Modal
        visible={showLanguageSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageSelector(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowLanguageSelector(false)}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={styles.languageDropdownModal}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Languages</Text>
              <TouchableOpacity 
                onPress={() => setShowLanguageSelector(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            {availableLanguages.map((lang) => {
              const isSelected = selectedLanguages.includes(lang.language);
              return (
                <TouchableOpacity
                  key={lang.language}
                  style={styles.languageOption}
                  onPress={() => toggleLanguageSelection(lang.language)}
                >
                  <View style={styles.languageOptionContent}>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[
                      styles.languageOptionText,
                      isSelected && styles.languageOptionTextSelected
                    ]}>
                      {lang.language} ({lang.count} cards)
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
    position: 'relative',
    zIndex: 1,
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
  milestoneContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginBottom: 5,
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  languageSelectorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  languageSelectorArrow: {
    color: 'white',
    fontSize: 12,
  },
  languageDropdown: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 9999,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  languageOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  languageDropdownModal: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  questionContainer: {
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
    minHeight: 400, // Ensure minimum height for content
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  languageLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  languageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  languageBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  answerContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
  },
  correctAnswerContainer: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  incorrectAnswerContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  correctAnswer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
  },
  successMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
    textAlign: 'center',
  },
  incorrectMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
    textAlign: 'center',
  },
  userAnswerText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
    fontStyle: 'italic',
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
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
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

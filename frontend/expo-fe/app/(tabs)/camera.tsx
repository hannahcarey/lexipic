
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../../services/api';
import { 
  AnalyzeImageResponse, 
  EvaluationSummary
} from '../../types';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Question flow state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeImageResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  // Evaluation state
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationSummary | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  
  // User preferences (could be loaded from storage or user profile)
  const [language] = useState('Spanish');
  const [level] = useState('A2');

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to save photos');
      }
    })();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsLoading(true);
      setIsAnalyzing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        if (photo?.uri) {
          setCapturedImage(photo.uri);
          await analyzeImageAndGenerateQuestions(photo);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      } finally {
        setIsLoading(false);
        setIsAnalyzing(false);
      }
    }
  };

  const analyzeImageAndGenerateQuestions = async (photo: any) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      // If no token, still allow analysis (guest mode)
      if (!userToken) {
        console.log('No user token, proceeding as guest');
      }

      // Check if photo has base64 data
      if (!photo.base64) {
        console.error('No base64 data in photo');
        throw new Error('Base64 data not available');
      }

      // Prepare base64 image data with proper format
      const base64Image = `data:image/jpeg;base64,${photo.base64}`;

      // Analyze image and generate questions
      const result = await apiService.analyzeImage(base64Image, language, level);
      
      console.log('Analysis result:', result);
      setAnalysisResult(result);
      
      // Reset question flow state
      setCurrentQuestionIndex(0);
      setStudentAnswers([]);
      setCurrentAnswer('');
      setShowEvaluation(false);
      setEvaluationResult(null);
      
      // Start the question flow
      setShowQuestionModal(true);
      
    } catch (error) {
      console.error('Error analyzing photo:', error);
      
      // Show fallback with mock data
      const mockResult: AnalyzeImageResponse = {
        image_analysis: {
          description: "Unable to analyze image. Using practice questions.",
          primary_object: "unknown",
          detected_objects: ["object"],
          confidence: 0.5
        },
        learning_context: {
          language: language,
          level: level
        },
        questions: [
          {
            id: 1,
            question: "¿Qué ves en esta imagen?",
            expected_answer: "Un objeto",
            question_type: "comprehension",
            difficulty: 1,
            points: 100
          },
          {
            id: 2,
            question: "¿De qué color es?",
            expected_answer: "No se puede determinar",
            question_type: "vocabulary",
            difficulty: 2,
            points: 100
          },
          {
            id: 3,
            question: "¿Dónde está ubicado?",
            expected_answer: "En la imagen",
            question_type: "comprehension",
            difficulty: 1,
            points: 100
          }
        ],
        total_questions: 3,
        instructions: `Answer these 3 questions in ${language} based on the image.`
      };
      
      setAnalysisResult(mockResult);
      setCurrentQuestionIndex(0);
      setStudentAnswers([]);
      setCurrentAnswer('');
      setShowQuestionModal(true);
      
      Alert.alert(
        'Analysis Failed', 
        'Could not analyze the image. Using practice questions instead.',
        [{ text: 'OK' }]
      );
    }
  };

  const submitCurrentAnswer = () => {
    if (!analysisResult || !currentAnswer.trim()) return;

    // Store the current answer
    const updatedAnswers = [...studentAnswers];
    updatedAnswers[currentQuestionIndex] = currentAnswer.trim();
    setStudentAnswers(updatedAnswers);

    // Move to next question or finish
    if (currentQuestionIndex < analysisResult.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    } else {
      // All questions answered, proceed to evaluation
      finishQuestionnaire(updatedAnswers);
    }
  };

  const finishQuestionnaire = async (answers: string[]) => {
    if (!analysisResult) return;

    setIsEvaluating(true);
    try {
      const evaluation = await apiService.evaluateAnswers(
        analysisResult.image_analysis.description,
        analysisResult.questions,
        answers,
        analysisResult.learning_context.language,
        analysisResult.learning_context.level
      );

      setEvaluationResult(evaluation);
      setShowQuestionModal(false);
      setShowEvaluation(true);
    } catch (error) {
      console.error('Error evaluating answers:', error);
      
      // Show basic completion message if evaluation fails
      Alert.alert(
        'Questions Complete!',
        'Thank you for answering all the questions. Your responses have been recorded.',
        [
          {
            text: 'Continue',
            onPress: resetCamera
          }
        ]
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setShowQuestionModal(false);
    setShowEvaluation(false);
    setAnalysisResult(null);
    setCurrentQuestionIndex(0);
    setStudentAnswers([]);
    setCurrentAnswer('');
    setEvaluationResult(null);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const retakePicture = () => {
    resetCamera();
  };

  const renderQuestionModal = () => {
    if (!analysisResult || !showQuestionModal) return null;

    const currentQuestion = analysisResult.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === analysisResult.questions.length - 1;

    return (
      <Modal
        visible={showQuestionModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              {/* Progress indicator */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Question {currentQuestionIndex + 1} of {analysisResult.questions.length}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${((currentQuestionIndex + 1) / analysisResult.questions.length) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Question details */}
              <View style={styles.questionHeader}>
                <Text style={styles.questionType}>{currentQuestion.question_type.toUpperCase()}</Text>
                <Text style={styles.questionPoints}>{currentQuestion.points} points</Text>
              </View>

              <Text style={styles.questionText}>{currentQuestion.question}</Text>

              {/* Answer input */}
              <TextInput
                style={styles.answerInput}
                value={currentAnswer}
                onChangeText={setCurrentAnswer}
                placeholder={`Enter your answer in ${analysisResult.learning_context.language}...`}
                autoFocus={currentQuestionIndex === 0}
                multiline
                textAlignVertical="top"
              />

              {/* Navigation buttons */}
              <View style={styles.buttonRow}>
                {currentQuestionIndex > 0 && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                      setCurrentAnswer(studentAnswers[currentQuestionIndex - 1] || '');
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Previous</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton, 
                    !currentAnswer.trim() && styles.submitButtonDisabled,
                    { flex: currentQuestionIndex === 0 ? 1 : 0.6 }
                  ]}
                  onPress={submitCurrentAnswer}
                  disabled={!currentAnswer.trim() || isEvaluating}
                >
                  {isEvaluating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {isLastQuestion ? 'Finish & Evaluate' : 'Next Question'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Skip button */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => {
                  setCurrentAnswer('');
                  submitCurrentAnswer();
                }}
              >
                <Text style={styles.skipButtonText}>Skip this question</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderEvaluationModal = () => {
    if (!evaluationResult || !showEvaluation) return null;

    const { summary, evaluations } = evaluationResult;

    return (
      <Modal
        visible={showEvaluation}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              {/* Overall Score Header */}
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreTitle}>Your Results</Text>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scorePercentage}>{summary.percentage}%</Text>
                </View>
                <Text style={styles.scoreSubtitle}>
                  {summary.total_points} / {summary.max_points} points
                </Text>
              </View>

              {/* Individual Question Results */}
              <Text style={styles.sectionTitle}>Question Breakdown</Text>
              {evaluations.map((evaluation, index) => (
                <View key={evaluation.question_id} style={styles.evaluationCard}>
                  <View style={styles.evaluationHeader}>
                    <Text style={styles.evaluationQuestionNumber}>Q{index + 1}</Text>
                    <Text style={styles.evaluationScore}>
                      {evaluation.points_earned}/{evaluation.max_points}
                    </Text>
                  </View>
                  
                  <Text style={styles.evaluationQuestion}>{evaluation.question}</Text>
                  
                  <View style={styles.answerComparison}>
                    <Text style={styles.answerLabel}>Your answer:</Text>
                    <Text style={styles.studentAnswer}>{evaluation.student_answer}</Text>
                    
                    <Text style={styles.answerLabel}>Expected:</Text>
                    <Text style={styles.expectedAnswer}>{evaluation.expected_answer}</Text>
                  </View>

                  <Text style={styles.feedbackText}>{evaluation.feedback}</Text>

                  {evaluation.strengths.length > 0 && (
                    <View style={styles.strengthsContainer}>
                      <Text style={styles.strengthsTitle}>✅ Strengths:</Text>
                      {evaluation.strengths.map((strength, idx) => (
                        <Text key={idx} style={styles.strengthText}>• {strength}</Text>
                      ))}
                    </View>
                  )}

                  {evaluation.areas_for_improvement.length > 0 && (
                    <View style={styles.improvementContainer}>
                      <Text style={styles.improvementTitle}>📈 Areas to improve:</Text>
                      {evaluation.areas_for_improvement.map((area, idx) => (
                        <Text key={idx} style={styles.improvementText}>• {area}</Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {/* Action buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryButton} onPress={resetCamera}>
                  <Text style={styles.primaryButtonText}>Try Another Image</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.button} onPress={retakePicture}>
              <Text style={styles.buttonText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
          
          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.analyzingText}>Analyzing image...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.buttonText}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.captureButton, isLoading && styles.captureButtonDisabled]} 
              onPress={takePicture}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.captureButtonText}>📸</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {renderQuestionModal()}
      {renderEvaluationModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    left: 64,
    right: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 25,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: 'gray',
  },
  captureButtonText: {
    fontSize: 30,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },
  previewButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    maxHeight: '90%',
    width: '100%',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  questionType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  questionPoints: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    lineHeight: 24,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 100,
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 120,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 100,
    marginRight: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 15,
    padding: 10,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  // Evaluation Modal Styles
  scoreHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scorePercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  evaluationCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  evaluationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  evaluationQuestionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  evaluationScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  evaluationQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  answerComparison: {
    marginBottom: 15,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  studentAnswer: {
    fontSize: 15,
    color: '#333',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ffa500',
  },
  expectedAnswer: {
    fontSize: 15,
    color: '#333',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  feedbackText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  strengthsContainer: {
    marginBottom: 10,
  },
  strengthsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  strengthText: {
    fontSize: 14,
    color: '#28a745',
    marginLeft: 10,
  },
  improvementContainer: {
    marginBottom: 10,
  },
  improvementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 5,
  },
  improvementText: {
    fontSize: 14,
    color: '#ff6b35',
    marginLeft: 10,
  },
});

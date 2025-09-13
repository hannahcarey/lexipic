
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
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { apiService } from '../../services/api';

interface Question {
  question: string;
  correctAnswer: string;
  options: string[];
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

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
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        if (photo?.uri) {
          setCapturedImage(photo.uri);
          await sendPhotoToBackend(photo);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendPhotoToBackend = async (photo: any) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        router.replace('/auth');
        return;
      }

      // For guest users, show mock question
      if (userToken.startsWith('guest-')) {
        const mockQuestion: Question = {
          question: "What is this object in Spanish?",
          correctAnswer: "mesa",
          options: ["mesa", "silla", "ventana", "puerta"]
        };
        setCurrentQuestion(mockQuestion);
        setShowQuestionModal(true);
        return;
      }
      
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      // Use API service to analyze image
      const analysisResult = await apiService.analyzeImage(formData);
      
      // Map API response to local interface
      const question: Question = {
        question: analysisResult.question.question,
        correctAnswer: analysisResult.question.correctAnswer,
        options: analysisResult.question.options
      };

      setCurrentQuestion(question);
      setShowQuestionModal(true);
    } catch (error) {
      console.error('Error analyzing photo:', error);
      
      // Show mock question as fallback
      const mockQuestion: Question = {
        question: "What is this object in Spanish?",
        correctAnswer: "mesa",
        options: ["mesa", "silla", "ventana", "puerta"]
      };
      setCurrentQuestion(mockQuestion);
      setShowQuestionModal(true);
      
      Alert.alert(
        'Analysis Failed', 
        'Could not analyze the image. Using a practice question instead.',
        [{ text: 'OK' }]
      );
    }
  };

  const submitAnswer = () => {
    if (!currentQuestion) return;

    const isCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    Alert.alert(
      isCorrect ? 'Correct!' : 'Incorrect',
      isCorrect 
        ? 'Great job! You got it right!' 
        : `The correct answer is: ${currentQuestion.correctAnswer}`,
      [
        {
          text: 'Continue',
          onPress: () => {
            setShowQuestionModal(false);
            setUserAnswer('');
            setCapturedImage(null);
            setCurrentQuestion(null);
          }
        }
      ]
    );
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setShowQuestionModal(false);
    setCurrentQuestion(null);
    setUserAnswer('');
  };

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.button} onPress={retakePicture}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
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
        </CameraView>
      )}

      <Modal
        visible={showQuestionModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {currentQuestion && (
              <>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>
                <TextInput
                  style={styles.answerInput}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Enter your answer..."
                  autoFocus
                />
                <View style={styles.optionsContainer}>
                  <Text style={styles.optionsTitle}>Options:</Text>
                  {currentQuestion.options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionButton}
                      onPress={() => setUserAnswer(option)}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.submitButton, !userAnswer && styles.submitButtonDisabled]}
                  onPress={submitAnswer}
                  disabled={!userAnswer}
                >
                  <Text style={styles.submitButtonText}>Submit Answer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  submitButton: {
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
});

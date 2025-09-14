import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { apiService } from '../services/api';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin) {
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    console.log(`${isLogin ? 'Login' : 'Register'} button pressed`); // Debug log
    console.log('Form data:', { email, display_name: name || 'N/A', passwordLength: password.length });
    
    if (!validateForm()) {
      console.log('Form validation failed'); // Debug log
      return;
    }

    console.log('Form validation passed, starting auth...'); // Debug log
    setIsLoading(true);

    try {
      let authResponse;
      
      if (isLogin) {
        console.log('🔐 Attempting login with:', email); // Debug log
        console.log('🔐 Password length:', password.length); // Debug log
        authResponse = await apiService.login(email, password);
        console.log('✅ Login successful!'); // Debug log
      } else {
        console.log('📝 Attempting registration with:', { name, email }); // Debug log
        authResponse = await apiService.register(name, email, password);
        console.log('✅ Registration successful!'); // Debug log
      }

      console.log('Auth API successful:', authResponse ? 'response received' : 'no response'); // Debug log

      // Store the token and user data
      await AsyncStorage.setItem('userToken', authResponse.token);
      await AsyncStorage.setItem('user', JSON.stringify(authResponse.user));
      console.log('Tokens stored in AsyncStorage'); // Debug log

      // Navigate to main app
      router.replace('/(tabs)/camera');
      console.log('Navigation initiated to camera tab'); // Debug log

      // Show success message
      setTimeout(() => {
        Alert.alert(
          'Success!', 
          isLogin ? 'Welcome back!' : 'Account created successfully!',
          [{ text: 'OK' }]
        );
      }, 100);

    } catch (error: any) {
      console.error('Authentication error:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      
      // Handle specific error cases based on HTTP status codes
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.error || 'Invalid email or password';
        if (isLogin) {
          Alert.alert('Login Failed', `${errorMessage}\n\n💡 Tip: Make sure you've created an account first!`);
        } else {
          Alert.alert('Authentication Failed', errorMessage);
        }
      } else if (error.response?.status === 409) {
        Alert.alert('Registration Failed', 'An account with this email already exists. Please try logging in instead.');
      } else if (error.response?.status === 400) {
        // Handle validation errors with detailed messages
        if (error.response?.data?.error === 'Validation failed' && error.response?.data?.data) {
          const validationErrors = error.response.data.data;
          const errorMessages = validationErrors.map((err: any) => `• ${err.msg}`).join('\n');
          Alert.alert('Please Fix These Issues:', errorMessages);
        } else {
          Alert.alert('Invalid Data', error.response?.data?.error || 'Please check your input and try again.');
        }
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        Alert.alert('Connection Error', 'Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        Alert.alert(
          'Error', 
          error.response?.data?.error || (isLogin ? 'Login failed. Please try again.' : 'Registration failed. Please try again.')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  const handleGuestMode = async () => {
    try {
      // Create a guest token
      const guestToken = 'guest-token-' + Date.now();
      const guestUser = {
        id: 'guest',
        name: 'Guest User',
        email: 'guest@example.com',
        isGuest: true,
      };

      await AsyncStorage.setItem('userToken', guestToken);
      await AsyncStorage.setItem('user', JSON.stringify(guestUser));

      router.replace('/(tabs)/camera');
    } catch (error) {
      console.error('Guest mode error:', error);
      Alert.alert('Error', 'Failed to enter guest mode');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&h=150&fit=crop&crop=center' }}
            style={styles.logo}
            placeholder="🌍"
          />
          <Text style={styles.appName}>Lexipic</Text>
          <Text style={styles.tagline}>Learn languages through objects</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </Text>

          {!isLogin && (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              autoCapitalize="words"
              editable={!isLoading}
            />
          )}

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            editable={!isLoading}
          />

          {!isLogin && (
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry
              editable={!isLoading}
            />
          )}

          <TouchableOpacity
            style={[styles.authButton, isLoading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.authButtonText}>
                {isLogin ? 'Login' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleAuthMode}
            disabled={isLoading}
          >
            <Text style={styles.toggleButtonText}>
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Login"
              }
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestMode}
            disabled={isLoading}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Guest mode has limited features. Create an account to save your progress!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    backgroundColor: '#e9ecef',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
  },
  authButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  authButtonDisabled: {
    backgroundColor: '#ccc',
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  toggleButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 15,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

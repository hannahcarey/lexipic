import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { apiService } from '../../services/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  joinedDate: string;
  preferredLanguages: string[];
}

interface UserStats {
  accuracy: number;
  streak: number;
  level: number;
  xp: number;
  achievements: string[];
}

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        router.replace('/auth');
        return;
      }

      // Skip API calls for guest users, show mock data
      if (userToken.startsWith('guest-')) {
        const mockUser: UserProfile = {
          id: 'guest',
          name: 'Guest User',
          email: 'guest@example.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          totalScore: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          joinedDate: new Date().toISOString().split('T')[0],
          preferredLanguages: ['Spanish', 'French', 'German']
        };

        const mockStats: UserStats = {
          accuracy: 0,
          streak: 0,
          level: 1,
          xp: 0,
          achievements: []
        };

        setUser(mockUser);
        setStats(mockStats);
        setEditName(mockUser.name);
        setEditEmail(mockUser.email);
        return;
      }

      // Load user profile and stats from API
      const [userProfile, userStats] = await Promise.all([
        apiService.getUserProfile(),
        apiService.getUserStats()
      ]);

      // Map API response to local interfaces
      const mappedUser: UserProfile = {
        id: userProfile.id,
        name: userProfile.display_name || userProfile.name || 'User',
        email: userProfile.email,
        avatar: userProfile.avatar,
        totalScore: userProfile.totalScore || 0,
        questionsAnswered: userProfile.questionsAnswered || 0,
        correctAnswers: userProfile.correctAnswers || 0,
        joinedDate: userProfile.joinedDate || new Date().toISOString().split('T')[0],
        preferredLanguages: userProfile.preferredLanguages || ['Spanish', 'French', 'German']
      };

      const mappedStats: UserStats = {
        accuracy: userStats.accuracy || 0,
        streak: userStats.streak || 0,
        level: userStats.level || 1,
        xp: userStats.xp || 0,
        achievements: userStats.achievements || []
      };

      setUser(mappedUser);
      setStats(mappedStats);
      setEditName(mappedUser.name);
      setEditEmail(mappedUser.email);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const performLogout = async () => {
    console.log('Starting logout process...'); // Debug log
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('User token:', userToken ? 'exists' : 'not found'); // Debug log
      
      // Only call backend logout for non-guest users
      if (userToken && !userToken.startsWith('guest-')) {
        console.log('Calling backend logout...'); // Debug log
        try {
          await apiService.logout();
          console.log('Backend logout successful'); // Debug log
        } catch (backendError) {
          console.log('Backend logout failed, but continuing with local cleanup:', backendError);
        }
      } else {
        console.log('Guest user or no token, skipping backend logout');
      }
      
      // Clear local storage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      console.log('Local storage cleared'); // Debug log
      
      // Navigate to auth screen
      router.replace('/auth');
      console.log('Navigation to auth screen initiated'); // Debug log
      
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Error', 'There was an issue logging out, but we\'ll clear your session anyway.');
      
      // Even if everything fails, still try to clear and redirect
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      router.replace('/auth');
    }
  };

  const handleLogout = async () => {
    console.log('Logout button pressed - bypassing confirmation dialog'); // Debug log
    
    // Skip confirmation dialog and logout immediately
    // (Add confirmation back later if needed)
    performLogout();
    
    // Alternative: Try platform-specific alert if the above doesn't work
    // setTimeout(() => {
    //   Alert.alert(
    //     'Confirm Logout',
    //     'Are you sure you want to logout?',
    //     [
    //       { text: 'Cancel', style: 'cancel' },
    //       { text: 'Logout', style: 'destructive', onPress: performLogout }
    //     ]
    //   );
    // }, 100);
  };

  const saveProfile = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      // Don't allow profile editing for guest users
      if (userToken?.startsWith('guest-')) {
        Alert.alert('Info', 'Please create an account to edit your profile');
        setShowEditModal(false);
        return;
      }

      // Update profile via API
      const updatedUser = await apiService.updateUserProfile({
        display_name: editName,
        email: editEmail
      });

      // Update local state with API response
      if (user) {
        setUser({
          ...user,
          name: updatedUser.display_name || updatedUser.name,
          email: updatedUser.email
        });
      }
      
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const xpForCurrentLevel = stats.level * 250;
    const xpForNextLevel = (stats.level + 1) * 250;
    return ((stats.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return '#28a745';
    if (accuracy >= 60) return '#ffc107';
    return '#dc3545';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user || !stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        
        <View style={styles.levelCard}>
          <Text style={styles.levelText}>Level {stats.level}</Text>
          <Text style={styles.xpText}>{stats.xp} XP</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${getLevelProgress()}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(getLevelProgress())}% to Level {stats.level + 1}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user.questionsAnswered}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: getAccuracyColor(stats.accuracy) }]}>
              {stats.accuracy.toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user.totalScore}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
        </View>
      </View>

      <View style={styles.achievementsContainer}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {stats.achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementBadge}>
              <Text style={styles.achievementText}>🏆</Text>
              <Text style={styles.achievementName}>{achievement}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.languagesContainer}>
        <Text style={styles.sectionTitle}>Learning Languages</Text>
        <View style={styles.languagesList}>
          {user.preferredLanguages.map((language, index) => (
            <View key={index} style={styles.languageChip}>
              <Text style={styles.languageText}>{language}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
            />
            
            <TextInput
              style={styles.input}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
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
  header: {
    backgroundColor: '#007AFF',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    backgroundColor: '#e9ecef',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  levelCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  xpText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  achievementsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementBadge: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementText: {
    fontSize: 20,
    marginBottom: 5,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  languagesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageChip: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    color: 'white',
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

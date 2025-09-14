# LexiPic - Language Learning App Setup

## Overview
LexiPic is an Expo React Native app that helps users learn languages by identifying objects through camera photos and random practice sessions.

## Features
- 📸 **Camera Tab**: Take photos of objects and get language learning questions
- 🎯 **Practice Tab**: Random image-based language practice with multiple choice
- 👤 **Profile Tab**: User profile, statistics, and progress tracking  
- 🔐 **Authentication**: Login, signup, and guest mode
- 🌍 **Multi-language Support**: Spanish, Chinese, Japanese

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration

#### For Web Development (localhost)
Create a `.env` file in the root directory with:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

#### For Mobile Development (ExpoGo)
🚨 **Important**: ExpoGo on mobile devices cannot connect to `localhost`. You need to use your computer's IP address.

**Quick Setup (Recommended):**
```bash
npm run setup-mobile
```
This script will automatically detect your IP address and create the `.env` file.

**Manual Setup:**
1. Find your computer's IP address:
   - **Mac**: `ipconfig getifaddr en0`
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **Linux**: `hostname -I | cut -d' ' -f1`

2. Create a `.env` file with your IP address:
```
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000/api
```
Example: `EXPO_PUBLIC_API_URL=http://10.189.111.158:3000/api`

### 3. Start the Development Server
```bash
npm start
```

### 4. Run on Device/Simulator
- iOS Simulator: `npm run ios`
- Android Emulator: `npm run android` 
- Web Browser: `npm run web`
- **Mobile Device (ExpoGo)**: Scan QR code in Expo Go app

## 📱 Mobile Development Troubleshooting

### Common Issues & Solutions:

**1. "Network request failed" or connection timeout:**
- Make sure both your computer and phone are on the same WiFi network
- Check that your firewall allows connections on port 3000
- Verify the IP address in your `.env` file is correct
- Try running `npm run get-ip` to regenerate the configuration

**2. CORS errors:**
- Backend is configured to allow local network connections in development
- Make sure your backend server is running

**3. "Unable to resolve host":**
- Double-check your IP address with `ipconfig getifaddr en0` (Mac)
- Restart both Expo and backend servers after changing the IP

**4. Connection works on web but not mobile:**
- This usually means you're using `localhost` instead of your IP address
- Run `npm run setup-mobile` to fix the configuration

### Network Requirements:
- Both devices must be on the same WiFi network
- Port 3000 must be accessible (check firewall)
- VPN connections might interfere - try disabling if issues persist

## Backend API Requirements

Your backend should implement these endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### User Management  
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/stats` - Get user statistics

### Image Analysis
- `POST /api/image/analyze` - Analyze uploaded image and return questions

### Practice Questions
- `GET /api/questions/random` - Get random practice question
- `POST /api/questions/submit` - Submit answer and update score

## Project Structure

```
expo-fe/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── camera.tsx     # Camera functionality
│   │   ├── generator.tsx  # Random practice
│   │   └── profile.tsx    # User profile
│   ├── auth.tsx          # Authentication screen
│   ├── index.tsx         # Initial routing logic
│   └── _layout.tsx       # Root layout
├── components/           # Reusable components
├── services/            # API services
├── types/               # TypeScript type definitions
├── constants/           # App constants
└── hooks/               # Custom React hooks
```

## Key Dependencies

- **expo-camera**: Camera functionality
- **expo-image-picker**: Image picking from gallery
- **@react-native-async-storage/async-storage**: Local storage
- **axios**: HTTP client for API calls
- **expo-router**: File-based routing

## Development Notes

### Mock Data
The app includes mock data for development when the backend is not available. Look for `TODO:` comments to replace with actual API calls.

### Authentication Flow
1. App starts → Check for stored token
2. Token exists → Navigate to main app
3. No token → Navigate to auth screen
4. Successful auth → Store token and navigate to main app

### Camera Permissions
The app requests camera and media library permissions. Make sure to test on physical devices for full camera functionality.

### Guest Mode
Users can continue as guests with limited features. Guest data is not persisted across app restarts.

## Customization

### Adding New Languages
1. Update the mock data in `generator.tsx` and `camera.tsx`
2. Add language options to the profile preferences
3. Update backend to support new languages

### Styling
The app uses a consistent color scheme:
- Primary: `#007AFF` (iOS Blue)
- Background: `#f8f9fa` (Light Gray)
- Cards: `white` with shadows
- Success: `#28a745` (Green)
- Error: `#dc3545` (Red)

### API Integration
Replace all `TODO:` marked sections with actual API calls using the `apiService` from `services/api.ts`.

## Testing
- Test camera functionality on physical devices
- Verify authentication flow
- Test offline behavior with mock data
- Ensure proper permission handling

## Deployment
1. Update `app.json` with production configuration
2. Set production API URL in environment variables
3. Build for app stores using EAS Build
4. Test on multiple device types and OS versions

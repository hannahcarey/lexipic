# Lexipic Backend API - Supabase Version

A comprehensive Node.js/Express backend API for the Lexipic language learning mobile app. This version uses **Supabase (PostgreSQL)** for data storage and user management.

## 🚀 Features

- **User Authentication** - JWT-based auth with registration, login, and user management
- **Flashcard System** - Create, practice, and manage language learning flashcards  
- **Image Analysis** - Upload images and get related flashcards for practice
- **Progress Tracking** - User statistics, accuracy tracking, and learning analytics
- **Multi-language Support** - Currently supports Spanish, Chinese, and Japanese
- **Supabase Integration** - PostgreSQL database with real-time capabilities

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Follow the detailed setup guide in `SUPABASE_SETUP.md`
   - Run the SQL commands to create the database schema

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Supabase credentials:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST `/auth/register`
Register a new user.
```json
{
  "display_name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

#### POST `/auth/login`
Login user.
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/auth/me`
Get current user profile (requires authentication).

### Flashcard Endpoints

#### GET `/flashcards/random`
Get a random flashcard for practice.
- Query params: `language` (optional)
- Returns: Flashcard with multiple choice options

#### POST `/flashcards/submit`
Submit an answer (requires authentication).
```json
{
  "flashcard_id": "uuid-here",
  "user_answer": "mesa",
  "time_spent": 15
}
```

#### GET `/flashcards`
Get all flashcards (paginated).
- Query params: `page`, `limit`

#### POST `/flashcards`
Create a new flashcard (requires authentication).
```json
{
  "object_name": "table",
  "translation": "mesa",
  "image_url": "https://example.com/image.jpg"
}
```

#### GET `/flashcards/history`
Get user's practice history (requires authentication).

### User Management Endpoints

#### GET `/user/profile`
Get user profile (requires authentication).

#### PUT `/user/profile`
Update user profile (requires authentication).
```json
{
  "display_name": "Updated Name",
  "preferred_languages": ["Spanish", "French"]
}
```

#### GET `/user/stats`
Get detailed user statistics (requires authentication).

#### GET `/user/leaderboard`
Get top users leaderboard.

### Image Analysis Endpoints

#### POST `/image/analyze`
Analyze an image and get a related flashcard (multipart/form-data).
- Upload field: `image`

#### POST `/image/upload`
Upload an image and get URL (multipart/form-data).

## 🗄️ Database Schema

The app uses three main tables in PostgreSQL:

### `users`
- `id` (UUID) - Primary key
- `email` (TEXT) - Unique, required
- `password_hash` (TEXT) - Hashed password
- `display_name` (TEXT) - User's display name
- `avatar` (TEXT) - Avatar URL
- `preferred_languages` (TEXT[]) - Array of preferred languages
- `created_at` (TIMESTAMP) - Account creation date

### `flashcards`
- `id` (UUID) - Primary key  
- `object_name` (TEXT) - Name of the object in English
- `translation` (TEXT) - Translation in target language
- `image_url` (TEXT) - URL to object image
- `created_by` (UUID) - Foreign key to users table
- `created_at` (TIMESTAMP) - Creation date

### `user_flashcard_stats`
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `flashcard_id` (UUID) - Foreign key to flashcards  
- `times_seen` (INTEGER) - How many times user saw this flashcard
- `times_correct` (INTEGER) - How many times user got it right
- `last_seen` (TIMESTAMP) - When user last practiced this flashcard

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## 📊 Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🧪 Testing

Test the API endpoints:

1. **Health Check**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Register User**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"display_name":"Test User","email":"test@example.com","password":"password123"}'
   ```

3. **Get Random Flashcard**
   ```bash
   curl http://localhost:3000/api/flashcards/random
   ```

## 🚀 Production Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-production-jwt-secret-32-chars-minimum
   ```

3. **Start in production**
   ```bash
   npm start
   ```

## 🔧 Development Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server
npm run seed     # Seed database with sample flashcards
```

## 📁 Project Structure

```
api/
├── src/
│   ├── controllers/     # Request handlers
│   │   ├── authController.ts
│   │   ├── userController.ts  
│   │   ├── flashcardController.ts
│   │   └── imageController.ts
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/         # API route definitions
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Utilities (JWT, Supabase client)
│   ├── scripts/        # Database seeding
│   └── server.ts       # Main server file
├── uploads/            # File uploads (development)
├── dist/              # Compiled JavaScript
└── README.md          # This file
```

## 🔄 Migration from MongoDB

This version has been migrated from MongoDB to Supabase. Key changes:
- Replaced Mongoose models with Supabase client
- Updated schema to use PostgreSQL/UUID instead of MongoDB ObjectIds
- Simplified user model to match Supabase auth patterns
- Replaced "questions" with "flashcards" for better UX

## 🤝 Integration with Frontend

Update your frontend environment variables to point to this API:

```typescript
// Frontend .env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

The API is fully compatible with the Lexipic mobile app built with Expo/React Native.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
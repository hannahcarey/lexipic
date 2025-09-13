# Supabase Setup for Lexipic Backend

## 🗄️ Database Schema

Run these SQL commands in your Supabase SQL editor to create the required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,  -- if not using external auth
  display_name TEXT,
  avatar TEXT,
  preferred_languages TEXT[],
  last_login TIMESTAMP WITHOUT TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_name TEXT NOT NULL,
  translation TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_by UUID REFERENCES users(id), -- optional
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- User progress / statistics
CREATE TABLE user_flashcard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  times_seen INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_seen TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, flashcard_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_flashcards_object_name ON flashcards(object_name);
CREATE INDEX idx_user_flashcard_stats_user_id ON user_flashcard_stats(user_id);
CREATE INDEX idx_user_flashcard_stats_flashcard_id ON user_flashcard_stats(flashcard_id);
CREATE INDEX idx_user_flashcard_stats_last_seen ON user_flashcard_stats(last_seen DESC);
```

## 🚀 Environment Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Get your credentials** from the Supabase dashboard:
   - Go to Settings → API
   - Copy your Project URL
   - Copy your `anon` key  
   - Copy your `service_role` key (keep this secret!)

3. **Get your database URL**:
   - Go to Settings → Database
   - Copy the connection string under "Connection parameters"
   - It should look like: `postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres`

4. **Update your `.env` file**:
   ```bash
   # Replace these with your actual Supabase credentials
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

## 🌱 Seed the Database

After setting up your environment variables:

```bash
npm run seed
```

This will populate your database with sample flashcards for testing.

## 🔐 Row Level Security (Optional)

For production, enable RLS on your tables:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcard_stats ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Anyone can view flashcards
CREATE POLICY "Anyone can view flashcards" ON flashcards FOR SELECT TO PUBLIC USING (true);

-- Users can only view/edit their own stats
CREATE POLICY "Users can view own stats" ON user_flashcard_stats FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own stats" ON user_flashcard_stats FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own stats" ON user_flashcard_stats FOR UPDATE USING (auth.uid()::text = user_id::text);
```

## 🧪 Testing

Test your setup:

1. **Start the server**: `npm run dev`
2. **Health check**: `curl http://localhost:3000/api/health`
3. **Register a user**: 
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"display_name":"Test User","email":"test@example.com","password":"password123"}'
   ```
4. **Get random flashcard**: `curl http://localhost:3000/api/flashcards/random`

## 🔧 Troubleshooting

### "Failed to connect to Supabase"
- Check your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` 
- Make sure the service role key has the right permissions

### "relation does not exist"  
- Make sure you've run the SQL schema commands in your Supabase SQL editor
- Check that all tables were created successfully

### "JWT secret configured: false"
- Make sure your `JWT_SECRET` is set in your .env file
- It should be at least 32 characters long for security

### Permission Denied
- If using RLS, make sure your policies are configured correctly
- For development, you can temporarily disable RLS: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

-- Run these commands in Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)

-- 1. Add language field to flashcards table
ALTER TABLE flashcards 
ADD COLUMN language TEXT NOT NULL DEFAULT 'Spanish';

-- 2. Add language field to user_flashcard_stats table  
ALTER TABLE user_flashcard_stats
ADD COLUMN language TEXT NOT NULL DEFAULT 'Spanish';

-- 3. Update existing flashcards to have Spanish language (in case default didn't apply)
UPDATE flashcards 
SET language = 'Spanish' 
WHERE language IS NULL OR language = '';

-- 4. Update existing user stats to have Spanish language  
UPDATE user_flashcard_stats 
SET language = 'Spanish' 
WHERE language IS NULL OR language = '';

-- 5. Create indexes for better performance
CREATE INDEX idx_flashcards_language ON flashcards(language);
CREATE INDEX idx_flashcards_language_object ON flashcards(language, object_name);
CREATE INDEX idx_user_flashcard_stats_language ON user_flashcard_stats(language);
CREATE INDEX idx_user_flashcard_stats_user_language ON user_flashcard_stats(user_id, language);

-- 6. Optional: Add constraints for valid languages (uncomment if needed)
-- ALTER TABLE flashcards 
-- ADD CONSTRAINT check_flashcards_language 
-- CHECK (language IN ('Spanish', 'French', 'German', 'Italian', 'Chinese', 'Japanese', 'Korean'));

-- ALTER TABLE user_flashcard_stats 
-- ADD CONSTRAINT check_user_stats_language 
-- CHECK (language IN ('Spanish', 'French', 'German', 'Italian', 'Chinese', 'Japanese', 'Korean'));

-- 7. Verify the migration worked
SELECT 'flashcards' as table_name, COUNT(*) as total_rows, language, COUNT(*) as rows_per_language
FROM flashcards 
GROUP BY language
UNION ALL
SELECT 'user_flashcard_stats' as table_name, COUNT(*) as total_rows, language, COUNT(*) as rows_per_language
FROM user_flashcard_stats 
GROUP BY language;

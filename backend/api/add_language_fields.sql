to-- Add language fields to flashcards and user_flashcard_stats tables

-- Add language field to flashcards table
ALTER TABLE flashcards 
ADD COLUMN language TEXT NOT NULL DEFAULT 'Spanish';

-- Add language field to user_flashcard_stats table  
ALTER TABLE user_flashcard_stats
ADD COLUMN language TEXT NOT NULL DEFAULT 'Spanish';

-- Update existing flashcards to have proper language (they're currently Spanish)
UPDATE flashcards 
SET language = 'Spanish' 
WHERE language = 'Spanish'; -- This sets the default we just added

-- You could also be more specific with language codes:
-- UPDATE flashcards SET language = 'es' WHERE language = 'Spanish';

-- Add indexes for better performance with language filtering
CREATE INDEX idx_flashcards_language ON flashcards(language);
CREATE INDEX idx_flashcards_language_object ON flashcards(language, object_name);
CREATE INDEX idx_user_flashcard_stats_language ON user_flashcard_stats(language);
CREATE INDEX idx_user_flashcard_stats_user_language ON user_flashcard_stats(user_id, language);

-- Optional: Create a check constraint for valid languages
-- ALTER TABLE flashcards 
-- ADD CONSTRAINT check_flashcards_language 
-- CHECK (language IN ('Spanish', 'Chinese', 'Japanese'));

-- ALTER TABLE user_flashcard_stats 
-- ADD CONSTRAINT check_user_stats_language 
-- CHECK (language IN ('Spanish', 'Chinese', 'Japanese'));

import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../utils/supabase';

const seedFlashcards = [
  // Spanish Flashcards
  {
    object_name: "table",
    translation: "mesa",
    image_url: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400"
  },
  {
    object_name: "chair",
    translation: "silla",
    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
  },
  {
    object_name: "car",
    translation: "coche",
    image_url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400"
  },
  {
    object_name: "door",
    translation: "puerta",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    object_name: "cat",
    translation: "gato",
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400"
  },
  {
    object_name: "dog",
    translation: "perro",
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"
  },
  {
    object_name: "house",
    translation: "casa",
    image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"
  },
  {
    object_name: "window",
    translation: "ventana",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  },
  {
    object_name: "book",
    translation: "libro",
    image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
  },
  {
    object_name: "phone",
    translation: "teléfono",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
  },
  {
    object_name: "computer",
    translation: "computadora",
    image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
  },
  {
    object_name: "apple",
    translation: "manzana",
    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"
  },
  {
    object_name: "water",
    translation: "agua",
    image_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400"
  },
  {
    object_name: "tree",
    translation: "árbol",
    image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400"
  },
  {
    object_name: "flower",
    translation: "flor",
    image_url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400"
  },
  {
    object_name: "sun",
    translation: "sol",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
  },
  {
    object_name: "moon",
    translation: "luna",
    image_url: "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=400"
  },
  {
    object_name: "bird",
    translation: "pájaro",
    image_url: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400"
  },
  {
    object_name: "fish",
    translation: "pez",
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400"
  },
  {
    object_name: "bread",
    translation: "pan",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"
  },

  // French Flashcards
  {
    object_name: "table",
    translation: "table",
    image_url: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400"
  },
  {
    object_name: "chair",
    translation: "chaise",
    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
  },
  {
    object_name: "car",
    translation: "voiture",
    image_url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400"
  },
  {
    object_name: "door",
    translation: "porte",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    object_name: "cat",
    translation: "chat",
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400"
  },

  // German Flashcards
  {
    object_name: "table",
    translation: "Tisch",
    image_url: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400"
  },
  {
    object_name: "chair",
    translation: "Stuhl",
    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
  },
  {
    object_name: "car",
    translation: "Auto",
    image_url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400"
  },
  {
    object_name: "door",
    translation: "Tür",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    object_name: "window",
    translation: "Fenster",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  }
];

const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting Supabase database seeding...');

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Failed to connect to Supabase:', testError);
      process.exit(1);
    }

    console.log('✅ Supabase connection successful');

    // Clear existing flashcards
    console.log('🗑️  Clearing existing flashcards...');
    const { error: deleteError } = await supabase
      .from('flashcards')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.warn('⚠️  Could not clear existing flashcards:', deleteError);
    }

    // Insert seed flashcards
    console.log('📝 Inserting seed flashcards...');
    const { data: insertedFlashcards, error: insertError } = await supabase
      .from('flashcards')
      .insert(seedFlashcards)
      .select();

    if (insertError) {
      console.error('❌ Error inserting flashcards:', insertError);
      process.exit(1);
    }

    console.log(`✅ Successfully seeded ${insertedFlashcards?.length || 0} flashcards!`);

    // Log statistics
    const { data: stats, error: statsError } = await supabase
      .from('flashcards')
      .select('object_name, translation')
      .limit(1000);

    if (!statsError && stats) {
      const languageStats: { [key: string]: number } = {};
      stats.forEach(flashcard => {
        // Simple language detection based on common patterns
        const translation = flashcard.translation;
        let language = 'Unknown';
        
        if (translation.includes('ñ') || translation.includes('á') || translation.includes('é') || translation.includes('í') || translation.includes('ó') || translation.includes('ú')) {
          language = 'Spanish';
        } else if (translation.includes('ç') || translation.includes('è') || translation.includes('é') || translation.includes('à')) {
          language = 'French';
        } else if (translation[0] === translation[0].toUpperCase() && translation.length > 1) {
          language = 'German';
        } else if (/^[a-zA-Z\s]+$/.test(translation)) {
          // Check for common Spanish words
          const spanishWords = ['mesa', 'silla', 'coche', 'puerta', 'gato', 'perro', 'casa', 'ventana', 'libro', 'teléfono', 'computadora', 'manzana', 'agua', 'árbol', 'flor', 'sol', 'luna', 'pájaro', 'pez', 'pan'];
          const frenchWords = ['table', 'chaise', 'voiture', 'porte', 'chat'];
          const germanWords = ['Tisch', 'Stuhl', 'Auto', 'Tür', 'Fenster'];
          
          if (spanishWords.includes(translation)) {
            language = 'Spanish';
          } else if (frenchWords.includes(translation)) {
            language = 'French';
          } else if (germanWords.includes(translation)) {
            language = 'German';
          }
        }
        
        languageStats[language] = (languageStats[language] || 0) + 1;
      });

      console.log('\n📊 Seeding Statistics:');
      Object.entries(languageStats).forEach(([language, count]) => {
        console.log(`  ${language}: ${count} flashcards`);
      });
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Update your .env file with your Supabase credentials');
    console.log('  2. Start the development server: npm run dev');
    console.log('  3. Test the API endpoints');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
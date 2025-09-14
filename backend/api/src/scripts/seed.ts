import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../utils/supabase';

const seedFlashcards = [
  // ========== SPANISH FLASHCARDS ==========
  {
    object_name: "table",
    translation: "mesa",
    image_url: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400",
    language: "Spanish"
  },
  {
    object_name: "chair",
    translation: "silla",
    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    language: "Spanish"
  },
  {
    object_name: "car",
    translation: "coche",
    image_url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400",
    language: "Spanish"
  },
  {
    object_name: "door",
    translation: "puerta",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    language: "Spanish"
  },
  {
    object_name: "cat",
    translation: "gato",
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    language: "Spanish"
  },
  {
    object_name: "dog",
    translation: "perro",
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    language: "Spanish"
  },
  {
    object_name: "house",
    translation: "casa",
    image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
    language: "Spanish"
  },
  {
    object_name: "window",
    translation: "ventana",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    language: "Spanish"
  },
  {
    object_name: "book",
    translation: "libro",
    image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    language: "Spanish"
  },
  {
    object_name: "phone",
    translation: "teléfono",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    language: "Spanish"
  },
  {
    object_name: "computer",
    translation: "computadora",
    image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    language: "Spanish"
  },
  {
    object_name: "apple",
    translation: "manzana",
    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    language: "Spanish"
  },
  {
    object_name: "water",
    translation: "agua",
    image_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400",
    language: "Spanish"
  },
  {
    object_name: "tree",
    translation: "árbol",
    image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    language: "Spanish"
  },
  {
    object_name: "flower",
    translation: "flor",
    image_url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400",
    language: "Spanish"
  },
  
  // ========== CHINESE FLASHCARDS ==========
  {
    object_name: "table",
    translation: "桌子",
    image_url: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400",
    language: "Chinese"
  },
  {
    object_name: "chair",
    translation: "椅子",
    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    language: "Chinese"
  },
  {
    object_name: "car",
    translation: "汽车",
    image_url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400",
    language: "Chinese"
  },
  {
    object_name: "door",
    translation: "门",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    language: "Chinese"
  },
  {
    object_name: "cat",
    translation: "猫",
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    language: "Chinese"
  },
  {
    object_name: "dog",
    translation: "狗",
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    language: "Chinese"
  },
  {
    object_name: "house",
    translation: "房子",
    image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
    language: "Chinese"
  },
  {
    object_name: "window",
    translation: "窗户",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    language: "Chinese"
  },
  {
    object_name: "book",
    translation: "书",
    image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    language: "Chinese"
  },
  {
    object_name: "phone",
    translation: "电话",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    language: "Chinese"
  },
  {
    object_name: "computer",
    translation: "电脑",
    image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    language: "Chinese"
  },
  {
    object_name: "apple",
    translation: "苹果",
    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    language: "Chinese"
  },
  {
    object_name: "water",
    translation: "水",
    image_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400",
    language: "Chinese"
  },
  {
    object_name: "tree",
    translation: "树",
    image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    language: "Chinese"
  },
  {
    object_name: "flower",
    translation: "花",
    image_url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400",
    language: "Chinese"
  },
  
  // ========== JAPANESE FLASHCARDS ==========
  {
    object_name: "table",
    translation: "テーブル",
    image_url: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400",
    language: "Japanese"
  },
  {
    object_name: "chair",
    translation: "いす",
    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    language: "Japanese"
  },
  {
    object_name: "car",
    translation: "車",
    image_url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400",
    language: "Japanese"
  },
  {
    object_name: "door",
    translation: "ドア",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    language: "Japanese"
  },
  {
    object_name: "cat",
    translation: "猫",
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    language: "Japanese"
  },
  {
    object_name: "dog",
    translation: "犬",
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    language: "Japanese"
  },
  {
    object_name: "house",
    translation: "家",
    image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
    language: "Japanese"
  },
  {
    object_name: "window",
    translation: "窓",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    language: "Japanese"
  },
  {
    object_name: "book",
    translation: "本",
    image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    language: "Japanese"
  },
  {
    object_name: "phone",
    translation: "電話",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    language: "Japanese"
  },
  {
    object_name: "computer",
    translation: "コンピューター",
    image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    language: "Japanese"
  },
  {
    object_name: "apple",
    translation: "りんご",
    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    language: "Japanese"
  },
  {
    object_name: "water",
    translation: "水",
    image_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400",
    language: "Japanese"
  },
  {
    object_name: "tree",
    translation: "木",
    image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    language: "Japanese"
  },
  {
    object_name: "flower",
    translation: "花",
    image_url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400",
    language: "Japanese"
  }
];

const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting Supabase database seeding with multilingual flashcards...');

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

    // Insert seed flashcards in batches to avoid timeout
    console.log('📝 Inserting multilingual flashcards...');
    const batchSize = 15;
    let insertedCount = 0;
    
    for (let i = 0; i < seedFlashcards.length; i += batchSize) {
      const batch = seedFlashcards.slice(i, i + batchSize);
      
      const { data: insertedBatch, error: insertError } = await supabase
        .from('flashcards')
        .insert(batch)
        .select();

      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError);
        process.exit(1);
      }

      insertedCount += insertedBatch?.length || 0;
      console.log(`  ✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${insertedBatch?.length} flashcards`);
    }

    console.log(`🎉 Successfully seeded ${insertedCount} multilingual flashcards!`);

    // Log statistics by language
    const { data: stats, error: statsError } = await supabase
      .from('flashcards')
      .select('language')
      .limit(1000);

    if (!statsError && stats) {
      const languageStats: { [key: string]: number } = {};
      stats.forEach(flashcard => {
        languageStats[flashcard.language] = (languageStats[flashcard.language] || 0) + 1;
      });

      console.log('\n📊 Seeding Statistics:');
      Object.entries(languageStats).forEach(([language, count]) => {
        console.log(`  ${language}: ${count} flashcards`);
      });
    }

    // Show sample flashcards
    const { data: sampleCards, error: sampleError } = await supabase
      .from('flashcards')
      .select('object_name, translation, language')
      .limit(6);

    if (!sampleError && sampleCards) {
      console.log('\n🃏 Sample Flashcards:');
      sampleCards.forEach(card => {
        console.log(`  ${card.object_name} → ${card.translation} (${card.language})`);
      });
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Update backend controllers to use language filtering');
    console.log('  2. Add language selection to the frontend');
    console.log('  3. Test the multilingual flashcard system');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
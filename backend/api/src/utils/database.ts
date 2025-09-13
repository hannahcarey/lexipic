import { supabase } from './supabase';

const connectDatabase = async (): Promise<void> => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error);
      throw error;
    }

    console.log('✅ Supabase Connected Successfully');
    console.log('🔑 JWT secret configured:', !!process.env.JWT_SECRET);
    console.log('🌍 Supabase URL:', process.env.SUPABASE_URL);

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default connectDatabase;

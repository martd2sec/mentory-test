import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables (warn but don't fail in development)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - using mock mode:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseAnonKey ? 'Present' : 'Missing'
  });
  // Don't throw error in development - continue with mock mode
}

// Validate URL format and accessibility
const validateSupabaseUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Check if it's a valid Supabase URL format (including localhost for development)
    return urlObj.hostname.includes('supabase.co') || 
           urlObj.hostname.includes('supabase.com') ||
           urlObj.hostname.includes('localhost') ||
           urlObj.hostname.includes('127.0.0.1');
  } catch (error) {
    return false;
  }
};

if (!validateSupabaseUrl(supabaseUrl)) {
  console.warn('Invalid Supabase URL format:', supabaseUrl, '- Continuing in offline mode');
  // Don't throw error in development, just warn
}

// Supabase client initialization (offline mode when configured)

// Create a disabled Supabase client for offline mode
const createOfflineClient = () => {
  return {
    auth: {
      signInWithOAuth: () => Promise.resolve({ data: null, error: new Error('Offline mode') }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    })
  };
};

export const supabase = (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'http://localhost:54321') 
  ? createOfflineClient() as any
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true, // Enable token refresh for OAuth
        persistSession: true,   // Enable session persistence for OAuth
        detectSessionInUrl: true, // CRITICAL: Enable OAuth callback detection
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'mentorship-platform'
        }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      }
    });

// Connection test disabled in development mode
// const testConnection = async () => {
//   try {
//     console.log('Testing Supabase connection...');
//     // Simple test that doesn't require database access
//     await supabase.auth.getSession();
//     console.log('Supabase connection test completed');
//   } catch (error) {
//     console.log('Supabase connection test failed, but continuing...');
//   }
// };

// Test connection with delay to allow for initialization
// setTimeout(testConnection, 2000);

// Database types
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'mentor' | 'user';
  created_at: string;
  updated_at: string;
}

export interface MentorProfile {
  id: string;
  user_id: string;
  picture_url?: string;
  location?: string;
  strengths: string[];
  availability_preferences?: string;
  why_choose_me?: string;
  booking_link?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  user_profiles?: UserProfile;
}

export interface Booking {
  id: string;
  mentor_id: string;
  booked_by: string;
  booked_at: string;
  scheduled_at?: string;
  status: 'active' | 'completed' | 'cancelled';
  selected_skills: string[];
  message?: string;
  google_calendar_mentor_event_id?: string;
  google_calendar_mentee_event_id?: string;
  created_at: string;
  updated_at: string;
  mentors?: MentorProfile;
  user_profiles?: UserProfile;
}

// Feedback functions
export interface FeedbackData {
  id?: string;
  user_id: string;
  user_email: string;
  rating: number;
  category: string;
  feedback_text: string;
  created_at?: string;
  updated_at?: string;
}

export async function createFeedback(feedbackData: Omit<FeedbackData, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createFeedback:', error);
    throw error;
  }
}

export async function getFeedback(userId?: string) {
  try {
    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFeedback:', error);
    throw error;
  }
}

export async function getFeedbackStats() {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('rating, category, created_at');

    if (error) {
      console.error('Error fetching feedback stats:', error);
      throw error;
    }

    const stats = {
      totalFeedback: data?.length || 0,
      averageRating: data?.length ? (data.reduce((sum: number, item: any) => sum + item.rating, 0) / data.length).toFixed(1) : 0,
      categoryBreakdown: data?.reduce((acc: Record<string, number>, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      ratingDistribution: data?.reduce((acc: Record<number, number>, item: any) => {
        acc[item.rating] = (acc[item.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {},
    };

    return stats;
  } catch (error) {
    console.error('Error in getFeedbackStats:', error);
    throw error;
  }
}
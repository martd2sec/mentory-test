import type { User } from '@supabase/supabase-js';

export const DEV_CONFIG = {
  ENABLE_MOCK_MODE: false,
  // Force offline mode for demo purposes (set to false to allow real Google OAuth)
  FORCE_OFFLINE_MODE: false, // Fixed: Removed problematic /health endpoint call
  
  // Mock user data for development
  MOCK_USER: {
    id: 'maria-achaga-123',
    email: 'maria.achaga@bitso.com',
    user_metadata: {
      full_name: 'Maria Achaga',
      avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    },
    role: 'admin',
    app_metadata: {
      provider: 'email',
      providers: ['email'],
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as unknown as User,
  
  // CLEANED: Empty mentors array for fresh start
  MOCK_MENTORS: [
    {
      id: 'mentor-sample-1',
      user_id: 'user-sample-1',
      picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      location: 'Mexico City, Mexico',
      strengths: ['Leadership', 'Team Management', 'Product Strategy'],
      availability_preferences: 'Weekdays 9 AM - 6 PM (GMT-6), prefer morning meetings',
      why_choose_me: 'I have 8+ years leading engineering teams and launching successful products. I can help you develop leadership skills and navigate complex technical challenges.',
      booking_link: '',
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_profiles: {
        id: 'user-sample-1',
        email: 'carlos.mentor@example.com',
        first_name: 'Carlos',
        last_name: 'Rodriguez',
        role: 'mentor' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: 'mentor-sample-2',
      user_id: 'user-sample-2',
      picture_url: 'https://images.unsplash.com/photo-1494790108755-2616b612d7c2?w=400',
      location: 'Remote - Available Globally',
      strengths: ['Data Science', 'Machine Learning', 'Python'],
      availability_preferences: 'Flexible hours, available for async mentoring and weekend calls',
      why_choose_me: 'Data scientist with experience in fintech. I specialize in ML algorithms and can guide you through complex data projects.',
      booking_link: '',
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_profiles: {
        id: 'user-sample-2',
        email: 'ana.mentor@example.com',
        first_name: 'Ana',
        last_name: 'Garcia',
        role: 'mentor' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: 'mentor-sample-3',
      user_id: 'user-sample-3',
      picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      location: 'São Paulo, Brazil',
      strengths: ['Frontend Development', 'React', 'UX Design'],
      availability_preferences: 'Mondays, Wednesdays, Fridays 2-8 PM (GMT-3)',
      why_choose_me: 'Frontend expert with design background. I can help you build beautiful, user-friendly applications.',
      booking_link: '',
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_profiles: {
        id: 'user-sample-3',
        email: 'luis.mentor@example.com',
        first_name: 'Luis',
        last_name: 'Silva',
        role: 'mentor' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  ] as any[],
  
  // CLEANED: Empty selections array for fresh start  
  MOCK_SELECTIONS: [] as any[],
  
  // CLEANED: Reset dashboard stats to zero for fresh start
  MOCK_DASHBOARD_STATS: {
    totalMentees: 0,
    newMenteesThisMonth: 0,
    totalMentors: 0,
    availableMentors: 0,
    topPerformingMentors: []
  },
  
  // Sample feedback data for testing export functionality
  MOCK_FEEDBACK: [
    {
      id: 'feedback-1',
      user_id: 'user-sample-1',
      user_email: 'jane.doe@bitso.com',
      rating: 5,
      category: 'general',
      feedback_text: 'What I like most: The mentorship program has been incredibly valuable. The mentors are knowledgeable and supportive.\n\nConstructive feedback: Would love to see more structured learning paths and maybe group sessions.',
      created_at: new Date('2024-01-15').toISOString(),
      updated_at: new Date('2024-01-15').toISOString()
    },
    {
      id: 'feedback-2',
      user_id: 'user-sample-2',
      user_email: 'john.smith@bitso.com',
      rating: 4,
      category: 'mentorship',
      feedback_text: 'What I like most: Great flexibility in scheduling and mentor expertise is excellent.\n\nConstructive feedback: Sometimes it takes a while to get responses, but overall very satisfied.',
      created_at: new Date('2024-01-20').toISOString(),
      updated_at: new Date('2024-01-20').toISOString()
    },
    {
      id: 'feedback-3',
      user_id: 'user-sample-3',
      user_email: 'maria.rodriguez@bitso.com',
      rating: 5,
      category: 'platform',
      feedback_text: 'What I like most: The platform is user-friendly and the booking process is seamless.\n\nConstructive feedback: Maybe add a mobile app for easier access.',
      created_at: new Date('2024-02-05').toISOString(),
      updated_at: new Date('2024-02-05').toISOString()
    },
    {
      id: 'feedback-4',
      user_id: 'user-sample-4',
      user_email: 'carlos.lopez@bitso.com',
      rating: 3,
      category: 'general',
      feedback_text: 'What I like most: Good variety of mentors with different specializations.\n\nConstructive feedback: Need more mentors in certain areas like data science and UX design.',
      created_at: new Date('2024-02-10').toISOString(),
      updated_at: new Date('2024-02-10').toISOString()
    }
  ] as any[]
};

// Helper functions for mentor selection logic
export const getMentorSelectionCount = (mentorId: string): number => {
  if (DEV_CONFIG.MOCK_SELECTIONS.length === 0) return 0;
  return DEV_CONFIG.MOCK_SELECTIONS.filter(
    (selection: any) => selection.mentor_id === mentorId && selection.status === 'active'
  ).length;
};

export const isMentorAvailableForSelection = (mentorId: string): boolean => {
  return getMentorSelectionCount(mentorId) < 2; // Max 2 mentees per mentor
};

export const addMentorSelection = (mentorId: string, userId: string, workDescription: string, estimatedSessions: number, userProfile?: any) => {
  // Find the mentor to get additional info for the selection
  const mentor = DEV_CONFIG.MOCK_MENTORS.find((m: any) => m.id === mentorId);
  
  console.log('🔍 addMentorSelection called with userProfile:', userProfile);
  
  // Use provided user profile or create a basic one
  const selectionUserProfile = userProfile || {
    id: userId,
    email: 'user@example.com', // This would be real user email
    first_name: 'User',
    last_name: 'Name',
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('📋 Final selectionUserProfile:', selectionUserProfile);
  
  const newSelection = {
    id: `selection-${Date.now()}`,
    mentor_id: mentorId,
    selected_by: userId,
    selected_at: new Date().toISOString(),
    status: 'active',
    work_description: workDescription,
    estimated_sessions: estimatedSessions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Include mentor details for UI display
    mentors: mentor || null,
    // Include user profile details for mentor dashboard
    user_profiles: selectionUserProfile
  };
  
  DEV_CONFIG.MOCK_SELECTIONS.push(newSelection as any);
  console.log('✅ New mentor selection added:', newSelection);
  console.log('📊 Total selections now:', DEV_CONFIG.MOCK_SELECTIONS.length);
};

// Función para actualizar perfil de mentor con nombres
export const updateMentorProfileNames = (userId: string, firstName: string, lastName: string) => {
  const mentorIndex = DEV_CONFIG.MOCK_MENTORS.findIndex((mentor: any) => mentor.user_id === userId);
  
  if (mentorIndex !== -1) {
    DEV_CONFIG.MOCK_MENTORS[mentorIndex].user_profiles.first_name = firstName;
    DEV_CONFIG.MOCK_MENTORS[mentorIndex].user_profiles.last_name = lastName;
    DEV_CONFIG.MOCK_MENTORS[mentorIndex].updated_at = new Date().toISOString();
    
    console.log('✅ Mentor profile updated with names:', DEV_CONFIG.MOCK_MENTORS[mentorIndex]);
    return true;
  } else {
    console.log('❌ Mentor not found for userId:', userId);
    return false;
  }
};

// Función para actualizar un mentor específico por email
export const updateMentorByEmail = (email: string, firstName: string, lastName: string) => {
  console.log('🔍 Looking for mentor with email:', email);
  console.log('📊 Total mentors in system:', DEV_CONFIG.MOCK_MENTORS.length);
  
  // Debug: show all mentor emails
  DEV_CONFIG.MOCK_MENTORS.forEach((mentor: any, index: number) => {
    console.log(`Mentor ${index}:`, {
      email: mentor.user_profiles?.email,
      currentName: `${mentor.user_profiles?.first_name || ''} ${mentor.user_profiles?.last_name || ''}`.trim()
    });
  });
  
  const mentorIndex = DEV_CONFIG.MOCK_MENTORS.findIndex((mentor: any) => 
    mentor.user_profiles?.email === email
  );
  
  if (mentorIndex !== -1) {
    console.log('✅ Found mentor at index:', mentorIndex);
    DEV_CONFIG.MOCK_MENTORS[mentorIndex].user_profiles.first_name = firstName;
    DEV_CONFIG.MOCK_MENTORS[mentorIndex].user_profiles.last_name = lastName;
    DEV_CONFIG.MOCK_MENTORS[mentorIndex].updated_at = new Date().toISOString();
    
    console.log('✅ Mentor profile updated by email:', DEV_CONFIG.MOCK_MENTORS[mentorIndex]);
    console.log('🔄 New name:', `${firstName} ${lastName}`);
    return true;
  } else {
    console.log('❌ Mentor not found for email:', email);
    console.log('📝 Available emails:', DEV_CONFIG.MOCK_MENTORS.map((m: any) => m.user_profiles?.email));
    return false;
  }
};

// Función para debugging - mostrar todos los mentores
export const debugMentors = () => {
  console.log('🔍 All current mentors:', DEV_CONFIG.MOCK_MENTORS);
  DEV_CONFIG.MOCK_MENTORS.forEach((mentor: any, index: number) => {
    console.log(`Mentor ${index}:`, {
      id: mentor.id,
      user_id: mentor.user_id,
      email: mentor.user_profiles?.email,
      firstName: mentor.user_profiles?.first_name,
      lastName: mentor.user_profiles?.last_name
    });
  });
};

// Función para asegurar que un usuario esté en la lista de mentores
export const ensureMentorExists = (userProfile: any, mentorData?: any) => {
  if (!userProfile?.email) return false;
  
  // Check if mentor already exists
  const existingMentor = DEV_CONFIG.MOCK_MENTORS.find((mentor: any) => 
    mentor.user_profiles?.email === userProfile.email
  );
  
  if (existingMentor) {
    console.log('✅ Mentor already exists:', existingMentor);
    return true;
  }
  
  // Create new mentor entry
  const newMentor = {
    id: `mentor-${Date.now()}`,
    user_id: userProfile.id,
    picture_url: mentorData?.picture_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    location: mentorData?.location || 'Remote',
    strengths: mentorData?.strengths || ['feedback', 'influence', 'troubleshooting', 'design'],
    availability_preferences: mentorData?.availability_preferences || 'Flexible hours',
    why_choose_me: mentorData?.why_choose_me || 'Experienced professional ready to help you grow.',
    booking_link: '',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_profiles: {
      id: userProfile.id,
      email: userProfile.email,
      first_name: userProfile.first_name || '',
      last_name: userProfile.last_name || '',
      role: 'mentor' as const,
      created_at: userProfile.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
  
  DEV_CONFIG.MOCK_MENTORS.push(newMentor);
  console.log('✅ New mentor created:', newMentor);
  return true;
};

export const getMentorSelections = (mentorId: string) => {
  if (DEV_CONFIG.MOCK_SELECTIONS.length === 0) return [];
  return DEV_CONFIG.MOCK_SELECTIONS.filter(
    (selection: any) => selection.mentor_id === mentorId
  );
};

// Dashboard helper functions
export const getAllMentees = () => {
  if (DEV_CONFIG.MOCK_SELECTIONS.length === 0) return [];
  const uniqueMentees = new Set(DEV_CONFIG.MOCK_SELECTIONS.map((sel: any) => sel.selected_by));
  return Array.from(uniqueMentees);
};

export const getMenteesThisMonth = () => {
  if (DEV_CONFIG.MOCK_SELECTIONS.length === 0) return [];
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  return DEV_CONFIG.MOCK_SELECTIONS.filter((selection: any) => {
    const selectionDate = new Date(selection.selected_at);
    return selectionDate.getMonth() === thisMonth && selectionDate.getFullYear() === thisYear;
  }).map((sel: any) => sel.selected_by);
};

export const getExportMenteesData = () => {
  if (DEV_CONFIG.MOCK_SELECTIONS.length === 0) return [];
  return DEV_CONFIG.MOCK_SELECTIONS.map((selection: any) => ({
    email: selection.user_profiles?.email || 'N/A',
    mentorName: selection.mentors?.user_profiles?.first_name + ' ' + selection.mentors?.user_profiles?.last_name || 'N/A',
    selectedAt: selection.selected_at,
    workDescription: selection.work_description,
    estimatedSessions: selection.estimated_sessions
  }));
};

export const getExportMentorsData = () => {
  if (DEV_CONFIG.MOCK_MENTORS.length === 0) return [];
  return DEV_CONFIG.MOCK_MENTORS.map((mentor: any) => ({
    email: mentor.user_profiles?.email || 'N/A',
    name: mentor.user_profiles?.first_name + ' ' + mentor.user_profiles?.last_name || 'N/A',
    location: mentor.location || 'N/A',
    strengths: mentor.strengths?.join(', ') || 'N/A',
    availabilityPreferences: mentor.availability_preferences || 'N/A',
    isAvailable: mentor.is_available ? 'Yes' : 'No',
    selectionsCount: getMentorSelectionCount(mentor.id)
  }));
};

// Supabase availability check
export const isSupabaseAvailable = async (): Promise<boolean> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // If offline mode is forced, return false
    if (DEV_CONFIG.FORCE_OFFLINE_MODE) {
      console.log('🔧 Force offline mode enabled');
      return false;
    }
    
    // Check if credentials are present and valid (not placeholder values)
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'your-project.supabase.co' || 
        supabaseAnonKey === 'your-anon-key-here' ||
        supabaseUrl === 'http://localhost:54321') {
      console.log('🔧 Missing or placeholder Supabase credentials - using offline mode');
      return false;
    }

    // For remote Supabase, just check if we have valid-looking credentials
    // Don't make HTTP calls that might cause 401 errors
    const isValidUrl = supabaseUrl.includes('.supabase.co');
    const isValidKey = supabaseAnonKey.startsWith('eyJ'); // JWT tokens start with eyJ
    
    if (isValidUrl && isValidKey) {
      console.log('✅ Valid Supabase credentials detected');
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('Supabase not available, using mock mode:', error);
    return false;
  }
}; 

// Función simple para arreglar el perfil de Maria directamente
export const fixMariaMentorProfile = () => {
  console.log('🔧 Fixing Maria\'s mentor profile...');
  
  // Primero verificar si existe
  let mariaIndex = DEV_CONFIG.MOCK_MENTORS.findIndex((mentor: any) => 
    mentor.user_profiles?.email === 'maria.achaga@bitso.com'
  );
  
  if (mariaIndex === -1) {
    // Si no existe, crear el mentor
    console.log('➕ Creating Maria\'s mentor profile...');
    const newMentor = {
      id: `mentor-maria-${Date.now()}`,
      user_id: `user-maria-${Date.now()}`,
      picture_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      location: 'Buenos Aires',
      strengths: ['execution', 'influence', 'organization', 'Effective presentations'],
      availability_preferences: 'Fridays please!',
      why_choose_me: 'Choose me as a mentor if you want to take your presentation skills to the next level!',
      booking_link: '',
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_profiles: {
        id: `user-maria-${Date.now()}`,
        email: 'maria.achaga@bitso.com',
        first_name: 'María',
        last_name: 'Achaga', 
        role: 'mentor' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    DEV_CONFIG.MOCK_MENTORS.push(newMentor);
    console.log('✅ Maria\'s mentor profile created!');
  } else {
    // Si existe, actualizar los nombres
    console.log('✏️ Updating Maria\'s existing mentor profile...');
    DEV_CONFIG.MOCK_MENTORS[mariaIndex].user_profiles.first_name = 'María';
    DEV_CONFIG.MOCK_MENTORS[mariaIndex].user_profiles.last_name = 'Achaga';
    DEV_CONFIG.MOCK_MENTORS[mariaIndex].updated_at = new Date().toISOString();
    console.log('✅ Maria\'s mentor profile updated!');
  }
  
  console.log('📊 Total mentors now:', DEV_CONFIG.MOCK_MENTORS.length);
  return true;
}; 

// Función para limpiar el perfil de mentor existente de Maria para que pueda empezar de nuevo
export const clearMariaMentorProfile = () => {
  console.log('🧹 Clearing existing Maria mentor profiles...');
  
  // Remove any existing mentors with Maria's email
  const originalLength = DEV_CONFIG.MOCK_MENTORS.length;
  DEV_CONFIG.MOCK_MENTORS = DEV_CONFIG.MOCK_MENTORS.filter((mentor: any) => 
    mentor.user_profiles?.email !== 'maria.achaga@bitso.com'
  );
  
  const removedCount = originalLength - DEV_CONFIG.MOCK_MENTORS.length;
  if (removedCount > 0) {
    console.log(`✅ Removed ${removedCount} existing mentor profiles for Maria`);
  } else {
    console.log('ℹ️ No existing mentor profiles found for Maria');
  }
  
  return removedCount;
}; 
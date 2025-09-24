import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { DEV_CONFIG, isSupabaseAvailable } from '../lib/devConfig';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isMentor: boolean;
  connectionError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithDemo: () => void;
  signOut: () => Promise<void>;
  clearAllData: () => void; // Add clearAllData method
  refreshProfile: () => Promise<void>;
  updateUserRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  createUserProfile: (user: User) => UserProfile;
  getUserProfile: (user: User) => UserProfile;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 Auth state changed:', { 
      user: user?.email || 'null', 
      userProfile: userProfile?.email || 'null', 
      loading 
    });
  }, [user, userProfile, loading]);

  const isAdmin = userProfile?.role === 'admin';
  const isMentor = userProfile?.role === 'mentor';

  // Create user profile based on email
  const createUserProfile = (user: User): UserProfile => {
    const email = user.email || '';
    let role: UserRole = 'user';
    
    // Admin assignment
    if (email === 'maria.achaga@bitso.com') {
      role = 'admin';
    }
    
    return {
      id: user.id,
      email: email,
      first_name: null,
      last_name: null,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  // Update user role (for when someone becomes a mentor)
  const updateUserRole = (role: UserRole) => {
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        role: role,
        updated_at: new Date().toISOString()
      };
      setUserProfile(updatedProfile);
      
      // Store in localStorage for persistence
      localStorage.setItem(`userProfile_${userProfile.id}`, JSON.stringify(updatedProfile));
    }
  };

  // Update user profile with partial updates
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        ...updates,
        updated_at: new Date().toISOString()
      };
      setUserProfile(updatedProfile);
      
      // Store in localStorage for persistence
      localStorage.setItem(`userProfile_${userProfile.id}`, JSON.stringify(updatedProfile));
    }
  };

  const refreshProfile = async () => {
    if (user) {
      // Try to get from localStorage first
      const storedProfile = localStorage.getItem(`userProfile_${user.id}`);
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        setUserProfile(profile);
      } else {
        const profile = createUserProfile(user);
        setUserProfile(profile);
        localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(profile));
      }
    }
  };

  const clearAllData = () => {
    console.log('🧹 Clearing all application data for fresh start...');
    
    // Clear all localStorage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Reset component states
    setUser(null);
    setUserProfile(null);
    setSession(null);
    setConnectionError(null);
    
    console.log('✅ All data cleared - fresh start ready');
  };

  const signInWithMock = () => {
    console.log('🎭 Signing in with mock user:', DEV_CONFIG.MOCK_USER.email);
    
    const mockUser = {
      id: DEV_CONFIG.MOCK_USER.id,
      email: DEV_CONFIG.MOCK_USER.email,
      user_metadata: DEV_CONFIG.MOCK_USER.user_metadata,
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    const mockProfile = {
      id: DEV_CONFIG.MOCK_USER.id,
      email: DEV_CONFIG.MOCK_USER.email,
      first_name: 'Maria',
      last_name: 'Achaga',
      role: DEV_CONFIG.MOCK_USER.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as UserProfile;

    setUser(mockUser);
    setUserProfile(mockProfile);
    setConnectionError(null);
    console.log('✅ Mock sign in completed for:', mockProfile.email, 'Role:', mockProfile.role);
  };

  const signInWithGoogle = async () => {
    try {
      setConnectionError(null);
      console.log('🚀 Starting Google OAuth sign in...');
      
      // Check if Google OAuth is properly configured
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      console.log('🔑 Google Client ID check:', googleClientId ? 'Present' : 'Missing');
      
      if (!googleClientId || googleClientId === 'your-google-client-id-here') {
        setConnectionError('Google OAuth not configured. Please contact administrator.');
        return;
      }
      
      // In offline mode, skip Supabase check and use mock authentication
      if (DEV_CONFIG.FORCE_OFFLINE_MODE) {
        console.log('🔧 Force offline mode - using mock authentication instead of Google OAuth');
        signInWithMock();
        return;
      }
      
      console.log('🌐 Calling Supabase OAuth with domain restriction: bitso.com');
      // Try Google OAuth - it can work independently of Supabase for domain verification
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            hd: 'bitso.com', // REQUIRED: Only allow @bitso.com domain
          },
          redirectTo: 'http://localhost:3000',
        },
      });

      if (error) {
        console.error('❌ Error signing in with Google:', error);
        setConnectionError('Authentication failed. Please try again with a @bitso.com email address.');
        throw error;
      } else {
        console.log('✅ OAuth redirect initiated successfully');
      }
    } catch (error) {
      console.error('💥 Error during Google sign in:', error);
      // Fallback to mock mode if all else fails
      if (DEV_CONFIG.ENABLE_MOCK_MODE) {
        console.warn('All authentication methods failed, using mock authentication');
        signInWithMock();
        return;
      }
      setConnectionError('Authentication failed. Please try again.');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out and clearing all data...');
      setConnectionError(null);
      
      // Try to sign out from Supabase, but don't fail if there's no session
      try {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== 'Auth session missing!') {
          console.error('Error signing out from Supabase:', error);
        }
      } catch (supabaseError: any) {
        // Ignore session missing errors - this is expected in our simplified auth
        if (!supabaseError.message?.includes('Auth session missing')) {
          console.error('Supabase sign out error:', supabaseError);
        }
      }
      
      // Clear ALL local state
      setUser(null);
      setUserProfile(null);
      setSession(null);
      
      // Clear ALL localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ Sign out completed - page will reload');
      
      // Force reload to ensure clean state
      setTimeout(() => window.location.reload(), 100);
      
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, clear everything and reload
      setUser(null);
      setUserProfile(null);
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => window.location.reload(), 100);
    }
  };

  useEffect(() => {
    // Initialize auth state handling
    const initializeAuth = async () => {
      // Check if we should use offline mode
      const useOfflineMode = DEV_CONFIG.FORCE_OFFLINE_MODE || !(await isSupabaseAvailable());
      
      if (useOfflineMode) {
        console.log('🔧 Using offline mode - skipping Supabase auth initialization');
        // Clear any existing auth state and localStorage for fresh login
        setUser(null);
        setUserProfile(null);
        setSession(null);
        setConnectionError(null);
        
        // Clear any persistent auth data in localStorage
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.startsWith('userProfile_') || 
          key.startsWith('supabase.') ||
          key.includes('auth')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        setLoading(false);
        return () => {}; // Return empty cleanup function
      }

      // Online mode - proceed with Supabase auth
      const getInitialSession = async () => {
        try {
          setConnectionError(null);
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            setConnectionError('Unable to connect to authentication service.');
          } else {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              // Try to get from localStorage first
              const storedProfile = localStorage.getItem(`userProfile_${session.user.id}`);
              if (storedProfile) {
                const profile = JSON.parse(storedProfile);
                setUserProfile(profile);
              } else {
                const profile = createUserProfile(session.user);
                setUserProfile(profile);
                localStorage.setItem(`userProfile_${session.user.id}`, JSON.stringify(profile));
              }
            }
          }
        } catch (error) {
          console.error('Connection error:', error);
          setConnectionError('Failed to initialize authentication.');
        } finally {
          setLoading(false);
        }
      };

      getInitialSession();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: any, session: any) => {
          try {
            setConnectionError(null);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              // Try to get from localStorage first
              const storedProfile = localStorage.getItem(`userProfile_${session.user.id}`);
              if (storedProfile) {
                const profile = JSON.parse(storedProfile);
                setUserProfile(profile);
              } else {
                const profile = createUserProfile(session.user);
                setUserProfile(profile);
                localStorage.setItem(`userProfile_${session.user.id}`, JSON.stringify(profile));
              }
            } else {
              setUserProfile(null);
            }
          } catch (error) {
            console.error('Auth state change error:', error);
            setConnectionError('Authentication error occurred.');
          } finally {
            setLoading(false);
          }
        }
      );

      return () => subscription.unsubscribe();
    };

    // Execute initialization and handle cleanup
    let cleanup: (() => void) | undefined;
    initializeAuth().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Validate Bitso email domain - temporarily disabled for testing
  // useEffect(() => {
  //   if (user && !user.email?.endsWith('@bitso.com')) {
  //     signOut();
  //     alert('Access restricted to @bitso.com email addresses only.');
  //   }
  // }, [user]);

  const value = {
    user,
    userProfile,
    session,
    loading,
    isAdmin,
    isMentor,
    signInWithGoogle,
    signInWithMock,
    signInWithDemo: signInWithMock, // Alias for backward compatibility
    signOut,
    clearAllData, // Add clearAllData to context
    connectionError,
    updateUserRole,
    updateUserProfile,
    createUserProfile,
    getUserProfile: createUserProfile, // Use same function for getUserProfile
    refreshProfile,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};
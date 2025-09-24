import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProfileView, ProfileViewConfig, ProfileViewOption, UserRole } from '../types';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  currentView: ProfileView;
  setCurrentView: (view: ProfileView) => void;
  availableViews: ProfileViewOption[];
  canAccessView: (view: ProfileView) => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

// Configuration for each role
const ROLE_CONFIGS: Record<UserRole, ProfileViewConfig> = {
  admin: {
    availableViews: ['admin', 'mentor', 'user'],
    defaultView: 'admin'
  },
  mentor: {
    availableViews: ['mentor', 'user'],
    defaultView: 'mentor'
  },
  user: {
    availableViews: ['user'],
    defaultView: 'user'
  }
};

// Profile view options with descriptions
const PROFILE_VIEW_OPTIONS: Record<ProfileView, ProfileViewOption> = {
  admin: {
    value: 'admin',
    label: 'Admin Dashboard',
    description: 'Manage platform, users, and mentors'
  },
  mentor: {
    value: 'mentor',
    label: 'Mentor Portal',
    description: 'Manage your mentoring profile and sessions'
  },
  user: {
    value: 'user',
    label: 'User Experience',
    description: 'Browse mentors and book sessions'
  }
};

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { userProfile } = useAuth();
  const userRole = userProfile?.role || 'user';
  
  // Get configuration for current user role
  const roleConfig = ROLE_CONFIGS[userRole];
  
  // Set initial view to default for the role
  const [currentView, setCurrentView] = useState<ProfileView>(roleConfig.defaultView);
  
  // Get available views for current role
  const availableViews = roleConfig.availableViews.map(view => PROFILE_VIEW_OPTIONS[view]);
  
  // Check if user can access a specific view
  const canAccessView = (view: ProfileView): boolean => {
    return roleConfig.availableViews.includes(view);
  };
  
  // Validate view change
  const handleSetCurrentView = (view: ProfileView) => {
    if (canAccessView(view)) {
      setCurrentView(view);
    } else {
      console.warn(`User with role ${userRole} cannot access view ${view}`);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        currentView,
        setCurrentView: handleSetCurrentView,
        availableViews,
        canAccessView,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}; 
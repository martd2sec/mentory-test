export interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  pictureUrl: string;
  strengths: string[];
  whyChooseMe: string;
  isAvailable: boolean;
  userId?: string; // ID of the mentor for authentication
  bookingLink?: string; // Calendly or similar booking link
}

export type StrengthOption = {
  value: string;
  label: string;
};

// User roles system
export type UserRole = 'admin' | 'mentor' | 'user';

// Profile views available to each role
export type ProfileView = 'admin' | 'mentor' | 'user';

// Configuration for profile views per role
export interface ProfileViewConfig {
  availableViews: ProfileView[];
  defaultView: ProfileView;
}

// Profile view option for dropdown
export interface ProfileViewOption {
  value: ProfileView;
  label: string;
  description: string;
}

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
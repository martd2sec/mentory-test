import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, Unlock, UserCheck, Users, MapPin, Clock } from 'lucide-react';
import { useMentorContext } from '../context/MentorContext';
import { useAuth } from '../context/AuthContext';
import { MentorProfile, UserProfile } from '../lib/supabase';
import { getMentorSelectionCount, isMentorAvailableForSelection, addMentorSelection, updateMentorProfileNames, updateMentorByEmail } from '../lib/devConfig';
import MentorSelectionModal from './MentorSelectionModal';

interface MentorCardProps {
  mentor: MentorProfile & { user_profiles?: UserProfile };
  showUnlockButton?: boolean;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, showUnlockButton = false }) => {
  const { unlockMentor, refreshMentors } = useMentorContext();
  const { user, userProfile, isAdmin, isMentor } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  const getMentorName = () => {
    console.log('🔍 Getting mentor name from:', mentor);
    console.log('👤 User profiles data:', mentor.user_profiles);
    
    // Try multiple ways to get the name
    const userProfile = mentor.user_profiles;
    
    if (userProfile?.first_name || userProfile?.last_name) {
      const firstName = userProfile.first_name || '';
      const lastName = userProfile.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      console.log('✅ Found name from user_profiles:', fullName);
      return fullName || 'Mentor';
    }
    
    // Fallback: try to extract from email
    if (userProfile?.email) {
      const emailName = userProfile.email.split('@')[0];
      const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      console.log('📧 Using email-based name:', formattedName);
      return formattedName;
    }
    
    console.log('❌ No name found, using fallback');
    return 'Mentor';
  };

  const handleChooseMentor = () => {
    if (!user) {
      alert('Please log in to choose a mentor.');
      return;
    }

    if (!isMentorAvailableForSelection(mentor.id)) {
      alert('This mentor is no longer available for selection.');
      return;
    }

    setShowSelectionModal(true);
  };

  const handleSelectionSubmit = async (firstName: string, lastName: string, workDescription: string, estimatedSessions: number) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      console.log('👤 Received form data:', { firstName, lastName, workDescription, estimatedSessions });
      
      // Create user profile with the provided names
      const menteeProfile = {
        id: user.id,
        email: userProfile?.email || user.email || 'unknown@example.com',
        first_name: firstName,
        last_name: lastName,
        role: userProfile?.role || 'user',
        created_at: userProfile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🎯 Created menteeProfile:', menteeProfile);
      
      // If the current user is also a mentor, update their mentor profile with the names
      if (isMentor) {
        console.log('🔄 User is also a mentor, updating mentor profile names...');
        const updated = updateMentorProfileNames(user.id, firstName, lastName);
        if (updated) {
          console.log('✅ Refreshing mentors to show updated names...');
          await refreshMentors();
        }
      }
      
      // Add the selection to our mock data
      addMentorSelection(mentor.id, user.id, workDescription, estimatedSessions, menteeProfile);
      
      setShowSelectionModal(false);
      setShowConfirmation(true);
      
      // Hide confirmation after 5 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error selecting mentor:', error);
      alert('Failed to select mentor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    try {
      setLoading(true);
      await unlockMentor(mentor.id);
    } catch (error) {
      console.error('Error unlocking mentor:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUnlock = showUnlockButton && (isAdmin || mentor.user_id === user?.id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden rounded-xl border
        ${
          mentor.is_available
            ? 'border-gray-700 bg-gray-800/50'
            : 'border-gray-700 bg-gray-800/20'
        }
        backdrop-blur-sm shadow-lg h-full
      `}
    >
      {!mentor.is_available && (
        <div className="absolute top-0 right-0 bg-red-600/90 text-white px-3 py-1 text-sm font-semibold z-10 rounded-bl-lg">
          Unavailable
        </div>
      )}

      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500 shadow-md">
            <img
              src={mentor.picture_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200'}
              alt={`${mentor.user_profiles?.first_name} ${mentor.user_profiles?.last_name}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {mentor.user_profiles?.first_name} {mentor.user_profiles?.last_name}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {mentor.strengths.map((strength) => (
                <span
                  key={strength}
                  className="px-2 py-1 text-xs rounded-full bg-purple-900/60 text-purple-200 border border-purple-700"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-gray-300 text-sm">
          <p>{mentor.why_choose_me}</p>
        </div>

        {/* Location and Availability Information */}
        <div className="mt-4 space-y-2">
          {mentor.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin size={14} />
              <span>{mentor.location}</span>
            </div>
          )}
          
          {mentor.availability_preferences && (
            <div className="flex items-start gap-2 text-sm text-gray-400">
              <Clock size={14} className="mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{mentor.availability_preferences}</span>
            </div>
          )}
        </div>

        {/* Selection count indicator */}
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 pt-2 border-t border-gray-700">
          <Users size={16} />
          <span>{getMentorSelectionCount(mentor.id)}/2 mentees selected</span>
        </div>

        <div className="mt-6 flex justify-between items-center">
          {isMentorAvailableForSelection(mentor.id) ? (
            <button
              onClick={handleChooseMentor}
              disabled={loading || !user}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition duration-300 shadow-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCheck size={16} />
              <span>{loading ? 'Selecting...' : 'Choose This Mentor'}</span>
            </button>
          ) : (
            <button
              className="flex items-center gap-2 bg-gray-700 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
              disabled
            >
              <Users size={16} />
              <span>Unavailable (2/2 selected)</span>
            </button>
          )}

          {!mentor.is_available && canUnlock && (
            <button
              onClick={handleUnlock}
              disabled={loading}
              className="flex items-center gap-2 bg-amber-700/60 hover:bg-amber-700/80 text-amber-200 px-4 py-2 rounded-lg transition duration-300 shadow-md disabled:opacity-50"
              title="Unlock Mentor"
            >
              <Unlock size={16} />
              <span>{loading ? 'Unlocking...' : 'Unlock'}</span>
            </button>
          )}
        </div>

        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-3 bg-emerald-900/40 border border-emerald-700 rounded-lg text-emerald-200 text-sm flex items-center gap-2"
          >
            <UserCheck size={16} />
            <span>Mentor selected successfully! Contact your mentor to schedule the first session.</span>
          </motion.div>
        )}
      </div>

      {/* Mentor Selection Modal */}
      <MentorSelectionModal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        mentorName={getMentorName()}
        onSubmit={handleSelectionSubmit}
        loading={loading}
      />
    </motion.div>
  );
};

export default MentorCard;
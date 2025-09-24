import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X, Upload, Edit3, Save, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Unlock, Lock, MessageSquare, Target, Trash2, UserCheck } from 'lucide-react';
import { useMentorContext } from '../context/MentorContext';
import { useAuth } from '../context/AuthContext';
import { strengthOptions } from '../data/mockData';
import { StrengthOption } from '../types';
import { supabase } from '../lib/supabase';
import { getMentorSelections, DEV_CONFIG, updateMentorByEmail, debugMentors, ensureMentorExists, fixMariaMentorProfile } from '../lib/devConfig';


interface MentorFormInputs {
  location: string;
  custom_skill: string;
  availability_preferences: string;
  why_choose_me: string;
}

const MentorProfile: React.FC = () => {
  const { updateMentor, getCurrentUserMentor, getMentorBookings, unlockMentor, refreshMentors } = useMentorContext();
  const { user, userProfile, updateUserRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [mentorSelections, setMentorSelections] = useState<any[]>([]);
  const [loadingSelections, setLoadingSelections] = useState(true);
  const [toggleAvailabilityLoading, setToggleAvailabilityLoading] = useState(false);
  const [confirmDeleteProfile, setConfirmDeleteProfile] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentMentor = getCurrentUserMentor();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MentorFormInputs>();

  useEffect(() => {
    if (currentMentor) {
      // Populate form with current mentor data
      setValue('location', currentMentor.location || '');
      setValue('custom_skill', ''); // This is always empty initially since it's just for adding new skills
      setValue('availability_preferences', currentMentor.availability_preferences || '');
      setValue('why_choose_me', currentMentor.why_choose_me || '');
      setSelectedStrengths(currentMentor.strengths || []);
      setCustomSkill('');
      setImagePreview(currentMentor.picture_url || null);
      
      // Fetch mentor selections
      fetchMentorSelections();
    }
  }, [currentMentor, setValue]);

  const fetchMentorSelections = async () => {
    if (!currentMentor) return;
    
    try {
      setLoadingSelections(true);
      const selections = getMentorSelections(currentMentor.id);
      setMentorSelections(selections);
    } catch (error) {
      console.error('Error fetching mentor selections:', error);
    } finally {
      setLoadingSelections(false);
    }
  };

  const toggleStrength = (value: string) => {
    if (selectedStrengths.includes(value)) {
      setSelectedStrengths(selectedStrengths.filter(s => s !== value));
    } else {
      setSelectedStrengths([...selectedStrengths, value]);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: MentorFormInputs) => {
    if (!currentMentor) return;
    
    // Combine selected strengths with custom skill
    let finalStrengths = [...selectedStrengths];
    if (data.custom_skill && data.custom_skill.trim()) {
      finalStrengths.push(data.custom_skill.trim());
    }
    
    // Provide clear feedback for validation failures
    if (finalStrengths.length === 0) {
      alert('Please select at least one area of expertise or add a custom skill');
      return;
    }

    if (!imagePreview) {
      alert('Please upload a profile picture');
      return;
    }

    try {
      setLoading(true);
      console.log('Updating mentor profile...');
      
      await updateMentor(currentMentor.id, {
        picture_url: imagePreview,
        location: data.location,
        strengths: finalStrengths,
        availability_preferences: data.availability_preferences,
        why_choose_me: data.why_choose_me,
        booking_link: '', // Keep empty for compatibility but not used
      });

      console.log('Mentor profile updated successfully');
      setIsEditing(false);
      setUpdateSuccess(true);
      setCustomSkill(''); // Reset custom skill after successful update
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating mentor profile:', error);
      alert('Failed to update mentor profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (currentMentor) {
      setValue('location', currentMentor.location || '');
      setValue('custom_skill', '');
      setValue('availability_preferences', currentMentor.availability_preferences || '');
      setValue('why_choose_me', currentMentor.why_choose_me || '');
      setSelectedStrengths(currentMentor.strengths || []);
      setCustomSkill('');
      setImagePreview(currentMentor.picture_url || null);
    }
  };

  const handleToggleAvailability = async () => {
    if (!currentMentor) return;

    try {
      setToggleAvailabilityLoading(true);
      console.log('🔄 Toggling mentor availability...');
      
      // Toggle availability - mentors can now mark themselves as unavailable or available
      const newAvailability = !currentMentor.is_available;
      console.log('📊 New availability status:', newAvailability);
      
      // Find mentor in mock data and update availability
      const mentorIndex = DEV_CONFIG.MOCK_MENTORS.findIndex((m: any) => m.id === currentMentor.id);
      if (mentorIndex === -1) {
        throw new Error('Mentor not found in mock data');
      }
      
      // Update availability in mock data
      DEV_CONFIG.MOCK_MENTORS[mentorIndex] = {
        ...DEV_CONFIG.MOCK_MENTORS[mentorIndex],
        is_available: newAvailability,
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Mentor availability updated in MOCK_MENTORS');
      
      // Refresh mentors list to reflect the change
      await refreshMentors();
      console.log('✅ Mentors list refreshed');
      
    } catch (error) {
      console.error('❌ Error toggling availability:', error);
      alert('Failed to update availability. Please try again.');
    } finally {
      setToggleAvailabilityLoading(false);
    }
  };

  const deleteMentorProfile = async () => {
    if (!currentMentor) return;
    
    if (!confirmDeleteProfile) {
      setConfirmDeleteProfile(true);
      return;
    }

    try {
      setDeletingProfile(true);
      console.log('🗑️ Deleting mentor profile completely...');
      
      // 1. Remove mentor from DEV_CONFIG.MOCK_MENTORS
      const mentorIndex = DEV_CONFIG.MOCK_MENTORS.findIndex(m => m.id === currentMentor.id);
      if (mentorIndex !== -1) {
        DEV_CONFIG.MOCK_MENTORS.splice(mentorIndex, 1);
        console.log('✅ Mentor removed from MOCK_MENTORS');
      }
      
      // 2. Remove any selections related to this mentor
      const selectionsToRemove = DEV_CONFIG.MOCK_SELECTIONS.filter(s => s.mentor_id === currentMentor.id);
      selectionsToRemove.forEach(selection => {
        const selectionIndex = DEV_CONFIG.MOCK_SELECTIONS.findIndex(s => s.id === selection.id);
        if (selectionIndex !== -1) {
          DEV_CONFIG.MOCK_SELECTIONS.splice(selectionIndex, 1);
        }
      });
      console.log('✅ Related selections removed');
      
      // 3. Clear ALL localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Storage cleared');
      
      // 4. Update user role back to 'user' 
      updateUserRole('user');
      console.log('✅ User role updated to user');
      
      // 5. Force complete application reset
      console.log('🔄 Forcing complete application reset...');
      
      // Refresh mentors to reflect the deletion immediately
      await refreshMentors();
      
      // Force page reload after a short delay
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error deleting mentor profile:', error);
      alert('Failed to delete mentor profile. Please try again.');
      setDeletingProfile(false);
      setConfirmDeleteProfile(false);
    }
  };


  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: <UserCheck className="h-4 w-4" />,
          text: 'Chose you as mentor',
          className: 'bg-blue-900/60 text-blue-200 border-blue-700/50',
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Completed',
          className: 'bg-green-900/60 text-green-200 border-green-700/50',
        };
      case 'cancelled':
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: 'Cancelled',
          className: 'bg-red-900/60 text-red-200 border-red-700/50',
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Unknown',
          className: 'bg-gray-900/60 text-gray-200 border-gray-700/50',
        };
    }
  };

  if (!user) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-gray-300">Please sign in to view your mentor profile.</p>
        </div>
      </section>
    );
  }

  if (!currentMentor) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-gray-300">You don't have a mentor profile yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >

          
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 mb-4">
            My Mentor Profile
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Manage your mentor information and keep your profile up to date.
          </p>
        </motion.div>

        <div id="mentor-profile" className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-lg">
          {updateSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-900/40 border border-emerald-700 text-white p-4 rounded-lg text-center mb-6"
            >
              <h3 className="text-lg font-semibold mb-2">Profile Updated Successfully!</h3>
              <p>Your mentor profile has been updated.</p>
            </motion.div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {currentMentor?.user_profiles?.first_name?.[0] || userProfile?.first_name?.[0] || userProfile?.email?.[0]?.toUpperCase() || 'M'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {currentMentor?.user_profiles?.first_name && currentMentor?.user_profiles?.last_name
                    ? `${currentMentor.user_profiles.first_name} ${currentMentor.user_profiles.last_name}`
                    : userProfile?.first_name && userProfile?.last_name 
                    ? `${userProfile.first_name} ${userProfile.last_name}`
                    : userProfile?.email?.split('@')[0] || 'Mentor'
                  }
                </h3>
                <p className="text-gray-400">{userProfile?.email}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  currentMentor.is_available 
                    ? 'bg-green-900/60 text-green-200' 
                    : 'bg-red-900/60 text-red-200'
                }`}>
                  {currentMentor.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
            
            {!isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleToggleAvailability}
                  disabled={toggleAvailabilityLoading}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors disabled:opacity-50 ${
                    currentMentor.is_available 
                      ? 'bg-red-700/60 hover:bg-red-700/80 text-red-200' 
                      : 'bg-green-700/60 hover:bg-green-700/80 text-green-200'
                  }`}
                  title={currentMentor.is_available ? 'Mark yourself as unavailable' : 'Mark yourself as available'}
                >
                  {currentMentor.is_available ? <Lock size={12} /> : <Unlock size={12} />}
                  <span>
                    {toggleAvailabilityLoading 
                      ? 'Updating...' 
                      : currentMentor.is_available 
                        ? 'Unavailable' 
                        : 'Available'
                    }
                  </span>
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      console.log('🔄 Fixing name display...');
                      
                      if (userProfile?.email === 'maria.achaga@bitso.com') {
                        // Use the specific fix for Maria
                        fixMariaMentorProfile();
                        alert('✅ Name fixed! The page will refresh.');
                      } else {
                        // For other users, prompt for names
                        const firstName = prompt('Enter your first name:', '');
                        if (!firstName) return;
                        
                        const lastName = prompt('Enter your last name:', '');
                        if (!lastName) return;
                        
                        const success = updateMentorByEmail(userProfile?.email || '', firstName.trim(), lastName.trim());
                        
                        if (success) {
                          alert('✅ Name updated successfully! The page will refresh.');
                        } else {
                          alert('❌ Failed to update name. Please try again.');
                        }
                      }
                      
                      // Force refresh everything
                      await refreshMentors();
                      
                      // Refresh the page to show all changes
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                      
                    } catch (error) {
                      console.error('Error updating name:', error);
                      alert('❌ Error updating name. Please try again.');
                    }
                  }}
                  className="flex items-center gap-1 bg-emerald-700/60 hover:bg-emerald-700/80 text-emerald-200 px-2 py-1 text-xs rounded-md transition-colors"
                >
                  <User size={12} />
                  <span>Fix Name</span>
                </button>
                
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-1 bg-blue-700/60 hover:bg-blue-700/80 text-blue-200 px-2 py-1 text-xs rounded-md transition-colors"
                >
                  <Edit3 size={12} />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={deleteMentorProfile}
                  disabled={deletingProfile}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors disabled:opacity-50 ${
                    confirmDeleteProfile 
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                      : 'bg-red-700/60 hover:bg-red-700/80'
                  } text-red-200`}
                >
                  <Trash2 size={12} />
                  <span>
                    {deletingProfile 
                      ? 'Deleting...' 
                      : confirmDeleteProfile 
                        ? 'Confirm Delete' 
                        : 'Delete Profile'
                    }
                  </span>
                </button>
                {confirmDeleteProfile && (
                  <button
                    onClick={() => setConfirmDeleteProfile(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Availability Status Info */}
          <div className={`mb-6 p-4 rounded-lg border ${
            currentMentor.is_available 
              ? 'bg-green-900/20 border-green-700/50' 
              : 'bg-red-900/20 border-red-700/50'
          }`}>
            <div className="flex items-center gap-3">
              {currentMentor.is_available ? (
                <>
                  <Unlock className="text-green-400" size={20} />
                  <div>
                    <h4 className="text-green-300 font-medium">Available for New Mentees</h4>
                    <p className="text-green-200/80 text-sm">Users can see your profile and select you as their mentor. You can mark yourself as unavailable if needed.</p>
                  </div>
                </>
              ) : (
                <>
                  <Lock className="text-red-400" size={20} />
                  <div>
                    <h4 className="text-red-300 font-medium">Currently Unavailable</h4>
                    <p className="text-red-200/80 text-sm">You appear as unavailable to users. Click "Mark Available" when you're ready to accept new mentees.</p>
                  </div>
                </>
              )}
            </div>
          </div>



          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Picture <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover rounded-full border-2 border-emerald-500 cursor-pointer"
                      onClick={handleImageClick}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={handleImageClick}
                    className="w-32 h-32 mx-auto border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors"
                  >
                    <div className="text-center">
                      <Upload size={24} className="mx-auto text-gray-400" />
                      <span className="text-sm text-gray-400 mt-2">Upload Photo</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Mexico City, Buenos Aires, Madrid..."
                  className={`w-full bg-gray-900 border ${
                    errors.location ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  {...register('location')}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Areas of Expertise <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {strengthOptions.map((option: StrengthOption) => (
                    <div 
                      key={option.value}
                      onClick={() => toggleStrength(option.value)}
                      className={`
                        flex items-center justify-between cursor-pointer p-2 rounded-lg text-sm
                        ${
                          selectedStrengths.includes(option.value)
                            ? 'bg-purple-700/70 border border-purple-500'
                            : 'bg-gray-900/80 border border-gray-700 hover:border-gray-600'
                        }
                        transition-all duration-200
                      `}
                    >
                      <span className="text-white">{option.label}</span>
                      {selectedStrengths.includes(option.value) && (
                        <X size={14} className="text-white" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="custom_skill" className="block text-sm font-medium text-gray-300 mb-1">
                  Additional Skill (Optional)
                </label>
                <input
                  id="custom_skill"
                  type="text"
                  placeholder="Add another skill not listed above..."
                  className={`w-full bg-gray-900 border ${
                    errors.custom_skill ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  {...register('custom_skill')}
                />
                <p className="mt-1 text-sm text-gray-400">This will be added to your areas of expertise</p>
                {errors.custom_skill && (
                  <p className="mt-1 text-sm text-red-400">{errors.custom_skill.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="why_choose_me" className="block text-sm font-medium text-gray-300 mb-1">
                  Why Choose Me as a Mentor <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="why_choose_me"
                  rows={4}
                  className={`w-full bg-gray-900 border ${
                    errors.why_choose_me ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="Share your experience and what makes you a great mentor..."
                  {...register('why_choose_me', {
                    required: 'Please explain why someone should choose you as a mentor',
                    minLength: { value: 50, message: 'Please provide at least 50 characters' }
                  })}
                ></textarea>
                {errors.why_choose_me && (
                  <p className="mt-1 text-sm text-red-400">{errors.why_choose_me.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="availability_preferences" className="block text-sm font-medium text-gray-300 mb-1">
                  Availability Preferences (Optional)
                </label>
                <textarea
                  id="availability_preferences"
                  rows={3}
                  className={`w-full bg-gray-900 border ${
                    errors.availability_preferences ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="e.g. Fridays afternoons, Mornings before 10am, Flexible schedule..."
                  {...register('availability_preferences')}
                />
                <p className="mt-1 text-sm text-gray-400">Let mentees know when you prefer to have sessions</p>
                {errors.availability_preferences && (
                  <p className="mt-1 text-sm text-red-400">{errors.availability_preferences.message}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-blue-600 transition duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4">
                  <img
                    src={currentMentor.picture_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300'}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full border-2 border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Location</h4>
                <p className="text-gray-300">
                  {currentMentor.location || 'Location not specified'}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Areas of Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {currentMentor.strengths?.map((strength, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-700/70 text-purple-200 rounded-full text-sm"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Why Choose Me</h4>
                <p className="text-gray-300 leading-relaxed">
                  {currentMentor.why_choose_me || 'No description provided'}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Availability Preferences</h4>
                <p className="text-gray-300 leading-relaxed">
                  {currentMentor.availability_preferences || 'No availability preferences specified'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sessions Section */}
        <div id="mentor-mentees" className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-lg mt-8">
          <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
            My Mentees
          </h3>
        </div>
        
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <p className="text-sm text-blue-200">
            <strong>ℹ️ Mentee Selections:</strong> When users choose you as their mentor, they'll appear here with their learning goals and estimated session needs.
          </p>
        </div>
          
          {loadingSelections ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
            </div>
          ) : mentorSelections.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-300 mb-2">No mentees yet</h4>
              <p className="text-gray-400">
                When users choose you as their mentor, they'll appear here with their learning goals.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mentorSelections.map((selection, index) => {
                const statusInfo = getStatusInfo(selection.status);
                const menteeName = `${selection.user_profiles?.first_name || ''} ${selection.user_profiles?.last_name || ''}`.trim() 
                  || selection.user_profiles?.email || 'Unknown User';

                return (
                  <motion.div
                    key={selection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-white truncate">{menteeName}</h4>
                          <p className="text-sm text-gray-400 truncate">
                            {selection.user_profiles?.email}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs whitespace-nowrap flex-shrink-0 ml-2 ${statusInfo.className}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.text}</span>
                      </div>
                    </div>

                              <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Selected: {new Date(selection.selected_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Target className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Estimated Sessions: {selection.estimated_sessions}</span>
            </div>

            {selection.status === 'active' && (
              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <p className="text-xs text-blue-300 font-medium flex items-center gap-1">
                  <MessageSquare size={12} />
                  Next Step:
                </p>
                <p className="text-sm text-blue-200 mt-1">Get in contact to schedule your first session together</p>
              </div>
            )}
            
            {selection.work_description && (
              <div className="mt-3 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
                <p className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-1">
                  <MessageSquare size={12} />
                  What they want to work on:
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">"{selection.work_description}"</p>
              </div>
            )}
          </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MentorProfile; 
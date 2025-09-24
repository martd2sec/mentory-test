import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { useMentorContext } from '../context/MentorContext';
import { useAuth } from '../context/AuthContext';
import { strengthOptions } from '../data/mockData';
import { StrengthOption } from '../types';

interface MentorFormInputs {
  first_name: string;
  last_name: string;
  location: string;
  custom_skill: string;
  availability_preferences: string;
  why_choose_me: string;
}

const MentorForm: React.FC = () => {
  const { addMentor } = useMentorContext();
  const { user, userProfile, updateUserRole, updateUserProfile } = useAuth();
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MentorFormInputs>();

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
    // Provide clear feedback for validation failures
    if (selectedStrengths.length === 0) {
      alert('Please select at least one area of expertise');
      return;
    }

    if (!imagePreview) {
      alert('Please upload a profile picture');
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting mentor application...');
      
      // Update user profile with names
      updateUserProfile({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim()
      });
      
      // Combine selected strengths with custom skill if provided
      let allStrengths = [...selectedStrengths];
      if (data.custom_skill.trim()) {
        allStrengths.push(data.custom_skill.trim());
      }
      
      await addMentor({
        picture_url: imagePreview,
        strengths: allStrengths,
        location: data.location || '',
        availability_preferences: data.availability_preferences || '',
        why_choose_me: data.why_choose_me,
        booking_link: '', // No longer used
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
      });

      console.log('Mentor application submitted successfully');

      // Update user role to mentor
      updateUserRole('mentor');
      console.log('User role updated to mentor');

      // Reset form and show success message
      reset();
      setSelectedStrengths([]);
      setCustomSkill('');
      setImagePreview(null);
      setFormSubmitted(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting mentor application:', error);
      alert('Failed to submit mentor application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-gray-300">Please sign in to become a mentor.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="become-mentor" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Become a Mentor
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Share your expertise with others in our community. Fill out the form below to join our pool of mentors.
        </p>
      </motion.div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
        {formSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-900/40 border border-emerald-700 text-white p-4 rounded-lg text-center"
          >
            <h3 className="text-xl font-semibold mb-2">Thank you for becoming a mentor!</h3>
            <p>Your profile has been added to our mentor pool and your role has been updated.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                Applying as: <span className="font-medium text-white">
                  {userProfile?.first_name || userProfile?.email?.split('@')[0] || 'User'}
                </span>
              </p>
              <p className="text-gray-400 text-xs">{userProfile?.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="first_name"
                  type="text"
                  className={`w-full bg-gray-900 border ${
                    errors.first_name ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="Your first name"
                  {...register('first_name', { required: 'First name is required' })}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="last_name"
                  type="text"
                  className={`w-full bg-gray-900 border ${
                    errors.last_name ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="Your last name"
                  {...register('last_name', { required: 'Last name is required' })}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.last_name.message}</p>
                )}
              </div>
            </div>

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
              {!imagePreview && (
                <p className="mt-1 text-sm text-red-400 text-center">Profile picture is required</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                className={`w-full bg-gray-900 border ${
                  errors.location ? 'border-red-500' : 'border-gray-700'
                } rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                placeholder="e.g. Mexico City, Buenos Aires, Madrid..."
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
              {selectedStrengths.length === 0 && (
                <p className="mt-1 text-sm text-red-400">Please select at least one area of expertise</p>
              )}
            </div>

            <div>
              <label htmlFor="custom_skill" className="block text-sm font-medium text-gray-300 mb-1">
                Additional Skill (Optional)
              </label>
              <input
                id="custom_skill"
                type="text"
                className={`w-full bg-gray-900 border ${
                  errors.custom_skill ? 'border-red-500' : 'border-gray-700'
                } rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                placeholder="Add another skill not listed above..."
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
                placeholder="Tell us about your experience and what makes you a great mentor..."
                {...register('why_choose_me', { 
                  required: 'This field is required',
                  minLength: {
                    value: 50,
                    message: 'Please provide at least 50 characters'
                  }
                })}
              />
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default MentorForm;
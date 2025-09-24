import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MessageSquare, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEV_CONFIG } from '../lib/devConfig';

interface UserSelectionsProps {
  onNavigateHome: () => void;
}

interface SelectionWithDetails {
  id: string;
  mentor_id: string;
  selected_by: string;
  selected_at: string;
  status: 'active' | 'completed' | 'cancelled';
  work_description: string;
  estimated_sessions: number;
  created_at: string;
  updated_at: string;
  mentors: {
    id: string;
    user_id: string;
    picture_url?: string;
    strengths: string[];
    why_choose_me?: string;
    is_available: boolean;
    created_at: string;
    updated_at: string;
    booking_link: string;
    user_profiles: {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      role: 'admin' | 'mentor' | 'user';
      created_at: string;
      updated_at: string;
    };
  };
}

const UserSelections: React.FC<UserSelectionsProps> = ({ onNavigateHome }) => {
  const { user } = useAuth();
  const [selections, setSelections] = useState<SelectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserSelections();
    }
  }, [user]);

  const fetchUserSelections = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching selections for user:', user?.id);
      
      // Filter mock selections for current user
      const userSelections = DEV_CONFIG.MOCK_SELECTIONS.filter(selection => 
        selection.selected_by === user?.id
      );
      
      setSelections(userSelections as SelectionWithDetails[]);
      console.log('📋 Loaded mock selections:', userSelections);
      console.log('📊 Number of selections found:', userSelections.length);
    } catch (error) {
      console.error('Error fetching user selections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMentorName = (mentor: any) => {
    const userProfile = mentor?.user_profiles;
    
    if (userProfile?.first_name || userProfile?.last_name) {
      const firstName = userProfile.first_name || '';
      const lastName = userProfile.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Mentor';
    }
    
    if (userProfile?.email) {
      const emailName = userProfile.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return 'Mentor';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your mentor selections...</div>
      </div>
    );
  }

  return (
    <div id="user-selections" className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">My Mentor Selections</h1>
          <p className="text-gray-400">Manage your chosen mentors and learning goals</p>
        </motion.div>

        {/* Selections List */}
        <div className="space-y-6">
          {selections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="mb-4">
                <User size={48} className="mx-auto text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Mentors Selected Yet</h3>
              <p className="text-gray-400 mb-6">
                Browse our mentors and choose the ones that match your learning goals.
              </p>
              <button
                onClick={onNavigateHome}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Mentors
              </button>
            </motion.div>
          ) : (
            selections.map((selection, index) => (
              <motion.div
                key={selection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Mentor Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={selection.mentors?.picture_url || 'https://via.placeholder.com/80'}
                      alt={getMentorName(selection.mentors)}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                    />
                  </div>

                  {/* Selection Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {getMentorName(selection.mentors)}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Selected on {formatDate(selection.selected_at)}
                        </p>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selection.status === 'active' 
                          ? 'bg-green-900/40 text-green-400 border border-green-700'
                          : selection.status === 'completed'
                          ? 'bg-blue-900/40 text-blue-400 border border-blue-700'
                          : 'bg-red-900/40 text-red-400 border border-red-700'
                      }`}>
                        {selection.status.charAt(0).toUpperCase() + selection.status.slice(1)}
                      </span>
                    </div>

                    {/* Mentor Strengths */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {selection.mentors?.strengths?.map((strength, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-900/40 text-blue-300 rounded text-sm border border-blue-700"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Work Description */}
                    <div className="mb-4">
                      <div className="flex items-start gap-2 mb-2">
                        <MessageSquare size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-300">What you want to work on:</p>
                          <p className="text-gray-300 mt-1">{selection.work_description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Estimated Sessions */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={16} />
                      <span>Estimated sessions: {selection.estimated_sessions}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSelections; 
import React, { useState } from 'react';
import { LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileSelector from './ProfileSelector';
import BitsoLogo from './BitsoLogo';
import FeedbackModal from './FeedbackModal';

const Header: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-6">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center">
            <BitsoLogo size={80} className="text-emerald-400 mr-4" />
            <div className="flex items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
                Growth at Bitso
              </h1>
              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                title="Give program feedback"
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">Feedback</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Profile Selector */}
            <ProfileSelector />

            {/* User Info */}
            {user && userProfile && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">
                    {userProfile.first_name || userProfile.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-300 capitalize">
                    {userProfile.role}
                  </p>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
      />
    </>
  );
};

export default Header;
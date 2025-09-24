import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MentorProvider } from './context/MentorContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { BookingModalProvider } from './context/BookingModalContext';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Introduction from './components/Introduction';
import MentorIntroduction from './components/MentorIntroduction';
import BestPractices from './components/BestPractices';
import RulesAndFAQ from './components/RulesAndFAQ';
import MentorForm from './components/MentorForm';
import MentorGrid from './components/MentorGrid';
import AdminDashboard from './components/AdminDashboard';
import UserSelections from './components/UserSelections';
import MentorProfile from './components/MentorProfile';
import ConnectionStatus from './components/ConnectionStatus';
import GlobalBookingModal from './components/GlobalBookingModal';


const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { currentView } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <ConnectionStatus />
        <LoginPage />
      </>
    );
  }

  // Render content based on current profile view
  const renderContent = () => {
    switch (currentView) {
      case 'admin':
        return <AdminDashboard />;
      
      case 'mentor':
        return (
          <>
            <MentorIntroduction />
            <MentorProfile />
            <BestPractices />
          </>
        );
      
      case 'user':
      default:
        return (
          <>
            <Introduction />
            <MentorGrid />
            <RulesAndFAQ />
            <MentorForm />
            <UserSelections onNavigateHome={() => {}} />
          </>
        );
    }
  };

  return (
    <MentorProvider>
      <BookingModalProvider>
        <div className="min-h-screen flex flex-col">
          <ConnectionStatus />
          <Header />
          
          <main className="flex-grow">
            {renderContent()}
          </main>
          
          <footer className="py-6 px-4 bg-gray-900/80 border-t border-gray-800">
            <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} Growth at Bitso - Mentorship Program. All rights reserved.</p>
            </div>
          </footer>
        </div>
        
        {/* Global Booking Modal */}
        <GlobalBookingModal />
      </BookingModalProvider>
    </MentorProvider>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <Routes>

            <Route path="*" element={<AppContent />} />
          </Routes>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
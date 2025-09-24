import React from 'react';
import { AcademicCapIcon, UserGroupIcon, UsersIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const MentorIntroduction: React.FC = () => {
  const handleUpdateProfile = () => {
    const profileSection = document.getElementById('mentor-profile');
    if (profileSection) {
      profileSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleViewMentees = () => {
    const menteesSection = document.getElementById('mentor-mentees');
    if (menteesSection) {
      menteesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleViewBestPractices = () => {
    const bestPracticesSection = document.getElementById('best-practices');
    if (bestPracticesSection) {
      bestPracticesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-6">
            <AcademicCapIcon className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Welcome to Your <span className="text-blue-400">Mentor Portal</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Manage your mentoring profile, connect with your mentees, and help shape the next generation of talent at Bitso.
          </p>
        </div>

        {/* Features Grid - Now with 3 sections */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
          <button
            onClick={handleUpdateProfile}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group text-left"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-6 group-hover:bg-blue-500/30 transition-colors">
              <UserGroupIcon className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Manage Your Profile</h3>
            <p className="text-gray-300 leading-relaxed">
              Keep your mentoring profile up to date with your latest expertise, availability, and areas of specialization.
            </p>
          </button>

          <button
            onClick={handleViewMentees}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group text-left"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mb-6 group-hover:bg-purple-500/30 transition-colors">
              <UsersIcon className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">View My Mentees</h3>
            <p className="text-gray-300 leading-relaxed">
              See who has chosen you as their mentor, review their learning goals, and track your mentoring relationships.
            </p>
          </button>

          <button
            onClick={handleViewBestPractices}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group text-left"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/20 rounded-lg mb-6 group-hover:bg-emerald-500/30 transition-colors">
              <BookOpenIcon className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Best Practices</h3>
            <p className="text-gray-300 leading-relaxed">
              Learn proven strategies and techniques to become an effective mentor and create meaningful impact.
            </p>
          </button>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-800/80 to-blue-900/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Make an Impact?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Your expertise and guidance can shape careers and drive innovation. Start by updating your profile or connecting with your mentees.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorIntroduction; 
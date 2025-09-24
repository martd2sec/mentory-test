import React from 'react';
import { Sparkles, Users, Lightbulb, ArrowRight, Calendar, BookOpen, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Introduction: React.FC = () => {

  const handleBecomeMentor = () => {
    const mentorFormSection = document.getElementById('become-mentor');
    if (mentorFormSection) {
      mentorFormSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleViewMentorSelections = () => {
    // Scroll to the user selections section
    const userSelectionsElement = document.getElementById('user-selections');
    if (userSelectionsElement) {
      userSelectionsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  const handleViewRulesAndFAQ = () => {
    const rulesSection = document.getElementById('rules-and-faq');
    if (rulesSection) {
      rulesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 mb-6">
          Elevate Your Career
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Connect with experienced mentors at Bitso and accelerate your professional growth. 
          Get personalized guidance and build the skills you need to succeed 
          based on your specific needs.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 mt-12 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <div className="p-3 bg-purple-900/40 inline-block rounded-lg mb-4">
            <Sparkles size={24} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Specialized Expertise
          </h3>
          <p className="text-gray-300">
            Connect with mentors who offer expertise in technical and soft skills. Choose a mentor based on your specific needs.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <div className="p-3 bg-blue-900/40 inline-block rounded-lg mb-4">
            <Users size={24} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            One-on-One Sessions
          </h3>
          <p className="text-gray-300">
            Book personalized mentorship sessions to get direct feedback
            and insights tailored to your specific goals and challenges.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <div className="p-3 bg-emerald-900/40 inline-block rounded-lg mb-4">
            <Lightbulb size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Become a Mentor
          </h3>
          <p className="text-gray-300">
            Share your knowledge and experience with others. Becoming a mentor
            helps you refine your own skills and build leadership experience.
          </p>
        </motion.div>
      </div>

      {/* Call to Action Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          Ready to Start?
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Choose your path and take the next step in your professional growth journey
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex flex-col md:flex-row gap-6 justify-center"
      >
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onClick={handleBecomeMentor}
          className="inline-flex items-center gap-3 bg-gray-900/20 backdrop-blur-sm border-2 border-emerald-500 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Lightbulb size={24} />
          <span className="text-lg">Become a Mentor</span>
          <ArrowRight size={20} />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={handleViewMentorSelections}
          className="inline-flex items-center gap-3 bg-gray-900/20 backdrop-blur-sm border-2 border-blue-500 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Calendar size={24} />
          <span className="text-lg">My Mentor Selections</span>
          <ArrowRight size={20} />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          onClick={handleViewRulesAndFAQ}
          className="inline-flex items-center gap-3 bg-gray-900/20 backdrop-blur-sm border-2 border-teal-500 hover:bg-teal-500/10 text-teal-400 hover:text-teal-300 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <BookOpen size={24} />
          <span className="text-lg">Program Rules & FAQ</span>
          <ArrowRight size={20} />
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Introduction;
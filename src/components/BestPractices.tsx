import React from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon, LightBulbIcon, UserGroupIcon, ChatBubbleBottomCenterTextIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const BestPractices: React.FC = () => {
  const practices = [
    {
      icon: <UserGroupIcon className="h-6 w-6" />,
      title: "Set Clear Expectations",
      description: "Begin each mentoring relationship by discussing goals, expectations, and boundaries. Define what success looks like for both parties.",
      tips: [
        "Establish meeting frequency and duration",
        "Discuss communication preferences",
        "Set measurable goals and milestones"
      ]
    },
    {
      icon: <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />,
      title: "Active Listening",
      description: "Practice active listening to understand your mentee's challenges, concerns, and aspirations. Ask open-ended questions to encourage deeper reflection.",
      tips: [
        "Ask 'What' and 'How' questions",
        "Reflect back what you hear",
        "Avoid interrupting or rushing to solutions"
      ]
    },
    {
      icon: <LightBulbIcon className="h-6 w-6" />,
      title: "Guide, Don't Solve",
      description: "Resist the urge to immediately provide solutions. Instead, guide your mentee through the problem-solving process to build their critical thinking skills.",
      tips: [
        "Ask 'What do you think you should do?'",
        "Encourage experimentation and learning from mistakes"
      ]
    },
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: "Be Consistent & Reliable",
      description: "Maintain regular communication and follow through on commitments. Consistency builds trust and shows your investment in the relationship.",
      tips: [
        "Keep scheduled meetings",
        "Follow up on previous conversations",
        "Be transparent about your availability"
      ]
    },
    {
      icon: <CheckCircleIcon className="h-6 w-6" />,
      title: "Provide Constructive Feedback",
      description: "Offer specific, actionable feedback that helps your mentee grow. Focus on behaviors and outcomes rather than personality traits.",
      tips: [
        "Use the SBI model (Situation, Behavior, Impact)",
        "Balance constructive feedback with positive reinforcement",
        "Focus on one or two key areas for improvement"
      ]
    },
    {
      icon: <BookOpenIcon className="h-6 w-6" />,
      title: "Share Resources & Network",
      description: "Leverage your experience and network to provide valuable resources, connections, and opportunities for your mentee's growth.",
      tips: [
        "Recommend relevant books, articles, or courses",
        "Make strategic introductions when appropriate",
        "Share your own learning experiences and failures"
      ]
    }
  ];

  return (
    <section id="best-practices" className="py-20 px-4 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-6">
            <BookOpenIcon className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Mentoring <span className="text-emerald-400">Best Practices</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Proven strategies and techniques to help you become an effective mentor and create meaningful impact in your mentee's professional journey.
          </p>
        </motion.div>

        {/* Best Practices Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {practices.map((practice, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/20 rounded-lg mb-6 text-emerald-400">
                {practice.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-4">
                {practice.title}
              </h3>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                {practice.description}
              </p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-emerald-400 mb-3">Key Tips:</h4>
                {practice.tips.map((tip, tipIndex) => (
                  <div key={tipIndex} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-300">{tip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Apply These Practices?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Remember, great mentoring is a skill that develops over time. Start with one or two practices and gradually incorporate more as you grow in your mentoring journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-200"
              >
                Back to Top
              </button>
              <button 
                onClick={() => document.getElementById('mentor-profile')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 border border-gray-600"
              >
                Update My Profile
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BestPractices; 
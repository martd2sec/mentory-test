import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    question: "How does the mentorship program work?",
    answer: "Elevate 2.0 is our mentorship program that connects you with experienced Bitsonauts in your field of interest. You can browse available mentors, view their strengths and expertise, and book a one-on-one session when you find someone who matches your needs."
  },
  {
    question: "How long are mentorship sessions?",
    answer: "Standard mentorship sessions are 45 minutes long. This allows enough time for meaningful discussion while respecting everyone's busy schedules."
  },
  {
    question: "Can I reschedule or cancel a booked session?",
    answer: "Yes, you can reschedule or cancel a session up to 24 hours before the scheduled time. Please be respectful of your mentor's time and avoid last-minute cancellations."
  },
  {
    question: "How do I become a mentor?",
    answer: "Fill out the 'Become a Mentor' form with your information and areas of expertise. Our team will review your application and add you to our mentor pool if approved."
  },
  {
    question: "Is there a limit to how many sessions I can book?",
    answer: "We recommend booking no more than one session per week to allow time for implementing the advice and feedback you receive. This also ensures equitable access to mentors for all team members."
  }
];

const programRules = [
  "Mentors and mentees must be respectful and professional at all times.",
  "Be on time for scheduled sessions. If you need to reschedule, provide at least 24 hours notice.",
  "Come prepared with specific questions or topics you'd like to discuss.",
  "Mentors should focus on providing guidance, not solutions or direct work contributions.",
  "Feedback should be constructive, specific, and actionable.",
  "Respect confidentiality. Discussions between mentors and mentees should remain private.",
  "The program is meant for professional development, not for resolving workplace conflicts.",
  "Both mentors and mentees should set clear expectations at the beginning of their relationship."
];

const Accordion: React.FC<{ item: FAQItem; index: number }> = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 border-b border-gray-700 pb-4">
      <button
        className="flex justify-between items-center w-full text-left py-2 text-white focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium">{item.question}</span>
        <span className="ml-2">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-emerald-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-emerald-400" />
          )}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="py-3 text-gray-300">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RulesAndFAQ: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'faq'>('faq');

  return (
    <section id="rules-and-faq" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        Program Rules & FAQ
      </h2>

      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'faq'
                ? 'bg-purple-900/70 text-white'
                : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            Frequently Asked Questions
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'rules'
                ? 'bg-purple-900/70 text-white'
                : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            Program Rules
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg max-w-3xl mx-auto">
        {activeTab === 'faq' ? (
          <div>
            {faqItems.map((item, index) => (
              <Accordion key={index} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-gray-300">
            <h3 className="text-xl font-semibold text-white mb-4">Mentorship Program Rules</h3>
            <ul className="list-disc pl-5 space-y-2">
              {programRules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default RulesAndFAQ;
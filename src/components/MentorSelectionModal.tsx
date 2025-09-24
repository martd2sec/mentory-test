import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, MessageSquare, Clock, User, Send } from 'lucide-react';

interface MentorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  onSubmit: (firstName: string, lastName: string, workDescription: string, estimatedSessions: number) => void;
  loading?: boolean;
}

const MentorSelectionModal: React.FC<MentorSelectionModalProps> = ({
  isOpen,
  onClose,
  mentorName,
  onSubmit,
  loading = false
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [estimatedSessions, setEstimatedSessions] = useState(2);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      alert('Please enter your first name.');
      return;
    }

    if (!lastName.trim()) {
      alert('Please enter your last name.');
      return;
    }

    if (!workDescription.trim()) {
      alert('Please describe what you want to work on with this mentor.');
      return;
    }

    if (estimatedSessions < 1 || estimatedSessions > 10) {
      alert('Please select between 1 and 10 sessions.');
      return;
    }

    onSubmit(firstName.trim(), lastName.trim(), workDescription.trim(), estimatedSessions);
    setSubmitted(true);
    
    // Auto close after 2 seconds
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    if (!loading) {
      setFirstName('');
      setLastName('');
      setWorkDescription('');
      setEstimatedSessions(2);
      setSubmitted(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Choose Mentor</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Mentor Selected!</h3>
            <p className="text-gray-300">You have successfully chosen {mentorName} as your mentor.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Selecting:</strong> {mentorName}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  disabled={loading}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  disabled={loading}
                  maxLength={50}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What do you want to work on? <span className="text-red-400">*</span>
              </label>
              <textarea
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Describe specifically what you want to learn or work on with this mentor. Be as detailed as possible..."
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                disabled={loading}
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Be specific about your learning goals</p>
                <p className="text-xs text-gray-500">{workDescription.length}/500</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                How many sessions do you think you'll need?
              </label>
              <select
                value={estimatedSessions}
                onChange={(e) => setEstimatedSessions(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} session{num !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">This is just an estimate to help plan</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !firstName.trim() || !lastName.trim() || !workDescription.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Selecting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Choose This Mentor</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );

  // Render the modal using a portal to escape the MentorCard container
  return createPortal(modalContent, document.body);
};

export default MentorSelectionModal; 
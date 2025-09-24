import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createFeedback } from '../lib/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [whatYouLike, setWhatYouLike] = useState('');
  const [constructiveFeedback, setConstructiveFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || (!whatYouLike.trim() && !constructiveFeedback.trim())) {
      alert('Please provide a rating and at least one feedback comment');
      return;
    }

    if (!user || !userProfile) {
      alert('You must be authenticated to submit feedback');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedbackText = `What I like most: ${whatYouLike.trim()}\n\nConstructive feedback: ${constructiveFeedback.trim()}`;
      
      const feedbackData = {
        user_id: user.id,
        user_email: userProfile.email,
        rating,
        category: 'general',
        feedback_text: feedbackText,
      };

      await createFeedback(feedbackData);
      
      console.log('Feedback submitted successfully:', feedbackData);
      setSubmitted(true);
      
      // Reset form after showing success message
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setWhatYouLike('');
        setConstructiveFeedback('');
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Program Feedback</h2>
          </div>
          <button
            onClick={onClose}
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
              <Star className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Thank you for your feedback!</h3>
            <p className="text-gray-300">Your input is valuable for improving the program.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Overall Rating <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What do you like the most about the program?
              </label>
              <textarea
                value={whatYouLike}
                onChange={(e) => setWhatYouLike(e.target.value)}
                placeholder="Tell us what you enjoy most about the mentorship program..."
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Constructive Feedback
              </label>
              <textarea
                value={constructiveFeedback}
                onChange={(e) => setConstructiveFeedback(e.target.value)}
                placeholder="How can we improve the program? Any suggestions?"
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !rating || (!whatYouLike.trim() && !constructiveFeedback.trim())}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default FeedbackModal; 
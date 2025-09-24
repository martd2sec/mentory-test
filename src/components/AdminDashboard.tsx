import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, UserCheck, Eye, EyeOff, Trash2, Download, MessageSquare, Star, Mail, Calendar, Award, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEV_CONFIG, isSupabaseAvailable, getAllMentees, getMenteesThisMonth, getExportMenteesData, getExportMentorsData, getMentorSelectionCount } from '../lib/devConfig';

interface SimplifiedDashboardStats {
  totalMentees: number;
  newMenteesThisMonth: number;
  totalMentors: number;
  availableMentors: number;
  topPerformingMentors: Array<{
    mentorName: string;
    mentorEmail: string;
    selectionsCount: number;
  }>;
}

interface FeedbackStats {
  totalFeedback: number;
  averageRating: string;
  categoryBreakdown: Record<string, number>;
}

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [mentors, setMentors] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    averageRating: '0',
    categoryBreakdown: {},
  });
  const [stats, setStats] = useState<SimplifiedDashboardStats>({
    totalMentees: 0,
    newMenteesThisMonth: 0,
    totalMentors: 0,
    availableMentors: 0,
    topPerformingMentors: [],
  });
  const [loading, setLoading] = useState(true);
  const [deletingMentorId, setDeletingMentorId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get mentors and feedback data
      const mentorsData = DEV_CONFIG.MOCK_MENTORS;
      const feedbackData = DEV_CONFIG.MOCK_FEEDBACK;
      
      setMentors(mentorsData);
      setFeedback(feedbackData);
      
      // Calculate simplified stats
      const totalMentees = getAllMentees().length;
      const newMenteesThisMonth = getMenteesThisMonth().length;
      const totalMentors = mentorsData.length;
      const availableMentors = mentorsData.filter((mentor: any) => mentor.is_available).length;
      
      // Calculate top performing mentors
      const topPerformingMentors = mentorsData.map((mentor: any) => ({
        mentorName: mentor.user_profiles?.first_name + ' ' + mentor.user_profiles?.last_name || 'N/A',
        mentorEmail: mentor.user_profiles?.email || 'N/A', 
        selectionsCount: getMentorSelectionCount(mentor.id)
      })).sort((a, b) => b.selectionsCount - a.selectionsCount).slice(0, 5);
      
      setStats({
        totalMentees,
        newMenteesThisMonth,
        totalMentors,
        availableMentors,
        topPerformingMentors
      });
      
      // Calculate feedback stats
      const totalFeedback = feedbackData.length;
      const averageRating = totalFeedback > 0 
        ? (feedbackData.reduce((sum: number, fb: any) => sum + fb.rating, 0) / totalFeedback).toFixed(1)
        : '0';
        
      const categoryBreakdown = feedbackData.reduce((acc: any, fb: any) => {
        acc[fb.category] = (acc[fb.category] || 0) + 1;
        return acc;
      }, {});
      
      setFeedbackStats({
        totalFeedback,
        averageRating,
        categoryBreakdown
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportMenteesData = () => {
    const data = getExportMenteesData();
    const csvContent = [
      ['Mentee Email', 'Mentor Name', 'Selected At', 'Work Description', 'Estimated Sessions'].join(','),
      ...data.map(row => [
        row.email,
        row.mentorName,
        new Date(row.selectedAt).toLocaleDateString(),
        `"${row.workDescription.replace(/"/g, '""')}"`,
        row.estimatedSessions
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mentees_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportMentorsData = () => {
    const data = getExportMentorsData();
    const csvContent = [
      ['Mentor Email', 'Mentor Name', 'Location', 'Strengths', 'Availability Preferences', 'Available', 'Selections Count'].join(','),
      ...data.map(row => [
        row.email,
        row.name,
        `"${row.location}"`,
        `"${row.strengths}"`,
        `"${row.availabilityPreferences}"`,
        row.isAvailable,
        row.selectionsCount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mentors_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportFeedbackData = () => {
    const csvContent = [
      ['User Email', 'Rating', 'Category', 'Feedback Text', 'Submitted Date'].join(','),
      ...feedback.map(fb => [
        fb.user_email || 'N/A',
        fb.rating || 0,
        `"${fb.category || 'general'}"`,
        `"${(fb.feedback_text || '').replace(/"/g, '""')}"`,
        fb.created_at ? new Date(fb.created_at).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `feedback_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportMetricsData = () => {
    const csvContent = [
      ['Metric', 'Value', 'Description'].join(','),
      ['Total Mentees', stats.totalMentees, 'Users with selected mentors'].join(','),
      ['New Mentees This Month', stats.newMenteesThisMonth, 'New mentee selections this month'].join(','),
      ['Total Mentors', stats.totalMentors, 'Registered mentors in the platform'].join(','),
      ['Available Mentors', stats.availableMentors, 'Currently available mentors'].join(','),
      ['Total Feedback', feedbackStats.totalFeedback, 'Total feedback submissions received'].join(','),
      ['Average Rating', feedbackStats.averageRating, 'Average rating from all feedback (1-5 scale)'].join(','),
      '',
      ['Top Performing Mentors', '', ''].join(','),
      ['Rank', 'Mentor Name', 'Selections Count'].join(','),
      ...stats.topPerformingMentors.map((mentor, index) => [
        index + 1,
        `"${mentor.mentorName}"`,
        mentor.selectionsCount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `platform_metrics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const toggleMentorAvailability = async (mentorId: string) => {
    try {
      const mentorIndex = mentors.findIndex(m => m.id === mentorId);
      if (mentorIndex !== -1) {
        const updatedMentors = [...mentors];
        updatedMentors[mentorIndex].is_available = !updatedMentors[mentorIndex].is_available;
        setMentors(updatedMentors);
        
        // Also update in DEV_CONFIG
        const mockMentorIndex = DEV_CONFIG.MOCK_MENTORS.findIndex(m => m.id === mentorId);
        if (mockMentorIndex !== -1) {
          DEV_CONFIG.MOCK_MENTORS[mockMentorIndex].is_available = updatedMentors[mentorIndex].is_available;
        }
        
        // Recalculate stats
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating mentor availability:', error);
    }
  };

  const deleteMentor = async (mentorId: string) => {
    try {
      setDeletingMentorId(mentorId);
      // Remove from local state
      setMentors(mentors.filter(m => m.id !== mentorId));
      
      // Remove from DEV_CONFIG
      const mentorIndex = DEV_CONFIG.MOCK_MENTORS.findIndex(m => m.id === mentorId);
      if (mentorIndex !== -1) {
        DEV_CONFIG.MOCK_MENTORS.splice(mentorIndex, 1);
      }
      
      setConfirmDelete(null);
      // Recalculate stats
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting mentor:', error);
    } finally {
      setDeletingMentorId(null);
    }
  };

  const resetAllData = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    console.log('🧹 COMPLETE PLATFORM RESET - Starting...');
    
    try {
      // 1. Clear all mock data arrays completely
      DEV_CONFIG.MOCK_MENTORS.length = 0;
      DEV_CONFIG.MOCK_SELECTIONS.length = 0;
      DEV_CONFIG.MOCK_FEEDBACK.length = 0;
      console.log('✅ All mock data arrays cleared');
      
      // 2. Reset dashboard stats
      DEV_CONFIG.MOCK_DASHBOARD_STATS.totalMentees = 0;
      DEV_CONFIG.MOCK_DASHBOARD_STATS.newMenteesThisMonth = 0;
      DEV_CONFIG.MOCK_DASHBOARD_STATS.totalMentors = 0;
      DEV_CONFIG.MOCK_DASHBOARD_STATS.availableMentors = 0;
      DEV_CONFIG.MOCK_DASHBOARD_STATS.topPerformingMentors = [];
      console.log('✅ Dashboard stats reset');
      
      // 3. Clear ALL browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Also clear any potential IndexedDB or other storage
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      console.log('✅ All browser storage cleared');
      
      // 4. Reset local component state
      setMentors([]);
      setFeedback([]);
      setStats({
        totalMentees: 0,
        newMenteesThisMonth: 0,
        totalMentors: 0,
        availableMentors: 0,
        topPerformingMentors: [],
      });
      setFeedbackStats({
        totalFeedback: 0,
        averageRating: '0',
        categoryBreakdown: {},
      });
      console.log('✅ Component state reset');
      
      setConfirmReset(false);
      console.log('✅ PLATFORM COMPLETELY RESET');
      
      // 5. Force complete page reload to ensure fresh start
      setTimeout(() => {
        console.log('🔄 Forcing complete page reload...');
        window.location.href = window.location.origin + '?reset=true';
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error during reset:', error);
      setConfirmReset(false);
      // Still try to reload even if there was an error
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage the mentorship platform</p>
        </motion.div>

        {/* Platform Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
              Platform Overview
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportMenteesData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600/80 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                <Download size={14} />
                Mentees
              </button>
              <button
                onClick={exportMentorsData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-md transition-colors"
              >
                <Download size={14} />
                Mentors
              </button>
              <button
                onClick={exportFeedbackData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600/80 hover:bg-purple-600 text-white rounded-md transition-colors"
              >
                <Download size={14} />
                Feedback
              </button>
              <button
                onClick={exportMetricsData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600/80 hover:bg-orange-600 text-white rounded-md transition-colors"
              >
                <Download size={14} />
                Metrics
              </button>
              <button
                onClick={resetAllData}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  confirmReset 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-red-600/70 hover:bg-red-600'
                } text-white`}
              >
                <RotateCcw size={14} />
                {confirmReset ? 'Confirm Reset' : 'Reset'}
              </button>
              {confirmReset && (
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-600/80 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Mentees */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-6 rounded-xl border border-blue-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-blue-300 mb-1">Total Mentees</h3>
              <p className="text-3xl font-bold text-white">{stats.totalMentees}</p>
              <p className="text-sm text-blue-200 mt-2">Users with selected mentors</p>
            </motion.div>

            {/* New This Month */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 p-6 rounded-xl border border-cyan-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-1">New This Month</h3>
              <p className="text-3xl font-bold text-white">{stats.newMenteesThisMonth}</p>
              <p className="text-sm text-cyan-200 mt-2">New mentee selections</p>
            </motion.div>

            {/* Total Mentors */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 p-6 rounded-xl border border-emerald-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <UserCheck className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-1">Total Mentors</h3>
              <p className="text-3xl font-bold text-white">{stats.totalMentors}</p>
              <p className="text-sm text-emerald-200 mt-2">Registered mentors</p>
            </motion.div>

            {/* Available Now */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-6 rounded-xl border border-green-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <Eye className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-green-300 mb-1">Available Now</h3>
              <p className="text-3xl font-bold text-white">{stats.availableMentors}</p>
              <p className="text-sm text-green-200 mt-2">Currently available</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Top Performing Mentors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
            Top Performing Mentors
          </h2>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="space-y-4">
              {stats.topPerformingMentors.map((mentor, index) => (
                <div
                  key={mentor.mentorEmail}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-500/20 rounded-full">
                      <span className="text-yellow-400 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{mentor.mentorName}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Mail size={14} />
                        {mentor.mentorEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Award size={16} />
                      <span className="font-semibold">{mentor.selectionsCount}</span>
                    </div>
                    <p className="text-xs text-gray-500">selections</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Program Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
            Program Feedback
          </h2>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Total Feedback</h3>
                <p className="text-2xl font-bold text-purple-400">{feedbackStats.totalFeedback}</p>
              </div>
              <div className="text-center">
                <Star className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Average Rating</h3>
                <p className="text-2xl font-bold text-yellow-400">{feedbackStats.averageRating}</p>
              </div>
              <div className="text-center">
                <Award className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Response Rate</h3>
                <p className="text-2xl font-bold text-emerald-400">100%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mentors Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
            Mentors Management
          </h2>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="space-y-4">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={mentor.picture_url || 'https://via.placeholder.com/50'}
                      alt={`${mentor.user_profiles.first_name} ${mentor.user_profiles.last_name}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-white">
                        {mentor.user_profiles.first_name} {mentor.user_profiles.last_name}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Mail size={14} />
                        {mentor.user_profiles.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {mentor.strengths.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mentor.is_available
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {mentor.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {getMentorSelectionCount(mentor.id)} selections
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMentorAvailability(mentor.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          mentor.is_available
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                        }`}
                        title={mentor.is_available ? 'Mark as unavailable' : 'Mark as available'}
                      >
                        {mentor.is_available ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      
                      {confirmDelete === mentor.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteMentor(mentor.id)}
                            disabled={deletingMentorId === mentor.id}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                          >
                            {deletingMentorId === mentor.id ? 'Deleting...' : 'Confirm'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(mentor.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          title="Delete mentor"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {mentors.length === 0 && (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No mentors registered yet.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
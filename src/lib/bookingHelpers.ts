import { supabase } from './supabase';

/**
 * Auto-complete sessions that are still 'active' but have passed their scheduled date
 * This ensures accurate success rate calculation by assuming non-cancelled past sessions were completed
 */
export const autoCompletePassedSessions = async () => {
  try {
    const now = new Date().toISOString();
    
    // Find all active bookings that have passed their scheduled date
    const { data: passedSessions, error: fetchError } = await supabase
      .from('bookings')
      .select('id, scheduled_at')
      .eq('status', 'active')
      .not('scheduled_at', 'is', null)
      .lt('scheduled_at', now); // scheduled_at is less than now (in the past)

    if (fetchError) {
      console.error('Error fetching passed sessions:', fetchError);
      return { success: false, error: fetchError };
    }

    if (!passedSessions || passedSessions.length === 0) {
      console.log('No passed sessions to complete');
      return { success: true, updatedCount: 0 };
    }

    // Update all passed active sessions to completed
    const sessionIds = passedSessions.map((session: { id: string; scheduled_at: string }) => session.id);
    
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .in('id', sessionIds);

    if (updateError) {
      console.error('Error updating passed sessions:', updateError);
      return { success: false, error: updateError };
    }

    console.log(`Auto-completed ${passedSessions.length} passed sessions`);
    return { success: true, updatedCount: passedSessions.length };
  } catch (error) {
    console.error('Error in autoCompletePassedSessions:', error);
    return { success: false, error };
  }
};

/**
 * Calculate success rate considering auto-completed sessions
 * Success Rate = (Completed Sessions) / (Completed + Cancelled Sessions) * 100
 * This excludes currently active sessions from the calculation
 */
export const calculateSuccessRate = (
  completedBookings: number,
  cancelledBookings: number
): number => {
  const totalFinishedBookings = completedBookings + cancelledBookings;
  
  if (totalFinishedBookings === 0) {
    return 0; // No finished sessions yet
  }
  
  return Math.round((completedBookings / totalFinishedBookings) * 100);
};

/**
 * Get insights about booking patterns and success rates
 */
export const getBookingInsights = (stats: {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number;
}) => {
  const insights: string[] = [];
  
  // Success rate insights
  if (stats.completionRate >= 80) {
    insights.push("Excellent session completion rate! The mentorship program is highly successful.");
  } else if (stats.completionRate >= 60) {
    insights.push("Good session completion rate. Consider following up on cancelled sessions to understand why.");
  } else if (stats.completionRate > 0) {
    insights.push("Low completion rate detected. Review booking process and mentor availability.");
  }
  
  // Active sessions insights
  if (stats.activeBookings > stats.completedBookings) {
    insights.push("High number of upcoming sessions scheduled. Great engagement!");
  }
  
  // Cancellation insights
  const cancellationRate = stats.totalBookings > 0 
    ? Math.round((stats.cancelledBookings / stats.totalBookings) * 100)
    : 0;
    
  if (cancellationRate > 20) {
    insights.push(`High cancellation rate (${cancellationRate}%). Consider implementing booking confirmation reminders.`);
  }
  
  return insights;
}; 
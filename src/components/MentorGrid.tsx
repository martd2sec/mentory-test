import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { useMentorContext } from '../context/MentorContext';
import MentorCard from './MentorCard';
import { strengthOptions } from '../data/mockData';

const MentorGrid: React.FC = () => {
  const { mentors, loading } = useMentorContext();
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedStrength, setSelectedStrength] = useState<string | null>(null);

  const filteredMentors = mentors.filter(mentor => {
    // Filter by availability if showAvailableOnly is true
    if (showAvailableOnly && !mentor.is_available) return false;
    
    // Filter by selected strength if one is selected
    if (selectedStrength && !mentor.strengths.includes(selectedStrength)) return false;
    
    return true;
  });

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading mentors...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="mentors" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Available Mentors</h2>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <Filter size={20} className="text-emerald-400 mr-2" />
          <span className="text-white font-medium">Filters:</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showAvailableOnly
                ? 'bg-emerald-700/60 text-emerald-200 border border-emerald-600'
                : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
            }`}
          >
            Available Only
          </button>
          
          <select
            value={selectedStrength || ''}
            onChange={(e) => setSelectedStrength(e.target.value || null)}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Strengths</option>
            {strengthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredMentors.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No mentors found matching your filters.
          </p>
          <button
            onClick={() => {
              setShowAvailableOnly(false);
              setSelectedStrength(null);
            }}
            className="mt-4 px-4 py-2 text-sm bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
};

export default MentorGrid;
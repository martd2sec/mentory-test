import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, UserIcon, CogIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useProfile } from '../context/ProfileContext';
import { ProfileView } from '../types';

const ProfileSelector: React.FC = () => {
  const { currentView, setCurrentView, availableViews } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Don't show selector if user only has access to one view
  if (availableViews.length <= 1) {
    return null;
  }

  const currentViewOption = availableViews.find(view => view.value === currentView);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getIcon = (view: ProfileView) => {
    switch (view) {
      case 'admin':
        return <CogIcon className="h-5 w-5" />;
      case 'mentor':
        return <AcademicCapIcon className="h-5 w-5" />;
      case 'user':
        return <UserIcon className="h-5 w-5" />;
    }
  };

  const getIconColor = (view: ProfileView) => {
    switch (view) {
      case 'admin':
        return 'text-red-400';
      case 'mentor':
        return 'text-blue-400';
      case 'user':
        return 'text-emerald-400';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-all duration-200 min-w-[200px]"
      >
        <div className={`${getIconColor(currentView)}`}>
          {getIcon(currentView)}
        </div>
        <div className="flex-1 text-left">
          <div className="text-white font-medium text-sm">
            {currentViewOption?.label}
          </div>
          <div className="text-gray-400 text-xs">
            {currentViewOption?.description}
          </div>
        </div>
        <ChevronDownIcon 
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
          {availableViews.map((viewOption) => (
            <button
              key={viewOption.value}
              onClick={() => {
                setCurrentView(viewOption.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors duration-200 ${
                currentView === viewOption.value 
                  ? 'bg-gray-700 border-l-4 border-emerald-400' 
                  : ''
              }`}
            >
              <div className={`${getIconColor(viewOption.value)}`}>
                {getIcon(viewOption.value)}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">
                  {viewOption.label}
                </div>
                <div className="text-gray-400 text-xs">
                  {viewOption.description}
                </div>
              </div>
              {currentView === viewOption.value && (
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileSelector; 
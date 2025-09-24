import React, { createContext, useContext, useState } from 'react';

interface BookingModalContextType {
  isOpen: boolean;
  mentorId: string | null;
  mentorName: string;
  openModal: (mentorId: string, mentorName: string) => void;
  closeModal: () => void;
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined);

export const BookingModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [mentorName, setMentorName] = useState('');

  const openModal = (id: string, name: string) => {
    console.log('🔓 Opening booking modal for:', name, 'ID:', id);
    setMentorId(id);
    setMentorName(name);
    setIsOpen(true);
  };

  const closeModal = () => {
    console.log('🔒 Closing booking modal');
    setIsOpen(false);
    setMentorId(null);
    setMentorName('');
  };

  return (
    <BookingModalContext.Provider value={{
      isOpen,
      mentorId,
      mentorName,
      openModal,
      closeModal
    }}>
      {children}
    </BookingModalContext.Provider>
  );
};

export const useBookingModal = () => {
  const context = useContext(BookingModalContext);
  if (context === undefined) {
    throw new Error('useBookingModal must be used within a BookingModalProvider');
  }
  return context;
}; 
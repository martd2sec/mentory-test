import React, { useState } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
  mentorName: string;
  loading: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  mentorName,
  loading
}) => {
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');

  React.useEffect(() => {
    console.log('📅 BookingModal state changed - isOpen:', isOpen);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset form when modal closes
      setSessionDate('');
      setSessionTime('');
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirm = () => {
    if (sessionDate && sessionTime) {
      onConfirm(sessionDate, sessionTime);
    }
  };

  const handleCancel = () => {
    console.log('🚫 Modal cancelled by user');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: '999999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        console.log('🖱️ Backdrop clicked - NOT closing modal');
        e.stopPropagation();
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          maxWidth: '500px',
          width: '90%',
          color: 'black'
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 style={{ marginBottom: '20px', color: 'black' }}>Confirm Your Session</h2>
        <p style={{ marginBottom: '20px', color: 'black' }}>
          You've scheduled with <strong>{mentorName}</strong>. 
          Please enter the date and time you selected:
        </p>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'black' }}>Date:</label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              color: 'black'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'black' }}>Time:</label>
          <input
            type="time"
            value={sessionTime}
            onChange={(e) => setSessionTime(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              color: 'black'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!sessionDate || !sessionTime || loading}
            style={{
              padding: '10px 20px',
              backgroundColor: !sessionDate || !sessionTime || loading ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: !sessionDate || !sessionTime || loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Confirming...' : 'Confirm Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal; 
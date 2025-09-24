import React from 'react';

interface BitsoLogoProps {
  size?: number;
  className?: string;
}

const BitsoLogo: React.FC<BitsoLogoProps> = ({ size = 32, className = "" }) => {
  return (
    <img
      src="/bitso-logo.png"
      alt="Bitso Logo"
      width={size}
      height={size}
      className={className}
      style={{
        objectFit: 'contain',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};

export default BitsoLogo; 
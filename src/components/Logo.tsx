import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  return (
    <div className={`flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer red circle */}
        <circle cx="32" cy="32" r="30" fill="#E53E3E" stroke="#C53030" strokeWidth="2"/>
        
        {/* White ring */}
        <circle cx="32" cy="32" r="22" fill="white"/>
        
        {/* Inner red circle */}
        <circle cx="32" cy="32" r="14" fill="#E53E3E"/>
        
        {/* Center white circle */}
        <circle cx="32" cy="32" r="6" fill="white"/>
      </svg>
    </div>
  );
};

export default Logo;
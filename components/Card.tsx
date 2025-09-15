
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-surface rounded-lg shadow-lg p-6 transition-shadow hover:shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;

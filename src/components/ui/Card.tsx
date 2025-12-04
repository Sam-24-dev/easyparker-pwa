import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-100 ${
        hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

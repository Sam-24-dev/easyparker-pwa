import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center gap-1';

  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 hover:shadow-md',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 hover:shadow-md',
    danger: 'bg-danger text-white hover:bg-red-600 hover:shadow-md',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
    md: 'px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base',
    lg: 'px-4 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      type={type}
      {...props}
    />
  );
}

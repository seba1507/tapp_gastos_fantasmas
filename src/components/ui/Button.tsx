'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        text-center 
        py-5 
        px-16 
        rounded-full 
        font-bold 
        text-xl 
        text-black 
        bg-[var(--button-color)] 
        hover:bg-[var(--button-hover)] 
        transition-all 
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
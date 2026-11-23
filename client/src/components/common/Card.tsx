import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-[0_12px_30px_-4px_rgba(105,76,255,0.12)] hover:-translate-y-0.5 hover:border-[#694CFF]/20' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

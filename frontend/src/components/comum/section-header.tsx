import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ title, description, children }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex gap-3">
          {children}
        </div>
      )}
    </div>
  );
} 
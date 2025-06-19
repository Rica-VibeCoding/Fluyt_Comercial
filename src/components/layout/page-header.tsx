'use client';

import React from 'react';

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function PageHeader({ children, className = "" }: PageHeaderProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className={`bg-white rounded-lg shadow-md border-0 p-4 ${className}`}>
          <div className="flex items-center justify-between min-h-[3rem]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PageHeaderContentProps {
  children: React.ReactNode;
}

export function PageHeaderContent({ children }: PageHeaderContentProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {children}
    </div>
  );
} 
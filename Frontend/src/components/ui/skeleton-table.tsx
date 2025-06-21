'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

interface SkeletonTableProps {
  columns: string[];
  rows?: number;
  className?: string;
}

export function SkeletonTable({ columns, rows = 5, className = "" }: SkeletonTableProps) {
  return (
    <div className={`rounded-lg border-0 bg-blue-50/30 shadow-md ${className}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            {columns.map((column, index) => (
              <TableHead key={index} className="font-semibold text-slate-700 h-10">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <TableRow key={rowIndex} className="h-12 bg-white">
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex} className="py-2">
                  <div className="animate-pulse">
                    <div 
                      className="h-4 bg-slate-200 rounded"
                      style={{
                        width: `${70 + (colIndex % 3) * 10}%` // Larguras: 70%, 80%, 90%, repete...
                      }}
                    ></div>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-0 p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="h-6 bg-slate-200 rounded w-32"></div>
          <div className="h-8 bg-slate-200 rounded w-24"></div>
        </div>
        
        {/* Content lines */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

interface SkeletonProgressStepperProps {
  steps?: number;
  className?: string;
}

export function SkeletonProgressStepper({ steps = 4, className = "" }: SkeletonProgressStepperProps) {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-8">
            {Array.from({ length: steps }, (_, index) => (
              <div key={index} className="flex items-center">
                <div className="animate-pulse">
                  {/* Círculo */}
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-200 rounded-full">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                  {/* Label */}
                  <div className="mt-2 flex justify-center">
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
                
                {/* Linha conectora (exceto no último) */}
                {index < steps - 1 && (
                  <div className="ml-8 animate-pulse">
                    <div className="h-0.5 w-16 bg-slate-200"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
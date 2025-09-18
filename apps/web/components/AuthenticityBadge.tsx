"use client";
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface AuthenticityBadgeProps {
  source: 'camera' | 'upload';
  className?: string;
}

export default function AuthenticityBadge({ source, className = '' }: AuthenticityBadgeProps) {
  if (source !== 'camera') {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full ${className}`}>
      <CheckCircleIcon className="w-3 h-3" />
      Live Photo
    </div>
  );
}

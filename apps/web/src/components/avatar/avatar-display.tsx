'use client';

import React from 'react';
import { AvatarColor, AvatarHat, AvatarGlasses } from '@repo/shared-types';

interface AvatarDisplayProps {
  color?: AvatarColor;
  hat?: AvatarHat;
  glasses?: AvatarGlasses;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  color = 'retro-yellow',
  hat = 'none',
  glasses = 'none',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const colorMap: Record<AvatarColor, string> = {
    'retro-yellow': '#F59E0B',
    'retro-blue': '#3B82F6',
    'retro-green': '#10B981',
    'retro-red': '#EF4444',
    'retro-purple': '#8B5CF6',
  };

  const fillColor = colorMap[color] || '#F59E0B';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl border-2 border-ink bg-paper-panel shadow-retro-sm overflow-hidden ${sizeMap[size]} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head/Body Shape */}
        <circle cx="50" cy="55" r="36" fill={fillColor} stroke="#18181B" strokeWidth="4" />

        {/* Cheeks */}
        <ellipse cx="32" cy="62" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
        <ellipse cx="68" cy="62" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />

        {/* Eyes */}
        <circle cx="36" cy="50" r="4.5" fill="#18181B" />
        <circle cx="64" cy="50" r="4.5" fill="#18181B" />
        <circle cx="34" cy="48" r="1.5" fill="#FFFFFF" />
        <circle cx="62" cy="48" r="1.5" fill="#FFFFFF" />

        {/* Smile */}
        <path
          d="M 40 64 Q 50 72 60 64"
          fill="none"
          stroke="#18181B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Glasses Layer */}
        {glasses === 'classic' && (
          <g stroke="#18181B" strokeWidth="3" fill="none">
            <circle cx="36" cy="50" r="10" />
            <circle cx="64" cy="50" r="10" />
            <line x1="46" y1="50" x2="54" y2="50" />
          </g>
        )}
        {glasses === 'pixel-shades' && (
          <g fill="#18181B">
            <rect x="24" y="44" width="24" height="12" rx="2" />
            <rect x="52" y="44" width="24" height="12" rx="2" />
            <rect x="46" y="47" width="8" height="4" />
            <line x1="28" y1="47" x2="38" y2="47" stroke="#FFF" strokeWidth="2" />
            <line x1="56" y1="47" x2="66" y2="47" stroke="#FFF" strokeWidth="2" />
          </g>
        )}
        {glasses === 'nerd' && (
          <g stroke="#18181B" strokeWidth="3.5" fill="none">
            <rect x="25" y="42" width="22" height="16" rx="4" />
            <rect x="53" y="42" width="22" height="16" rx="4" />
            <line x1="47" y1="49" x2="53" y2="49" />
          </g>
        )}

        {/* Hat Layer */}
        {hat === 'student-cap' && (
          <g>
            {/* Traditional Vietnamese Student Calot cap */}
            <path
              d="M 22 34 Q 50 12 78 34 L 72 40 Q 50 25 28 40 Z"
              fill="#2A5C9A"
              stroke="#18181B"
              strokeWidth="3"
            />
            <circle cx="50" cy="22" r="3" fill="#F59E0B" />
          </g>
        )}
        {hat === 'retro-cap' && (
          <g>
            <path
              d="M 24 35 Q 50 16 76 35 L 88 38 L 84 43 L 74 38 Z"
              fill="#EF4444"
              stroke="#18181B"
              strokeWidth="3"
            />
          </g>
        )}
        {hat === 'bunny-ears' && (
          <g fill="#FFF" stroke="#18181B" strokeWidth="3">
            <ellipse cx="36" cy="18" rx="6" ry="16" />
            <ellipse cx="64" cy="18" rx="6" ry="16" />
            <ellipse cx="36" cy="18" rx="3" ry="11" fill="#FDA4AF" />
            <ellipse cx="64" cy="18" rx="3" ry="11" fill="#FDA4AF" />
          </g>
        )}
        {hat === 'wizard' && (
          <g>
            <polygon
              points="50,4 26,36 74,36"
              fill="#7C3AED"
              stroke="#18181B"
              strokeWidth="3"
            />
            <ellipse cx="50" cy="36" rx="30" ry="6" fill="#6D28D9" stroke="#18181B" strokeWidth="3" />
            <circle cx="50" cy="16" r="3" fill="#F59E0B" />
          </g>
        )}
      </svg>
    </div>
  );
};

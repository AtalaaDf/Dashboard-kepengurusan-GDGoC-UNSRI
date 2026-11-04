import React from 'react';
import { ANIMATIONS } from '@/lib/animations';

export interface OrnamentItem {
  id: string;
  colorClass: string;
  sizeClass: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  animationClass: string;
  animationDelay?: string;
}

export interface FloatingOrnamentsProps {
  variant?: 'section' | 'overlay';
  className?: string;
  minHeight?: string;
  items?: OrnamentItem[];
}


const DEFAULT_ORNAMENTS: OrnamentItem[] = [
  {
    id: 'ornament-blue-top-left',
    colorClass: 'bg-[#c3ecf6]',
    sizeClass: 'w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48',
    position: { left: '2%', top: '4%' },
    animationClass: ANIMATIONS.FLOAT_SCALE_1,
    animationDelay: '0s',
  },
  // {
  //   id: 'ornament-yellow-bottom-left',
  //   colorClass: 'bg-[#ffe7a5]',
  //   sizeClass: 'w-28 h-28 sm:w-40 sm:h-40 lg:w-52 lg:h-52',
  //   position: { left: '3%', bottom: '5%' },
  //   animationClass: ANIMATIONS.FLOAT_SCALE_2,
  //   animationDelay: '1.2s',
  // },
  {
    id: 'ornament-red-top-right',
    colorClass: 'bg-[#f8d8d8]',
    sizeClass: 'w-24 h-24 sm:w-32 sm:h-32 lg:w-44 lg:h-44',
    position: { right: '3%', top: '5%' },
    animationClass: ANIMATIONS.FLOAT_SCALE_4,
    animationDelay: '2s',
  },
  {
    id: 'ornament-green-bottom-right',
    colorClass: 'bg-[#ccf6c5]',
    sizeClass: 'w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40',
    position: { right: '3%', bottom: '6%' },
    animationClass: ANIMATIONS.FLOAT_SCALE_3,
    animationDelay: '0.6s',
  },
  {
    id: 'ornament-yellow-mid-left',
    colorClass: 'bg-[#ffe7a5]',
    sizeClass: 'hidden lg:block lg:w-16 lg:h-16 xl:w-20 xl:h-20',
    position: { left: '5%', top: '48%' },
    animationClass: ANIMATIONS.FLOAT_SCALE_3,
    animationDelay: '2.5s',
  },
  // {
  //   id: 'ornament-blue-mid-right',
  //   colorClass: 'bg-[#c3ecf6]',
  //   sizeClass: 'hidden lg:block lg:w-16 lg:h-16 xl:w-22 xl:h-22',
  //   position: { right: '5%', top: '50%' },
  //   animationClass: ANIMATIONS.FLOAT_SCALE_1,
  //   animationDelay: '3.5s',
  // },
];

export const FloatingOrnaments: React.FC<FloatingOrnamentsProps> = ({
  variant = 'overlay',
  className = '',
  minHeight = 'min-h-[280px] sm:min-h-[340px] lg:min-h-[400px]',
  items = DEFAULT_ORNAMENTS,
}) => {
  const baseWrapperClass =
    variant === 'overlay'
      ? 'absolute inset-0 pointer-events-none select-none overflow-hidden z-0'
      : `relative w-full ${minHeight} pointer-events-none select-none overflow-hidden rounded-3xl`;

  return (
    <div
      className={`${baseWrapperClass} ${className}`}
      aria-hidden="true"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={`absolute rounded-full will-change-transform opacity-70 ${item.colorClass} ${item.sizeClass} ${item.animationClass}`}
          style={{
            ...item.position,
            animationDelay: item.animationDelay,
          }}
        />
      ))}
    </div>
  );
};

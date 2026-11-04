export const ANIMATIONS = {
  PAGE_FADE_IN: 'animate-fade-in',
  DIALOG_FADE: 'animate-dialog-fade',
  TOAST_FADE: 'animate-toast-fade',
  HOVER_TRANSITION: 'transition-hover',
  FLOAT_SCALE_1: 'animate-float-scale-1',
  FLOAT_SCALE_2: 'animate-float-scale-2',
  FLOAT_SCALE_3: 'animate-float-scale-3',
  FLOAT_SCALE_4: 'animate-float-scale-4',
} as const;

export type AnimationClass = (typeof ANIMATIONS)[keyof typeof ANIMATIONS];


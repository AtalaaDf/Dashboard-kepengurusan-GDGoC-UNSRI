export const ANIMATIONS = {
  PAGE_FADE_IN: 'animate-fade-in',
  DIALOG_FADE: 'animate-dialog-fade',
  TOAST_FADE: 'animate-toast-fade',
  HOVER_TRANSITION: 'transition-hover',
} as const;

export type AnimationClass = (typeof ANIMATIONS)[keyof typeof ANIMATIONS];


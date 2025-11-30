export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 15,
  xxl: 20,
  full: 999,
};

export const getBorderRadius = (size = 'md') => borderRadius[size] || borderRadius.md;

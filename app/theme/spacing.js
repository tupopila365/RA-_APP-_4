export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const getPadding = (size) => spacing[size] || spacing.md;
export const getMargin = (size) => spacing[size] || spacing.md;

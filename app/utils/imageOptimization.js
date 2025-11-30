export const imageOptimization = {
  getOptimizedSize: (width, height, maxWidth = 800) => {
    if (width <= maxWidth) {
      return { width, height };
    }
    const ratio = height / width;
    return {
      width: maxWidth,
      height: maxWidth * ratio,
    };
  },

  getCacheKeyForImage: (uri, size = 'medium') => {
    return `img_${uri}_${size}`;
  },

  isNetworkImage: (source) => {
    if (typeof source === 'string') {
      return source.startsWith('http://') || source.startsWith('https://');
    }
    return false;
  },

  getImageDimensions: (width, height, containerWidth) => {
    const ratio = height / width;
    return {
      width: containerWidth,
      height: containerWidth * ratio,
    };
  },
};

import { useState, useEffect } from 'react';
import { Box, Skeleton, SxProps, Theme } from '@mui/material';
import { BrokenImage as BrokenImageIcon } from '@mui/icons-material';
import { errorLogger } from '../../services/errorLogger.service';

export interface ImageThumbnailProps {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  onError?: () => void;
  loading?: boolean;
  sx?: SxProps<Theme>;
}

const sizeMap = {
  small: { width: 60, height: 60 },
  medium: { width: 100, height: 100 },
  large: { width: 150, height: 150 },
};

const ImageThumbnail = ({
  src,
  alt,
  size = 'medium',
  onError,
  loading: externalLoading = false,
  sx = {},
}: ImageThumbnailProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const dimensions = sizeMap[size];
  const isLoading = externalLoading || imageLoading;

  useEffect(() => {
    // Reset state when src changes
    setImageLoading(true);
    setImageError(false);
    setImageSrc(null);

    if (!src) {
      setImageLoading(false);
      setImageError(true);
      return;
    }

    // Lazy load the image
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setImageLoading(false);
      setImageError(false);
    };

    img.onerror = () => {
      setImageLoading(false);
      setImageError(true);
      
      // Log error with comprehensive details
      errorLogger.logImageLoadFailure(
        src,
        'Failed to load thumbnail image',
        {
          component: 'ImageThumbnail',
          alt,
          size,
          dimensions,
        }
      );
      
      if (onError) {
        onError();
      }
    };

    img.src = src;

    return () => {
      // Cleanup
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onError]);

  // Show loading skeleton
  if (isLoading) {
    return (
      <Skeleton
        variant="rectangular"
        width={dimensions.width}
        height={dimensions.height}
        sx={{
          borderRadius: 1,
          ...sx,
        }}
      />
    );
  }

  // Show error placeholder
  if (imageError || !imageSrc) {
    return (
      <Box
        sx={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.200',
          borderRadius: 1,
          ...sx,
        }}
      >
        <BrokenImageIcon sx={{ color: 'grey.500', fontSize: dimensions.width * 0.4 }} />
      </Box>
    );
  }

  // Show loaded image
  return (
    <Box
      component="img"
      src={imageSrc}
      alt={alt}
      sx={{
        width: dimensions.width,
        height: dimensions.height,
        objectFit: 'cover',
        borderRadius: 1,
        display: 'block',
        ...sx,
      }}
    />
  );
};

export default ImageThumbnail;

import React, { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import ImageUploadField from './ImageUploadField';

/**
 * Example usage of ImageUploadField component
 * This demonstrates how to integrate the component into a form
 */
const ImageUploadFieldExample: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleImageChange = (url: string) => {
    setImageUrl(url);
    console.log('Image uploaded:', url);
  };

  const handleError = (error: Error) => {
    console.error('Upload error:', error);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Image Upload Field Example
      </Typography>

      <Box sx={{ mt: 4 }}>
        <ImageUploadField
          value={imageUrl}
          onChange={handleImageChange}
          onError={handleError}
          label="Featured Image"
          required
          maxSizeMB={5}
          acceptedFormats={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
        />
      </Box>

      {imageUrl && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Current Image URL:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {imageUrl}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ImageUploadFieldExample;

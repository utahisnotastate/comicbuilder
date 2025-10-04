// src/components/SampleImage.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const SampleImage = ({ width = 600, height = 400 }) => {
  return (
    <Box
      sx={{
        width: width,
        height: height,
        backgroundColor: '#2c3e50',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        borderRadius: '8px',
        border: '2px solid #34495e',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: '16px', fontWeight: 'bold' }}>
        Sample Comic Panel
      </Typography>
      <Typography variant="body1" sx={{ textAlign: 'center', opacity: 0.9 }}>
        Upload your own image or use this placeholder
      </Typography>
    </Box>
  );
};

export default SampleImage;

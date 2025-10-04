// src/Editor.jsx
import React, { useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { usePanelStore } from './store';
import ComicPanel from './ComicPanel';
import ControlPanel from './ControlPanel';
import * as htmlToImage from 'html-to-image';

const Editor = () => {
  const panelRef = useRef();

  const onExportClick = useCallback(() => {
    if (panelRef.current === null) return;

    htmlToImage.toPng(panelRef.current, { 
      cacheBust: true, 
      pixelRatio: 3,
      backgroundColor: '#f4f1ea'
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `comic-panel-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Export failed:', err));
  }, [panelRef]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start', 
      gap: '40px',
      padding: '40px',
      minHeight: 'calc(100vh - 200px)',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      <ControlPanel onExport={onExportClick} />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '20px'
      }}>
        <Box sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Typography variant="h6" sx={{ color: 'white', marginBottom: '15px', textAlign: 'center' }}>
            Comic Panel Preview
          </Typography>
          <ComicPanel ref={panelRef} />
        </Box>
      </Box>
    </Box>
  );
};

export default Editor;

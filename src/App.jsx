import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import ProjectComposer from './ProjectComposer';
import Editor from './Editor';
import PanelManager from './PanelManager';
import StoryManager from './StoryManager';
import AssetManager from './AssetManager';
import AIStudio from './AIStudio';

function App() {
  const [view, setView] = useState('editor');

  const handleChange = (event, newValue) => {
    setView(newValue);
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      minHeight: '100vh', 
      fontFamily: '"Roboto", sans-serif' 
    }}>
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '30px',
        padding: '0 40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                padding: '30px 0 20px 0',
                textAlign: 'center',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Chronicle Crafter
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                marginBottom: '20px',
                fontWeight: '300'
              }}
            >
              Professional Media Creation Platform for Comics, Visual Novels & Ebooks
            </Typography>
            <Tabs
              value={view}
              onChange={handleChange}
              textColor="inherit"
              sx={{
                color: 'white',
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '16px',
                  fontWeight: '500',
                  padding: '16px 24px',
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: '600',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                  height: '3px',
                  borderRadius: '2px',
                }
              }}
            >
              <Tab label="Story Manager" value="story" />
              <Tab label="Asset Manager" value="assets" />
              <Tab label="AI Studio" value="ai" />
              <Tab label="Panel Editor" value="editor" />
              <Tab label="Project Composer" value="composer" />
            </Tabs>
      </Box>
      {view === 'story' && <StoryManager />}
      {view === 'assets' && <AssetManager />}
      {view === 'ai' && <AIStudio />}
      {view === 'editor' && <Editor />}
      {view === 'composer' && <ProjectComposer />}
    </Box>
  );
}

export default App;

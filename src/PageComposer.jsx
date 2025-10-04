// src/PageComposer.jsx
import React, { useState, useRef, useCallback } from 'react';
import { usePanelStore } from './store';
import { 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import * as htmlToImage from 'html-to-image';

// Simplified renderer for previews and final page layout
const PanelRenderer = ({ panel, isPreview = false }) => (
  <Box sx={{
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundImage: panel.paperTexture,
    backgroundColor: '#f4f1ea',
    overflow: isPreview ? 'hidden' : 'visible',
    borderRadius: '4px',
    border: '1px solid #ddd',
  }}>
    <img 
      src={panel.image} 
      alt="" 
      style={{ 
        width: '100%', 
        height: isPreview ? '120px' : '100%',
        objectFit: 'cover',
        display: 'block' 
      }} 
    />
    {/* Render elements for full-size panels */}
    {!isPreview && panel.elements.map(element => {
      const isTape = element.type === 'tape';
      return (
        <Box
          key={element.id}
          sx={{
            position: 'absolute',
            left: element.position.x,
            top: element.position.y,
            width: element.size.width,
            height: element.size.height,
            transform: `rotate(${element.rotation}deg)`,
            backgroundColor: isTape ? 'rgba(255, 220, 150, 0.7)' : 'white',
            padding: isTape ? '0' : '8px 12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,0,0,0.1)',
            fontSize: '12px',
            fontFamily: panel.font,
          }}
        >
          {!isTape && (
            <>
              <Box sx={{ fontWeight: 'bold', marginBottom: '2px' }}>
                {element.character}:
              </Box>
              <Box>{element.dialogue}</Box>
            </>
          )}
        </Box>
      );
    })}
  </Box>
);

// Define our page layouts
const layouts = {
  '2x2 Grid': {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '15px',
    slots: 4,
  },
  'Top Banner': {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '2fr 1fr',
    gap: '15px',
    slots: 3,
  },
  'Single Panel': {
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
    gap: '0px',
    slots: 1,
  },
  '3 Panel Strip': {
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: '1fr',
    gap: '15px',
    slots: 3,
  },
};

const PageComposer = () => {
  const pageRef = useRef();
  const savedPanels = usePanelStore((state) => state.savedPanels);
  const [layoutKey, setLayoutKey] = useState('2x2 Grid');
  const [pageSlots, setPageSlots] = useState(Array(layouts['2x2 Grid'].slots).fill(null));

  const handleLayoutChange = (event) => {
    const newKey = event.target.value;
    setLayoutKey(newKey);
    setPageSlots(Array(layouts[newKey].slots).fill(null));
  };

  const assignPanelToSlot = (panel, slotIndex) => {
    const newSlots = [...pageSlots];
    newSlots[slotIndex] = panel;
    setPageSlots(newSlots);
  };

  const clearSlot = (slotIndex) => {
    const newSlots = [...pageSlots];
    newSlots[slotIndex] = null;
    setPageSlots(newSlots);
  };

  const onExportPage = useCallback(() => {
    if (pageRef.current === null) return;

    // Standard Comic Page Trim: 6.625" x 10.25"
    // At 300 DPI (dots per inch) for print:
    // Width: 6.625 * 300 = 1987.5px -> 1988px
    // Height: 10.25 * 300 = 3075px
    const options = {
      width: 1988,
      height: 3075,
      style: {
        transform: `scale(${1988 / pageRef.current.offsetWidth})`,
        transformOrigin: 'top left',
        margin: 0,
      }
    };

    htmlToImage.toPng(pageRef.current, options)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'comic-page.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Export failed:', err));
  }, [pageRef]);

  return (
    <Box sx={{ display: 'flex', gap: '30px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Panel Gallery */}
      <Paper sx={{ width: '300px', padding: '15px', height: 'fit-content' }}>
        <Typography variant="h6" gutterBottom>Saved Panels</Typography>
        {savedPanels.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No saved panels yet. Create and save panels in the Editor tab.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {savedPanels.map(panel => (
              <Card key={panel.id} sx={{ marginBottom: '10px' }}>
                <CardContent sx={{ padding: '8px !important' }}>
                  <PanelRenderer panel={panel} isPreview />
                  <Typography variant="caption" display="block" sx={{ marginTop: '8px' }}>
                    ID: {panel.id.slice(0, 8)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {pageSlots.map((_, i) => (
                      <Chip
                        key={i}
                        label={`Slot ${i+1}`}
                        size="small"
                        onClick={() => assignPanelToSlot(panel, i)}
                        color={pageSlots[i]?.id === panel.id ? 'primary' : 'default'}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Page Workspace */}
      <Box sx={{ flex: 1 }}>
        <FormControl sx={{ marginBottom: '20px', minWidth: '200px' }}>
          <InputLabel>Layout</InputLabel>
          <Select value={layoutKey} label="Layout" onChange={handleLayoutChange}>
            {Object.keys(layouts).map(key => (
              <MenuItem key={key} value={key}>{key}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Paper 
          ref={pageRef} 
          sx={{
            display: 'grid',
            padding: '15px',
            backgroundColor: 'white',
            aspectRatio: '6.625 / 10.25',
            width: '500px',
            margin: '0 auto',
            ...layouts[layoutKey]
          }}
        >
          {pageSlots.map((panel, index) => (
            <Box 
              key={index} 
              sx={{ 
                border: '2px dashed #ccc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative',
                minHeight: '100px'
              }}
            >
              {panel ? (
                <>
                  <PanelRenderer panel={panel} />
                  <Button
                    size="small"
                    color="error"
                    sx={{ position: 'absolute', top: '4px', right: '4px', minWidth: 'auto', padding: '4px' }}
                    onClick={() => clearSlot(index)}
                  >
                    ×
                  </Button>
                </>
              ) : (
                <Typography color="text.secondary">Slot {index+1}</Typography>
              )}
            </Box>
          ))}
        </Paper>
        
        <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={onExportPage}
            disabled={pageSlots.every(slot => slot === null)}
          >
            Export Page for InDesign
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PageComposer;

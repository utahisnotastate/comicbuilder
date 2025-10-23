// src/Editor.jsx
import React, { useRef, useCallback, useState } from 'react';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import { usePanelStore } from './store';
import { LAYOUT_PRESETS } from './store';
import ComicPanel from './ComicPanel';
import ControlPanel from './ControlPanel';
import html2canvas from 'html2canvas';

const Editor = () => {
  const panelRef = useRef();
  const [exporting, setExporting] = useState(false);
  const layoutPresetKey = usePanelStore((s) => s.layoutPresetKey);
  const setLayoutPreset = usePanelStore((s) => s.setLayoutPreset);

  const onExportClick = useCallback(async () => {
    if (panelRef.current === null) return;

    // Temporarily detach remote Google Fonts to avoid cross-origin CSS errors during export
    const removedFontLinks = [];
    try {
      setExporting(true);

      const fontLinks = Array.from(document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]'));
      fontLinks.forEach((link) => {
        const parent = link.parentNode;
        if (parent) {
          removedFontLinks.push({ parent, link, next: link.nextSibling });
          parent.removeChild(link);
        }
      });

      await new Promise(requestAnimationFrame);

      const preset = LAYOUT_PRESETS[layoutPresetKey] || LAYOUT_PRESETS.IG_PORTRAIT_4_5;
      const node = panelRef.current;
      const rect = node.getBoundingClientRect ? node.getBoundingClientRect() : { width: node.clientWidth, height: node.clientHeight };
      const currentWidth = Math.max(1, Math.round(rect.width || node.clientWidth || node.offsetWidth || 700));
      const currentHeight = Math.max(1, Math.round(rect.height || node.clientHeight || node.offsetHeight || 700));
      const targetHeight = Math.max(1, Math.round((preset.width / currentWidth) * currentHeight));

      const canvas = await html2canvas(node, {
        backgroundColor: null, // preserve transparency
        scale: 1,
        width: currentWidth,
        height: currentHeight,
        useCORS: true,
        foreignObjectRendering: true,
        removeContainer: true,
      });

      let blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
      if (!blob) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `comic-panel-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `comic-panel-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      // Restore any removed font links
      for (const { parent, link, next } of removedFontLinks) {
        try {
          parent.insertBefore(link, next || null);
        } catch (_) {}
      }
      setExporting(false);
    }
  }, [panelRef, layoutPresetKey]);

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', gap: '12px' }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              Comic Panel Preview
            </Typography>
            <FormControl size="small" sx={{ minWidth: 260, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '8px' }}>
              <Select
                value={layoutPresetKey}
                onChange={(e) => setLayoutPreset(e.target.value)}
                displayEmpty
                sx={{ color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
              >
                {Object.keys(LAYOUT_PRESETS).map((key) => (
                  <MenuItem key={key} value={key}>{LAYOUT_PRESETS[key].name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <ComicPanel ref={panelRef} exporting={exporting} />
        </Box>
      </Box>
    </Box>
  );
};

export default Editor;

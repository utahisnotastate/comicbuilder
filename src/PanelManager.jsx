import React, { useState, useMemo, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { usePanelStore, LAYOUT_PRESETS } from './store';
import ComicPanel from './ComicPanel';
import html2canvas from 'html2canvas';
import { generateImage, downloadCsv } from './utils/aiUtils';
import { createRoot } from 'react-dom/client';
import AIStudio from './AIStudio';

const PanelManager = () => {
  const savedPanels = usePanelStore((state) => state.savedPanels);
  const loadPanelForEditing = usePanelStore((state) => state.loadPanelForEditing);
  const createNewPanel = usePanelStore((state) => state.createNewPanel);
  const reorderSavedPanels = usePanelStore((state) => state.reorderSavedPanels);
  const addPanelStyle = usePanelStore((state) => state.addPanelStyle);
  const removePanelStyle = usePanelStore((state) => state.removePanelStyle);

  // Pipeline store hooks
  const pipelineSettings = usePanelStore((state) => state.pipelineSettings);
  const setPipelineSettings = usePanelStore((state) => state.setPipelineSettings);
  const voiceMap = usePanelStore((state) => state.voiceMap);
  const setVoiceMap = usePanelStore((state) => state.setVoiceMap);
  const normalizeAllToClips = usePanelStore((state) => state.normalizeAllToClips);
  const sendPanelToPipeline = usePanelStore((state) => state.sendPanelToPipeline);
  const sendAllToPipeline = usePanelStore((state) => state.sendAllToPipeline);
  const addSavedPanels = usePanelStore((state) => state.addSavedPanels);
  const layoutPresetKey = usePanelStore((state) => state.layoutPresetKey);

  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [livePreset, setLivePreset] = useState('Original');
  const [kenBurns, setKenBurns] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);

  const [selectedPanelId, setSelectedPanelId] = useState(savedPanels[0]?.id || null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);

  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const [newStyleName, setNewStyleName] = useState('');
  const [creatingStyle, setCreatingStyle] = useState(false);

  const selectedPanel = savedPanels.find(p => p.id === selectedPanelId) || savedPanels[0] || null;

  const uniqueCharacters = useMemo(() => {
    const setChars = new Set();
    savedPanels.forEach(p => (p.elements || []).forEach(el => {
      if (el.type === 'dialogue' && el.character) setChars.add(el.character);
    }));
    return Array.from(setChars);
  }, [savedPanels]);

  // Live style presets for realtime preview
  const presets = useMemo(() => ({
    Original: 'none',
    Noir: 'grayscale(1) contrast(1.2)',
    Neon: 'saturate(1.6) hue-rotate(20deg) contrast(1.05)',
    Vintage: 'sepia(0.6) contrast(1.1) saturate(0.9)',
    Duotone: 'grayscale(1) contrast(1.2) brightness(0.9) hue-rotate(200deg)'
  }), []);
  const liveFilterCss = presets[livePreset] || 'none';

  const handlePreview = (panel) => {
    if (panel && panel.id) setSelectedPanelId(panel.id);
    setPreviewOpen(true);
  };

  const handleEdit = (panel) => {
    setEditingPanel(panel);
    setEditDialogOpen(true);
  };

  const handleDelete = (panelId) => {
    if (window.confirm('Are you sure you want to delete this panel?')) {
      // TODO: Add delete functionality to store
      console.log('Delete panel:', panelId);
    }
  };

  const handleExport = async (panel) => {
    // Temporarily detach remote Google Fonts to avoid cross-origin CSS errors during export
    const removedFontLinks = [];
    let root = null;
    const tempDiv = document.createElement('div');
    try {
      // Create a temporary element for export and render the panel
      tempDiv.style.width = '700px';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      root = createRoot(tempDiv);
      root.render(<ComicPanel panel={panel} exporting={true} />);

      // Remove remote Google Font links before capture
      const fontLinks = Array.from(document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]'));
      fontLinks.forEach((link) => {
        const parent = link.parentNode;
        if (parent) {
          removedFontLinks.push({ parent, link, next: link.nextSibling });
          parent.removeChild(link);
        }
      });

      await new Promise(requestAnimationFrame);

      // Determine target size from the selected layout preset
      const preset = LAYOUT_PRESETS[layoutPresetKey] || LAYOUT_PRESETS.IG_PORTRAIT_4_5;
      const rect = tempDiv.getBoundingClientRect ? tempDiv.getBoundingClientRect() : { width: tempDiv.clientWidth, height: tempDiv.clientHeight };
      const currentWidth = Math.max(1, Math.round(rect.width || tempDiv.clientWidth || tempDiv.offsetWidth || 700));
      const currentHeight = Math.max(1, Math.round(rect.height || tempDiv.clientHeight || tempDiv.offsetHeight || 700));
      const targetHeight = Math.max(1, Math.round((preset.width / currentWidth) * currentHeight));

      const canvas = await html2canvas(tempDiv, {
        backgroundColor: null, // preserve transparency
        scale: 1,
        width: currentWidth,
        height: currentHeight,
        useCORS: true,
        foreignObjectRendering: true,
        removeContainer: true,
      });

      let blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `panel-${panel.id}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `panel-${panel.id}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      // Restore any removed font links
      for (const { parent, link, next } of removedFontLinks) {
        try {
          parent.insertBefore(link, next || null);
        } catch (_) {}
      }
      try { if (root) root.unmount(); } catch (_) {}
      try { if (tempDiv && tempDiv.parentNode) tempDiv.parentNode.removeChild(tempDiv); } catch (_) {}
    }
  };

  const handleCreateNew = () => {
    createNewPanel();
  };

  const handleCreateStyle = async () => {
    if (!selectedPanel) return;
    try {
      setCreatingStyle(true);
      const prompt = `${selectedPanel?.metadata?.imagePrompt || 'comic panel'} | style: ${newStyleName || 'variant'}`;
      const imageUrl = await generateImage(prompt);
      addPanelStyle(selectedPanel.id, { name: newStyleName || 'Variant', image: imageUrl });
      setNewStyleName('');
    } catch (e) {
      console.error('Failed to create style', e);
    } finally {
      setCreatingStyle(false);
    }
  };

  // --- Import panels from local files ---
  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e) => {
    setImporting(true);
    try {
      const files = Array.from(e.target.files || []);
      const toAdd = [];
      let failed = 0;

      const readAsDataURL = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
      const readAsText = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      });

      for (const file of files) {
        if (file.type && file.type.startsWith('image/')) {
          const dataUrl = await readAsDataURL(file);
          if (dataUrl) {
            toAdd.push({ image: dataUrl, metadata: { sceneTitle: file.name.replace(/\.[^.]+$/, '') } });
          } else {
            failed++;
          }
        } else if (file.name.toLowerCase().endsWith('.json') || (file.type && file.type.includes('json'))) {
          const text = await readAsText(file);
          if (!text) { failed++; continue; }
          try {
            const json = JSON.parse(text);
            const arr = Array.isArray(json) ? json : (json.savedPanels || json.panels || (json.image ? [json] : []));
            if (Array.isArray(arr)) {
              toAdd.push(...arr);
            } else {
              failed++;
            }
          } catch (_) {
            failed++;
          }
        } else {
          failed++;
        }
      }

      if (toAdd.length) addSavedPanels(toAdd);
      if (e?.target) e.target.value = '';
      const note = `Imported ${toAdd.length} panel(s)` + (failed ? `, ${failed} failed` : '');
      try { window.alert(note); } catch (_) { console.log(note); }
    } finally {
      setImporting(false);
    }
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Panel Manager
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".json,image/*"
            onChange={handleFilesSelected}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={handleImportClick}
            disabled={importing}
          >
            {importing ? 'Importing…' : 'Import Panels'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}
          >
            New Panel
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setAiOpen(true)}
            sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)' }}
          >
            AI Studio Pro
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Video Pipeline</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                size="small"
                fullWidth
                label="Webhook URL (Zapier/Make)"
                placeholder="https://hook.integromat.com/..."
                value={pipelineSettings.webhookUrl || ''}
                onChange={(e) => setPipelineSettings({ webhookUrl: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Target</InputLabel>
                <Select
                  label="Target"
                  value={pipelineSettings.target || 'veo'}
                  onChange={(e) => setPipelineSettings({ target: e.target.value })}
                >
                  <MenuItem value="veo">Veo</MenuItem>
                  <MenuItem value="fliki">Fliki</MenuItem>
                  <MenuItem value="nanobanana">Nano Banana</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!pipelineSettings.autoSendOnSave}
                    onChange={(e) => setPipelineSettings({ autoSendOnSave: e.target.checked })}
                  />
                }
                label="Auto-send on Save"
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  const rows = normalizeAllToClips();
                  downloadCsv(rows, 'chronicles23-clips.csv');
                }}
              >
                Export CSV (All Panels)
              </Button>
              <Button
                variant="contained"
                disabled={!selectedPanel}
                onClick={() => { if (selectedPanel) sendPanelToPipeline(selectedPanel); }}
              >
                Send Selected Panel Now
              </Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={savedPanels.length === 0}
                onClick={() => sendAllToPipeline()}
              >
                Send All Panels Now
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Character Voice Mapping</Typography>
            <Grid container spacing={1}>
              {uniqueCharacters.map(name => (
                <Grid item xs={12} sm={6} md={4} key={name}>
                  <TextField
                    size="small"
                    fullWidth
                    label={`${name} → Voice_ID`}
                    value={voiceMap[name] || ''}
                    onChange={(e) => setVoiceMap({ [name]: e.target.value })}
                  />
                </Grid>
              ))}
              {uniqueCharacters.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">No dialogue characters detected yet.</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {savedPanels.length === 0 ? (
        <Card sx={{ textAlign: 'center', padding: '40px' }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No panels created yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '20px' }}>
              Create your first panel or upload a Word document to generate multiple panels
            </Typography>
            <Button variant="contained" onClick={handleCreateNew}>
              Create First Panel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 3 }}>
          {/* Left: Reorderable Panels List */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Panels</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {savedPanels.map((panel, index) => (
                  <Box
                    key={panel.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => { e.preventDefault(); setOverIndex(index); }}
                    onDrop={() => { if (dragIndex !== null) { reorderSavedPanels(dragIndex, index); setDragIndex(null); setOverIndex(null); }}}
                    onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                    onClick={() => setSelectedPanelId(panel.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1, p: 1, border: '1px solid', borderColor: (overIndex === index) ? 'primary.main' : '#e0e0e0', borderRadius: 1, cursor: 'pointer',
                      backgroundColor: selectedPanelId === panel.id ? 'rgba(25,118,210,0.06)' : 'transparent'
                    }}
                  >
                    <img src={panel.image} alt="thumb" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap>{panel.metadata?.sceneTitle || 'Panel'} {panel.metadata?.panelNumber || ''}</Typography>
                      <Typography variant="caption" color="text.secondary">{panel.id.slice(0,8)}</Typography>
                    </Box>
                    <Tooltip title="Preview"><span><IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePreview(panel); }}><VisibilityIcon fontSize="inherit" /></IconButton></span></Tooltip>
                    <Tooltip title="Export"><span><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleExport(panel); }}><DownloadIcon fontSize="inherit" /></IconButton></span></Tooltip>
                    <Tooltip title="Load for Editing"><span><IconButton size="small" onClick={(e) => { e.stopPropagation(); loadPanelForEditing(panel.id); }}><EditIcon fontSize="inherit" /></IconButton></span></Tooltip>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Right: Image Styles Column */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Image Styles</Typography>
              {!selectedPanel ? (
                <Typography color="text.secondary">Select a panel to manage its styles.</Typography>
              ) : (
                <>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField size="small" label="New style name" value={newStyleName} onChange={(e) => setNewStyleName(e.target.value)} />
                    <Button variant="contained" disabled={creatingStyle} onClick={handleCreateStyle}>{creatingStyle ? 'Creating…' : 'Create Style'}</Button>
                  </Box>

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Compare</Typography>
                  <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', p: 1, border: '1px solid #eee', borderRadius: 1, mb: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <img src={selectedPanel.image} alt="base" style={{ width: 200, height: 130, objectFit: 'cover', borderRadius: 6 }} />
                      <Typography variant="caption">Base</Typography>
                    </Box>
                    {(selectedPanel.styles || []).map(style => (
                      <Box key={style.id} sx={{ textAlign: 'center' }}>
                        <img src={style.image} alt={style.name} style={{ width: 200, height: 130, objectFit: 'cover', borderRadius: 6 }} />
                        <Typography variant="caption">{style.name}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>All Styles</Typography>
                  <Grid container spacing={2}>
                    {(selectedPanel.styles || []).map(style => (
                      <Grid item xs={12} sm={6} md={4} key={style.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ position: 'relative' }}>
                              <img src={style.image} alt={style.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }} />
                              <IconButton size="small" color="error" sx={{ position: 'absolute', top: 4, right: 4 }} onClick={() => removePanelStyle(selectedPanel.id, style.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>{style.name}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                    {(selectedPanel.styles || []).length === 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">No styles yet. Create one to compare variants.</Typography>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Live Style Preview</Typography>
                    <style>{`@keyframes kbZoom { 0% { transform: scale(1) translate(0,0);} 100% { transform: scale(1.1) translate(-10px, -6px);} }`}</style>
                    <Box sx={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden', borderRadius: 1, border: '1px solid #eee', mb: 1 }}>
                      <img src={selectedPanel.image} alt="live" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: liveFilterCss, animation: kenBurns ? 'kbZoom 10s ease-in-out infinite alternate' : 'none' }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {Object.keys(presets).map(name => (
                        <Chip key={name} label={name} size="small" color={livePreset === name ? 'primary' : 'default'} onClick={() => setLivePreset(name)} />
                      ))}
                    </Box>
                    <FormControlLabel control={<Switch checked={kenBurns} onChange={(e) => setKenBurns(e.target.checked)} />} label="Cinematic motion (Ken Burns)" />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Panel Preview</DialogTitle>
        <DialogContent>
          {selectedPanel && (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <ComicPanel panel={selectedPanel} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => selectedPanel && handleExport(selectedPanel)}
          >
            Export Panel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Panel Metadata</DialogTitle>
        <DialogContent>
          {editingPanel && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
              <TextField
                label="Scene Title"
                value={editingPanel.metadata?.sceneTitle || ''}
                fullWidth
                onChange={(e) => {
                  setEditingPanel({
                    ...editingPanel,
                    metadata: {
                      ...editingPanel.metadata,
                      sceneTitle: e.target.value
                    }
                  });
                }}
              />
              <TextField
                label="Panel Number"
                type="number"
                value={editingPanel.metadata?.panelNumber || ''}
                fullWidth
                onChange={(e) => {
                  setEditingPanel({
                    ...editingPanel,
                    metadata: {
                      ...editingPanel.metadata,
                      panelNumber: parseInt(e.target.value) || 1
                    }
                  });
                }}
              />
              <TextField
                label="Image Prompt"
                multiline
                rows={3}
                value={editingPanel.metadata?.imagePrompt || ''}
                fullWidth
                onChange={(e) => {
                  setEditingPanel({
                    ...editingPanel,
                    metadata: {
                      ...editingPanel.metadata,
                      imagePrompt: e.target.value
                    }
                  });
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            // TODO: Save edited panel
            setEditDialogOpen(false);
          }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Studio Dialog */}
      <Dialog
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>AI Studio Pro</DialogTitle>
        <DialogContent dividers>
          <AIStudio selectedPanelId={selectedPanel?.id} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PanelManager;

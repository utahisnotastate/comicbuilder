import React, { useState } from 'react';
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
  Add as AddIcon
} from '@mui/icons-material';
import { usePanelStore } from './store';
import ComicPanel from './ComicPanel';
import * as htmlToImage from 'html-to-image';
import { generateImage } from './utils/aiUtils';
import { createRoot } from 'react-dom/client';

const PanelManager = () => {
  const savedPanels = usePanelStore((state) => state.savedPanels);
  const loadPanelForEditing = usePanelStore((state) => state.loadPanelForEditing);
  const createNewPanel = usePanelStore((state) => state.createNewPanel);
  const reorderSavedPanels = usePanelStore((state) => state.reorderSavedPanels);
  const addPanelStyle = usePanelStore((state) => state.addPanelStyle);
  const removePanelStyle = usePanelStore((state) => state.removePanelStyle);

  const [selectedPanelId, setSelectedPanelId] = useState(savedPanels[0]?.id || null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);

  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const [newStyleName, setNewStyleName] = useState('');
  const [creatingStyle, setCreatingStyle] = useState(false);

  const selectedPanel = savedPanels.find(p => p.id === selectedPanelId) || savedPanels[0] || null;

  const handlePreview = (panel) => {
    setSelectedPanel(panel);
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
    try {
      // Create a temporary element for export and render the panel
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '700px';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      const root = createRoot(tempDiv);
      root.render(<ComicPanel panel={panel} exporting={true} />);
      await new Promise(requestAnimationFrame);

      const options = { cacheBust: true, pixelRatio: 3, backgroundColor: '#f4f1ea' };
      const blob = await htmlToImage.toBlob(tempDiv, options);

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
        const dataUrl = await htmlToImage.toPng(tempDiv, options);
        const link = document.createElement('a');
        link.download = `panel-${panel.id}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      root.unmount();
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Export failed:', error);
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

  return (
    <Box sx={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Panel Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}
        >
          New Panel
        </Button>
      </Box>

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
    </Box>
  );
};

export default PanelManager;

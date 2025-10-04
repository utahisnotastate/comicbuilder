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

const PanelManager = () => {
  const savedPanels = usePanelStore((state) => state.savedPanels);
  const loadPanelForEditing = usePanelStore((state) => state.loadPanelForEditing);
  const removeElement = usePanelStore((state) => state.removeElement);
  const createNewPanel = usePanelStore((state) => state.createNewPanel);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);

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
      // Create a temporary element for export
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '700px';
      tempDiv.style.height = 'auto';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Render the panel
      const panelElement = <ComicPanel panel={panel} />;
      // Note: This is a simplified approach - in a real app you'd use ReactDOM.render
      
      const dataUrl = await htmlToImage.toPng(tempDiv, { 
        cacheBust: true, 
        pixelRatio: 3,
        width: 700,
        height: 'auto'
      });
      
      const link = document.createElement('a');
      link.download = `panel-${panel.id}.png`;
      link.href = dataUrl;
      link.click();
      
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleCreateNew = () => {
    createNewPanel();
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
        <Grid container spacing={3}>
          {savedPanels.map((panel) => (
            <Grid item xs={12} md={6} lg={4} key={panel.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {panel.metadata?.sceneTitle || 'Panel'} {panel.metadata?.panelNumber || ''}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: '5px' }}>
                      <Tooltip title="Preview">
                        <IconButton size="small" onClick={() => handlePreview(panel)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(panel)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export">
                        <IconButton size="small" onClick={() => handleExport(panel)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(panel.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {panel.metadata?.imagePrompt && (
                    <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '10px' }}>
                      <strong>Image Prompt:</strong> {panel.metadata.imagePrompt}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <Chip label={`${panel.elements.filter(el => el.type === 'dialogue').length} Dialogue`} size="small" />
                    <Chip label={`${panel.elements.filter(el => el.type === 'tape').length} Tape`} size="small" />
                  </Box>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => loadPanelForEditing(panel.id)}
                    sx={{ marginTop: 'auto' }}
                  >
                    Load for Editing
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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

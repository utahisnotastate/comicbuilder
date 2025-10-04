import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Slider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  TextFields as TextIcon,
  GridOn as GridIcon,
  ViewInAr as ViewIcon,
  Palette as PaletteIcon,
  FormatSize as FormatSizeIcon,
  Layers as LayersIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { usePanelStore } from './store';

const ProjectComposer = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [pageSettings, setPageSettings] = useState({
    width: 8.5,
    height: 11,
    margin: 0.5,
    bleed: 0.125,
    resolution: 300
  });
  const [projectStyles, setProjectStyles] = useState({
    primaryFont: '"Special Elite", monospace',
    secondaryFont: '"Roboto", sans-serif',
    primaryColor: '#333333',
    secondaryColor: '#666666',
    accentColor: '#4CAF50'
  });

  const savedPanels = usePanelStore((state) => state.savedPanels);
  const [composedPages, setComposedPages] = useState([
    {
      id: 1,
      title: "Page 1",
      layout: "grid",
      panels: [1, 2, 3, 4],
      style: "comic"
    },
    {
      id: 2,
      title: "Page 2", 
      layout: "vertical",
      panels: [5, 6],
      style: "comic"
    }
  ]);

  const layouts = [
    { id: 'grid', name: 'Comic Grid', description: 'Traditional comic book layout', icon: <GridIcon /> },
    { id: 'vertical', name: 'Vertical Stack', description: 'Panels stacked vertically', icon: <ViewIcon /> },
    { id: 'horizontal', name: 'Horizontal Row', description: 'Panels in a single row', icon: <ViewIcon /> },
    { id: 'custom', name: 'Custom Layout', description: 'Create your own layout', icon: <SettingsIcon /> }
  ];

  const pageStyles = [
    { id: 'comic', name: 'Comic Book', description: 'Traditional comic book style' },
    { id: 'visual-novel', name: 'Visual Novel', description: 'Full-screen visual novel style' },
    { id: 'ebook', name: 'Ebook', description: 'Ebook with embedded images' },
    { id: 'graphic-novel', name: 'Graphic Novel', description: 'Sophisticated graphic novel style' }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreatePage = () => {
    const newPage = {
      id: Date.now(),
      title: `Page ${composedPages.length + 1}`,
      layout: selectedLayout,
      panels: [],
      style: 'comic'
    };
    setComposedPages([...composedPages, newPage]);
  };

  const renderPageComposer = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Page Composer
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreatePage}
          sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' }}
        >
          New Page
        </Button>
      </Box>

      <Grid container spacing={3}>
        {composedPages.map((page) => (
          <Grid item xs={12} md={6} lg={4} key={page.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {page.title}
                  </Typography>
                  <Chip 
                    label={layouts.find(l => l.id === page.layout)?.name} 
                    size="small" 
                    color="primary"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '15px' }}>
                  Style: {pageStyles.find(s => s.id === page.style)?.name}
                </Typography>

                <Box sx={{ 
                  height: '200px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px',
                  border: '2px dashed #ccc'
                }}>
                  <Typography color="text.secondary">
                    {page.panels.length} panels
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
                  <Button variant="outlined" size="small" startIcon={<VisibilityIcon />}>
                    Preview
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                    Export
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderLayoutDesigner = () => (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        Layout Designer
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Canvas Preview
              </Typography>
              <Box sx={{ 
                height: '500px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #ccc'
              }}>
                <Typography color="text.secondary">
                  Layout Preview Area
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Layout Options
              </Typography>
              
              <Stack spacing={2}>
                {layouts.map((layout) => (
                  <Paper 
                    key={layout.id}
                    sx={{ 
                      padding: '15px', 
                      cursor: 'pointer',
                      border: selectedLayout === layout.id ? '2px solid #2196F3' : '1px solid #e0e0e0',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                    onClick={() => setSelectedLayout(layout.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      {layout.icon}
                      <Typography variant="subtitle2">{layout.name}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {layout.description}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderProjectStyles = () => (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        Project-Wide Styles
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FormatSizeIcon color="primary" />
                Typography
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <FormControl fullWidth>
                  <InputLabel>Primary Font</InputLabel>
                  <Select
                    value={projectStyles.primaryFont}
                    label="Primary Font"
                    onChange={(e) => setProjectStyles({ ...projectStyles, primaryFont: e.target.value })}
                  >
                    <MenuItem value='"Special Elite", monospace'>Typewriter</MenuItem>
                    <MenuItem value='"Roboto", sans-serif'>Clean Sans-Serif</MenuItem>
                    <MenuItem value='"Georgia", serif'>Classic Serif</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Secondary Font</InputLabel>
                  <Select
                    value={projectStyles.secondaryFont}
                    label="Secondary Font"
                    onChange={(e) => setProjectStyles({ ...projectStyles, secondaryFont: e.target.value })}
                  >
                    <MenuItem value='"Special Elite", monospace'>Typewriter</MenuItem>
                    <MenuItem value='"Roboto", sans-serif'>Clean Sans-Serif</MenuItem>
                    <MenuItem value='"Georgia", serif'>Classic Serif</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PaletteIcon color="primary" />
                Color Scheme
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <TextField
                  label="Primary Color"
                  type="color"
                  value={projectStyles.primaryColor}
                  onChange={(e) => setProjectStyles({ ...projectStyles, primaryColor: e.target.value })}
                  fullWidth
                />

                <TextField
                  label="Secondary Color"
                  type="color"
                  value={projectStyles.secondaryColor}
                  onChange={(e) => setProjectStyles({ ...projectStyles, secondaryColor: e.target.value })}
                  fullWidth
                />

                <TextField
                  label="Accent Color"
                  type="color"
                  value={projectStyles.accentColor}
                  onChange={(e) => setProjectStyles({ ...projectStyles, accentColor: e.target.value })}
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderExportSettings = () => (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        Export Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Page Dimensions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <TextField
                  label="Width (inches)"
                  type="number"
                  value={pageSettings.width}
                  onChange={(e) => setPageSettings({ ...pageSettings, width: parseFloat(e.target.value) })}
                  fullWidth
                />

                <TextField
                  label="Height (inches)"
                  type="number"
                  value={pageSettings.height}
                  onChange={(e) => setPageSettings({ ...pageSettings, height: parseFloat(e.target.value) })}
                  fullWidth
                />

                <TextField
                  label="Margin (inches)"
                  type="number"
                  value={pageSettings.margin}
                  onChange={(e) => setPageSettings({ ...pageSettings, margin: parseFloat(e.target.value) })}
                  fullWidth
                />

                <TextField
                  label="Bleed (inches)"
                  type="number"
                  value={pageSettings.bleed}
                  onChange={(e) => setPageSettings({ ...pageSettings, bleed: parseFloat(e.target.value) })}
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Options
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <Box>
                  <Typography gutterBottom>Resolution: {pageSettings.resolution} DPI</Typography>
                  <Slider
                    value={pageSettings.resolution}
                    onChange={(e, value) => setPageSettings({ ...pageSettings, resolution: value })}
                    min={150}
                    max={600}
                    step={50}
                    marks={[
                      { value: 150, label: '150' },
                      { value: 300, label: '300' },
                      { value: 600, label: '600' }
                    ]}
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Export Format</InputLabel>
                  <Select label="Export Format" defaultValue="png">
                    <MenuItem value="png">PNG (High Quality)</MenuItem>
                    <MenuItem value="pdf">PDF (Print Ready)</MenuItem>
                    <MenuItem value="epub">EPUB (Ebook)</MenuItem>
                    <MenuItem value="renpy">RenPy (Visual Novel)</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  fullWidth
                  sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}
                >
                  Export All Pages
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        Project Composer
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ marginBottom: '30px' }}>
        <Tab label="Page Composer" />
        <Tab label="Layout Designer" />
        <Tab label="Project Styles" />
        <Tab label="Export Settings" />
      </Tabs>

      {activeTab === 0 && renderPageComposer()}
      {activeTab === 1 && renderLayoutDesigner()}
      {activeTab === 2 && renderProjectStyles()}
      {activeTab === 3 && renderExportSettings()}
    </Box>
  );
};

export default ProjectComposer;

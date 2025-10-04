// src/ControlPanel.jsx
import React, { useState } from 'react';
import { usePanelStore } from './store';
import { parseDialogueText, generateTapePositions, generateDialoguePositions } from './utils/dialogueParser';
import { 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Paper, 
  Typography, 
  Box,
  TextField,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  Collapse
} from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import ImageIcon from '@mui/icons-material/Image';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const paperTextures = {
  'Subtle Paper': 'url("https://www.transparenttextures.com/patterns/paper.png")',
  'Clean White': 'none',
  'Dark Grid': 'url("https://www.transparenttextures.com/patterns/dark-denim-3.png")',
  'Old Parchment': 'url("https://www.transparenttextures.com/patterns/old-parchment.png")',
};

const fonts = {
  'Typewriter': '"Special Elite", monospace',
  'Clean Sans-Serif': '"Roboto", sans-serif',
  'Classic Serif': '"Georgia", serif',
};

const ControlPanel = ({ onExport }) => {
  const addElement = usePanelStore((state) => state.addElement);
  const updatePanelStyle = usePanelStore((state) => state.updatePanelStyle);
  const saveActivePanel = usePanelStore((state) => state.saveActivePanel);
  const undo = usePanelStore((state) => state.undo);
  const redo = usePanelStore((state) => state.redo);
  const activePanel = usePanelStore((state) => state.activePanel);
  const updateElement = usePanelStore((state) => state.updateElement);
  const generatePanelsFromDocument = usePanelStore((state) => state.generatePanelsFromDocument);
  const generatePreview = usePanelStore((state) => state.generatePreview);

  const [dialogueText, setDialogueText] = useState('');
  const [showDialogueInput, setShowDialogueInput] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updatePanelStyle({ image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateFromText = () => {
    if (!dialogueText.trim()) return;
    
    const parsedDialogue = parseDialogueText(dialogueText);
    if (parsedDialogue.length === 0) return;

    // Clear existing elements
    const newElements = [];
    
    // Generate tape elements (for the image)
    const tapeElements = generateTapePositions(parsedDialogue.length, 660, 400);
    newElements.push(...tapeElements);
    
    // Generate dialogue elements (below the image)
    const dialogueElements = generateDialoguePositions(parsedDialogue, 700, 400);
    newElements.push(...dialogueElements);
    
    // Update the panel with new elements
    updatePanelStyle({ elements: newElements });
    
    // Clear the input
    setDialogueText('');
    setShowDialogueInput(false);
  };

  const handleGeneratePreview = () => {
    // This will trigger a preview generation with current settings
    // The preview will be automatically generated when both image and dialogue are present
    console.log('Generating preview with current panel settings...');
  };

  const handleWordDocumentUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      parseWordDocument(text);
    };
    reader.readAsText(file);
  };

  const parseWordDocument = (text) => {
    // Parse the structured document format
    const scenes = [];
    const sceneRegex = /Scene\s*(\d+)?:\s*(.+?)(?=Scene\s*\d+:|$)/gs;
    const panelRegex = /Panel\s*(\d+)\s*\nImage Prompt:\s*(.+?)\nImage:\s*(.+?)\nDialogue:\s*(.+?)(?=Panel\s*\d+:|$)/gs;
    
    let sceneMatch;
    while ((sceneMatch = sceneRegex.exec(text)) !== null) {
      const sceneTitle = sceneMatch[2].trim();
      const sceneContent = sceneMatch[0];
      
      const panels = [];
      let panelMatch;
      while ((panelMatch = panelRegex.exec(sceneContent)) !== null) {
        const panelNumber = panelMatch[1];
        const imagePrompt = panelMatch[2].trim();
        const imageDescription = panelMatch[3].trim();
        const dialogueText = panelMatch[4].trim();
        
        panels.push({
          panelNumber: parseInt(panelNumber),
          imagePrompt,
          imageDescription,
          dialogueText,
          parsedDialogue: parseDialogueText(dialogueText)
        });
      }
      
      if (panels.length > 0) {
        scenes.push({
          title: sceneTitle,
          panels
        });
      }
    }
    
    console.log('Parsed scenes:', scenes);
    // Generate panels from parsed data
    generatePanelsFromDocumentData(scenes);
  };

  const generatePanelsFromDocumentData = (scenes) => {
    // Generate panels for each scene/panel combination
    const generatedPanels = [];
    
    scenes.forEach(scene => {
      scene.panels.forEach(panel => {
        const newPanel = {
          id: `scene-${scenes.indexOf(scene)}-panel-${panel.panelNumber}`,
          image: activePanel.image, // Use current image or placeholder
          paperTexture: activePanel.paperTexture,
          font: activePanel.font,
          elements: [],
          metadata: {
            sceneTitle: scene.title,
            panelNumber: panel.panelNumber,
            imagePrompt: panel.imagePrompt,
            imageDescription: panel.imageDescription
          }
        };
        
        // Generate tape elements
        const tapeElements = generateTapePositions(panel.parsedDialogue.length, 660, 400);
        newPanel.elements.push(...tapeElements);
        
        // Generate dialogue elements
        const dialogueElements = generateDialoguePositions(panel.parsedDialogue, 700, 400);
        newPanel.elements.push(...dialogueElements);
        
        generatedPanels.push(newPanel);
      });
    });
    
    console.log('Generated panels:', generatedPanels);
    // Add to saved panels using the store
    generatePanelsFromDocument(generatedPanels);
  };

  return (
    <Box sx={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card */}
      <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ padding: '20px' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Comic Builder
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Create professional comic panels with taped transcripts
          </Typography>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AutoAwesomeIcon color="primary" />
            Quick Actions
          </Typography>
          
          <Box sx={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <Tooltip title="Undo">
              <IconButton onClick={undo} color="primary" variant="outlined">
                <UndoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Redo">
              <IconButton onClick={redo} color="primary" variant="outlined">
                <RedoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save Panel">
              <IconButton onClick={saveActivePanel} color="secondary" variant="outlined">
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Button 
            variant="contained" 
            startIcon={<TextSnippetIcon />}
            onClick={() => setShowDialogueInput(!showDialogueInput)}
            fullWidth
            sx={{ marginBottom: '15px' }}
          >
            Generate from Text
          </Button>

          <Collapse in={showDialogueInput}>
            <Box sx={{ marginBottom: '15px' }}>
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Paste dialogue here...&#10;Example:&#10;Utah: Then the generals went to Caltech. They hired Caltech to create the harrier jet.&#10;Utah: The harrier jet was to make what was known today as VTOL.&#10;Utah: You know those initial UFOs? The flying saucer?&#10;Utah: Those were just planes with VTOL."
                value={dialogueText}
                onChange={(e) => setDialogueText(e.target.value)}
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleGenerateFromText}
                disabled={!dialogueText.trim()}
                fullWidth
                sx={{ marginTop: '10px' }}
              >
                Generate Transcript
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleGeneratePreview}
                disabled={!activePanel.elements.length || !activePanel.image}
                fullWidth
                sx={{ marginTop: '10px' }}
                startIcon={<AutoAwesomeIcon />}
              >
                Generate Preview
              </Button>
            </Box>
          </Collapse>

          <Divider sx={{ margin: '15px 0' }} />

          <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              startIcon={<AddCommentIcon />} 
              onClick={() => addElement('dialogue')}
              size="small"
            >
              Dialogue
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<NoteAddIcon />} 
              onClick={() => addElement('tape')}
              size="small"
            >
              Tape
            </Button>
          </Box>
        </CardContent>
      </Card>

          {/* Image Upload */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon color="primary" />
                Image
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button variant="outlined" component="span" fullWidth>
                  Upload Background Image
                </Button>
              </label>
            </CardContent>
          </Card>

          {/* Word Document Upload */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TextSnippetIcon color="primary" />
                Batch Panel Generation
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: '15px', color: 'text.secondary' }}>
                Upload a Word document with structured panel data to generate multiple panels automatically.
              </Typography>
              <input
                accept=".doc,.docx,.txt"
                style={{ display: 'none' }}
                id="word-upload"
                type="file"
                onChange={handleWordDocumentUpload}
              />
              <label htmlFor="word-upload">
                <Button variant="outlined" component="span" fullWidth>
                  Upload Word Document
                </Button>
              </label>
              <Typography variant="caption" sx={{ display: 'block', marginTop: '10px', color: 'text.secondary' }}>
                Format: Scene: Title, Panel 1, Image Prompt: ..., Image: ..., Dialogue: ...
              </Typography>
            </CardContent>
          </Card>

      {/* Advanced Settings */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <Typography variant="h6">Advanced Settings</Typography>
            <IconButton onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={showAdvanced}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <FormControl fullWidth>
                <InputLabel id="font-select-label">Font Style</InputLabel>
                <Select
                  labelId="font-select-label"
                  value={activePanel.font}
                  label="Font Style"
                  onChange={(e) => updatePanelStyle({ font: e.target.value })}
                >
                  {Object.entries(fonts).map(([name, value]) => (
                    <MenuItem key={name} value={value}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="texture-select-label">Paper Texture</InputLabel>
                <Select
                  labelId="texture-select-label"
                  value={activePanel.paperTexture}
                  label="Paper Texture"
                  onChange={(e) => updatePanelStyle({ paperTexture: e.target.value })}
                >
                  {Object.entries(paperTextures).map(([name, value]) => (
                    <MenuItem key={name} value={value}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Export */}
      <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Export Panel
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: '15px' }}>
            Generate high-resolution image for InDesign
          </Typography>
          <Button 
            variant="contained" 
            color="inherit"
            fullWidth 
            onClick={onExport}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              }
            }}
          >
            Generate Panel Image
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ControlPanel;

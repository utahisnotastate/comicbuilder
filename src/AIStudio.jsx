import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Image as ImageIcon,
  TextFields as TextIcon,
  Palette as PaletteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { generateImage, trainStyleModel, generateVideoPreviewFromImage } from './utils/aiUtils';
import { CircularProgress } from '@mui/material';
import { usePanelStore } from './store';

const AIStudio = ({ selectedPanelId = null, onApplyImage = null } = {}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [imagePrompt, setImagePrompt] = useState('');
  const [textPrompt, setTextPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [imageQuality, setImageQuality] = useState(75);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generatedTexts, setGeneratedTexts] = useState([]);
  const [styleTransferDialog, setStyleTransferDialog] = useState(false);
  const [batchGenerateDialog, setBatchGenerateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [styleImages, setStyleImages] = useState([]);

  // Video settings
  const [videoSourceUrl, setVideoSourceUrl] = useState('');
  const [videoAspect, setVideoAspect] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState(4);
  const [videoZoom, setVideoZoom] = useState(1.2);
  const [videoDirection, setVideoDirection] = useState('pan-right');
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState(null);

  // Store hooks for applying to panel
  const updateSavedPanelImage = usePanelStore((s) => s.updateSavedPanelImage);
  const setActivePanelImage = usePanelStore((s) => s.setActivePanelImage);

  const applyImageToPanel = (url) => {
    if (!url) return;
    if (typeof onApplyImage === 'function') return onApplyImage(url);
    if (selectedPanelId) return updateSavedPanelImage(selectedPanelId, url);
    return setActivePanelImage(url);
  };

  const styles = [
    { id: 'realistic', name: 'Realistic', description: 'Photorealistic images' },
    { id: 'comic', name: 'Comic Book', description: 'Traditional comic book style' },
    { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
    { id: 'watercolor', name: 'Watercolor', description: 'Soft watercolor painting' },
    { id: 'oil', name: 'Oil Painting', description: 'Classical oil painting style' },
    { id: 'sketch', name: 'Sketch', description: 'Pencil sketch style' }
  ];

  const characterPrompts = [
    "A young man in his 20s with short brown hair, wearing a casual button-up shirt, looking determined",
    "An older military officer in uniform, stern expression, sitting behind a desk",
    "A mysterious figure in a hooded cloak, glowing eyes, standing in shadows",
    "A beautiful woman with long dark hair, wearing a business suit, confident posture"
  ];

  const backgroundPrompts = [
    "A futuristic briefing room with holographic displays and sleek metal surfaces",
    "A cosmic courtroom with celestial beings on thrones made of galaxies",
    "A medieval battlefield with knights and dramatic lighting",
    "A modern city skyline at sunset with glass buildings reflecting light"
  ];

  const dialoguePrompts = [
    "Generate dialogue for a character discovering a shocking truth",
    "Create a conversation between two characters about a difficult decision",
    "Write dialogue for a character explaining their supernatural abilities",
    "Generate a tense exchange between a protagonist and antagonist"
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTrainStyle = async () => {
    // In a real application, you would get the images from a file input
    const loraModel = await trainStyleModel(styleImages);
    console.log('Trained LoRA model:', loraModel);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setLoading(true);
    const imageUrl = await generateImage(imagePrompt, {
      style: selectedStyle,
      quality: imageQuality,
      width: 1024,
      height: 1024,
    });

    const newImage = {
      id: Date.now(),
      prompt: imagePrompt,
      style: selectedStyle,
      quality: imageQuality,
      timestamp: new Date().toLocaleString(),
      url: imageUrl
    };

    const next = [newImage, ...generatedImages];
    setGeneratedImages(next);
    if (!videoSourceUrl) setVideoSourceUrl(imageUrl);
    setImagePrompt('');
    setLoading(false);
  };

  useEffect(() => {
    if (generatedImages.length && !videoSourceUrl) {
      setVideoSourceUrl(generatedImages[0].url);
    }
  }, [generatedImages]);

  const handleGenerateText = () => {
    if (!textPrompt.trim()) return;

    const newText = {
      id: Date.now(),
      prompt: textPrompt,
      content: `Generated text based on: "${textPrompt}"\n\nThis is a sample generated response. In a real implementation, this would be generated by an AI service like OpenAI's GPT or similar.\n\nThe AI would analyze the prompt and generate contextually appropriate dialogue, narrative, or other text content based on the specific requirements.`,
      timestamp: new Date().toLocaleString()
    };

    setGeneratedTexts([newText, ...generatedTexts]);
    setTextPrompt('');
  };

  const handleQuickPrompt = (prompt, type) => {
    if (type === 'image') {
      setImagePrompt(prompt);
    } else {
      setTextPrompt(prompt);
    }
  };

  const renderImageGeneration = () => (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        Image Generation
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate New Image
              </Typography>

              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Describe the image you want to generate..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                sx={{ marginBottom: '20px' }}
              />

              <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Art Style</InputLabel>
                    <Select
                      value={selectedStyle}
                      label="Art Style"
                      onChange={(e) => setSelectedStyle(e.target.value)}
                    >
                      {styles.map((style) => (
                        <MenuItem key={style.id} value={style.id}>
                          {style.name} - {style.description}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Quality: {imageQuality}%</Typography>
                  <Slider
                    value={imageQuality}
                    onChange={(e, value) => setImageQuality(value)}
                    min={25}
                    max={100}
                    step={25}
                    marks={[
                      { value: 25, label: 'Fast' },
                      { value: 50, label: 'Balanced' },
                      { value: 75, label: 'High' },
                      { value: 100, label: 'Ultra' }
                    ]}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={handleGenerateImage}
                  disabled={!imagePrompt.trim() || loading}
                  sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate Image'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => setImagePrompt('')}
                >
                  Clear
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ marginBottom: '20px' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Train Style Model
                </Typography>
                <input
                    type="file"
                    multiple
                    onChange={(e) => setStyleImages(Array.from(e.target.files))}
                />
                <Button onClick={handleTrainStyle}>Train Style</Button>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ color: 'white', marginBottom: '15px' }}>
            Quick Prompts
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: '15px' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Character Prompts
                </Typography>
                {characterPrompts.map((prompt, index) => (
                  <Chip
                    key={index}
                    label={prompt}
                    onClick={() => handleQuickPrompt(prompt, 'image')}
                    sx={{ margin: '5px', cursor: 'pointer' }}
                    size="small"
                  />
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: '15px' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Background Prompts
                </Typography>
                {backgroundPrompts.map((prompt, index) => (
                  <Chip
                    key={index}
                    label={prompt}
                    onClick={() => handleQuickPrompt(prompt, 'image')}
                    sx={{ margin: '5px', cursor: 'pointer' }}
                    size="small"
                  />
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ color: 'white', marginBottom: '15px' }}>
            Generated Images
          </Typography>
          <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
            {generatedImages.map((image) => (
              <Card key={image.id} sx={{ marginBottom: '10px' }}>
                <CardContent>
                  <img
                    src={image.url}
                    alt="Generated"
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ marginTop: '10px' }}>
                    {image.timestamp}
                  </Typography>
                  <Typography variant="body2" sx={{ marginTop: '5px', fontSize: '0.8rem' }}>
                    {image.prompt}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                    <Chip label={styles.find(s => s.id === image.style)?.name} size="small" />
                    <Chip label={`${image.quality}%`} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                    <Tooltip title="Save to Assets">
                      <IconButton size="small" onClick={() => console.log('Save to assets not implemented yet')}>
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton size="small" onClick={() => {
                        const a = document.createElement('a');
                        a.href = image.url;
                        a.download = `ai-image-${image.id}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Use in Panel">
                      <IconButton size="small" onClick={() => applyImageToPanel(image.url)}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTextGeneration = () => (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        Text Generation
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate Text Content
              </Typography>

              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Describe what kind of text you want to generate (dialogue, narrative, character backstory, etc.)..."
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                sx={{ marginBottom: '20px' }}
              />

              <Box sx={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="contained"
                  startIcon={<TextIcon />}
                  onClick={handleGenerateText}
                  disabled={!textPrompt.trim()}
                  sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' }}
                >
                  Generate Text
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => setTextPrompt('')}
                >
                  Clear
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ color: 'white', marginBottom: '15px' }}>
            Quick Prompts
          </Typography>
          <Paper sx={{ padding: '15px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Dialogue Prompts
            </Typography>
            {dialoguePrompts.map((prompt, index) => (
              <Chip
                key={index}
                label={prompt}
                onClick={() => handleQuickPrompt(prompt, 'text')}
                sx={{ margin: '5px', cursor: 'pointer' }}
                size="small"
              />
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ color: 'white', marginBottom: '15px' }}>
            Generated Text
          </Typography>
          <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
            {generatedTexts.map((text) => (
              <Card key={text.id} sx={{ marginBottom: '10px' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    {text.timestamp}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>
                    {text.content}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '5px' }}>
                    <Tooltip title="Save to Dialogue Library">
                      <IconButton size="small">
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Use in Script">
                      <IconButton size="small">
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStyleTransfer = () => (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        Style Transfer
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Apply Consistent Style
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '20px' }}>
            Apply a consistent artistic style across all your generated or uploaded images to maintain visual coherence throughout your project.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ marginBottom: '20px' }}>
                <InputLabel>Target Style</InputLabel>
                <Select
                  value={selectedStyle}
                  label="Target Style"
                  onChange={(e) => setSelectedStyle(e.target.value)}
                >
                  {styles.map((style) => (
                    <MenuItem key={style.id} value={style.id}>
                      {style.name} - {style.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Apply to all project images"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Preview Style
              </Typography>
              <Box sx={{
                width: '100%',
                height: '200px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #ccc'
              }}>
                <Typography color="text.secondary">
                  Style Preview
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            startIcon={<PaletteIcon />}
            sx={{ background: 'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)' }}
          >
            Apply Style Transfer
          </Button>
        </CardContent>
      </Card>
    </Box>
  );

  const handleGenerateVideo = async () => {
    if (!videoSourceUrl) return;
    setVideoGenerating(true);
    setVideoResult(null);

    const aspect = videoAspect;
    let w = 1280, h = 720;
    if (aspect === '9:16') { w = 720; h = 1280; }
    if (aspect === '1:1') { w = 1024; h = 1024; }

    let panX = 0, panY = 0;
    if (videoDirection === 'pan-right') panX = 0.12;
    if (videoDirection === 'pan-left') panX = -0.12;
    if (videoDirection === 'pan-up') panY = -0.12;
    if (videoDirection === 'pan-down') panY = 0.12;

    try {
      const res = await generateVideoPreviewFromImage(videoSourceUrl, {
        width: w,
        height: h,
        fps: 30,
        durationSec: videoDuration,
        zoomStart: 1.02,
        zoomEnd: videoZoom,
        panX,
        panY,
      });
      setVideoResult(res);
    } catch (e) {
      console.error('Video preview generation failed', e);
    } finally {
      setVideoGenerating(false);
    }
  };

  const renderVideo = () => (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        Video Preview (AI Motion)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Source Image</Typography>
              <TextField
                fullWidth
                placeholder="Image URL (auto-filled from generated images)"
                value={videoSourceUrl}
                onChange={(e) => setVideoSourceUrl(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Aspect Ratio</InputLabel>
                    <Select value={videoAspect} label="Aspect Ratio" onChange={(e) => setVideoAspect(e.target.value)}>
                      <MenuItem value="16:9">16:9</MenuItem>
                      <MenuItem value="9:16">9:16</MenuItem>
                      <MenuItem value="1:1">1:1</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Motion</InputLabel>
                    <Select value={videoDirection} label="Motion" onChange={(e) => setVideoDirection(e.target.value)}>
                      <MenuItem value="pan-right">Pan Right</MenuItem>
                      <MenuItem value="pan-left">Pan Left</MenuItem>
                      <MenuItem value="pan-up">Pan Up</MenuItem>
                      <MenuItem value="pan-down">Pan Down</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Duration: {videoDuration}s</Typography>
                <Slider min={2} max={10} step={1} value={videoDuration} onChange={(e, v) => setVideoDuration(v)} />
                <Typography gutterBottom>Zoom End: {videoZoom.toFixed(2)}x</Typography>
                <Slider min={1.05} max={1.5} step={0.01} value={videoZoom} onChange={(e, v) => setVideoZoom(v)} />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button variant="contained" startIcon={<AutoAwesomeIcon />} disabled={!videoSourceUrl || videoGenerating} onClick={handleGenerateVideo}>
                  {videoGenerating ? <CircularProgress size={20} /> : 'Generate Preview'}
                </Button>
                <Button variant="outlined" onClick={() => setVideoResult(null)}>Clear</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Preview</Typography>
              {videoResult?.url ? (
                <>
                  <video src={videoResult.url} style={{ width: '100%', borderRadius: 6 }} controls />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => {
                      const a = document.createElement('a');
                      a.href = videoResult.url;
                      a.download = 'ai-preview.webm';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}>Download</Button>
                  </Box>
                </>
              ) : (
                <Box sx={{
                  width: '100%', height: 240, border: '2px dashed #ccc', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Typography color="text.secondary">No preview yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        AI Studio
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ marginBottom: '30px' }}>
        <Tab label="Image" />
        <Tab label="Text" />
        <Tab label="Style" />
        <Tab label="Video" />
      </Tabs>

      {activeTab === 0 && renderImageGeneration()}
      {activeTab === 1 && renderTextGeneration()}
      {activeTab === 2 && renderStyleTransfer()}
      {activeTab === 3 && renderVideo()}
    </Box>
  );
};

export default AIStudio;

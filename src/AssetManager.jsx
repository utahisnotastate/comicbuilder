import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Image as ImageIcon,
  MusicNote as MusicIcon,
  Folder as FolderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

const AssetManager = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [assetDialog, setAssetDialog] = useState(false);
  const [characterDialog, setCharacterDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [uploadType, setUploadType] = useState('face');

  const [characters, setCharacters] = useState([
    {
      id: 1,
      name: "Utah Hans",
      description: "Time traveler with synesthesia",
      category: "protagonist",
      expressions: [
        { id: 1, name: "Neutral", emotion: "neutral", image: "/api/placeholder/150/150" },
        { id: 2, name: "Serious", emotion: "serious", image: "/api/placeholder/150/150" },
        { id: 3, name: "Confused", emotion: "confused", image: "/api/placeholder/150/150" }
      ],
      clothing: [
        { id: 1, name: "Casual T-Shirt", category: "top", image: "/api/placeholder/150/150" },
        { id: 2, name: "Formal Suit", category: "formal", image: "/api/placeholder/150/150" },
        { id: 3, name: "Military Uniform", category: "military", image: "/api/placeholder/150/150" }
      ],
      poses: [
        { id: 1, name: "Standing", description: "Standard standing pose", image: "/api/placeholder/150/150" },
        { id: 2, name: "Sitting", description: "Sitting pose for dialogue", image: "/api/placeholder/150/150" },
        { id: 3, name: "Pointing", description: "Pointing gesture", image: "/api/placeholder/150/150" }
      ],
      accessories: [
        { id: 1, name: "Glasses", category: "eyewear", image: "/api/placeholder/100/100" },
        { id: 2, name: "Watch", category: "jewelry", image: "/api/placeholder/100/100" }
      ],
      faceImages: ["/api/placeholder/200/200", "/api/placeholder/200/200"],
      tags: ["protagonist", "time-traveler", "synesthesia"],
      starred: true,
      metadata: {
        created: "2024-01-15",
        lastModified: "2024-01-20",
        deepfakeReady: true,
        aiCompatible: true
      }
    },
    {
      id: 2,
      name: "Director",
      description: "Intelligence briefing officer",
      category: "supporting",
      expressions: [
        { id: 1, name: "Neutral", emotion: "neutral", image: "/api/placeholder/150/150" },
        { id: 2, name: "Concerned", emotion: "concerned", image: "/api/placeholder/150/150" }
      ],
      clothing: [
        { id: 1, name: "Military Uniform", category: "military", image: "/api/placeholder/150/150" }
      ],
      poses: [
        { id: 1, name: "Standing", description: "Standard standing pose", image: "/api/placeholder/150/150" },
        { id: 2, name: "Sitting", description: "Sitting pose for dialogue", image: "/api/placeholder/150/150" }
      ],
      accessories: [],
      faceImages: ["/api/placeholder/200/200"],
      tags: ["supporting", "military", "intelligence"],
      starred: false,
      metadata: {
        created: "2024-01-16",
        lastModified: "2024-01-18",
        deepfakeReady: true,
        aiCompatible: true
      }
    }
  ]);

  const [assets, setAssets] = useState([
    {
      id: 1,
      name: "Briefing Room",
      type: "Background",
      category: "Interior",
      tags: ["military", "office", "futuristic"],
      file: "briefing_room.jpg",
      starred: true,
      version: "v1.2"
    },
    {
      id: 2,
      name: "Cosmic Courtroom",
      type: "Background",
      category: "Fantasy",
      tags: ["cosmic", "courtroom", "celestial"],
      file: "cosmic_courtroom.jpg",
      starred: false,
      version: "v1.0"
    },
    {
      id: 3,
      name: "Tension Music",
      type: "Audio",
      category: "Music",
      tags: ["tense", "dramatic", "background"],
      file: "tension_music.mp3",
      starred: true,
      version: "v1.1"
    }
  ]);

  const [newCharacter, setNewCharacter] = useState({
    name: '',
    description: '',
    category: 'protagonist',
    expressions: [],
    outfits: [],
    poses: [],
    tags: []
  });

  const categories = [
    { id: 'protagonist', name: 'Protagonist', icon: '👤' },
    { id: 'antagonist', name: 'Antagonist', icon: '😈' },
    { id: 'supporting', name: 'Supporting', icon: '👥' },
    { id: 'background', name: 'Background', icon: '👤' }
  ];

  const clothingCategories = [
    { id: 'top', name: 'Tops', icon: '👕' },
    { id: 'bottom', name: 'Bottoms', icon: '👖' },
    { id: 'dress', name: 'Dresses', icon: '👗' },
    { id: 'formal', name: 'Formal Wear', icon: '🤵' },
    { id: 'casual', name: 'Casual Wear', icon: '👕' },
    { id: 'military', name: 'Military', icon: '🎖️' },
    { id: 'accessories', name: 'Accessories', icon: '👓' }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleContextMenu = (event, asset) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, asset });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleUploadImage = (type) => {
    setUploadType(type);
    setUploadDialog(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, this would upload to a server
      console.log(`Uploading ${uploadType} image:`, file.name);
      // For now, we'll just close the dialog
      setUploadDialog(false);
    }
  };

  const toggleStar = (id, type) => {
    if (type === 'character') {
      setCharacters(characters.map(char => 
        char.id === id ? { ...char, starred: !char.starred } : char
      ));
    } else {
      setAssets(assets.map(asset => 
        asset.id === id ? { ...asset, starred: !asset.starred } : asset
      ));
    }
  };

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAssets = assets.filter(asset =>
    (filterType === 'All' || asset.type === filterType) &&
    (asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const renderCharacterBuilder = () => {
    if (selectedCharacter) {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              {selectedCharacter.name} - Character Details
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setSelectedCharacter(null)}
              startIcon={<CloseIcon />}
            >
              Back to Characters
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ marginBottom: '20px' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    👤 Face Images
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '15px' }}>
                    Upload multiple face images for deepfake training. Include different angles, lighting, and expressions.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => handleUploadImage('face')}
                    sx={{ marginBottom: '15px' }}
                  >
                    Upload Face Images
                  </Button>
                  <Grid container spacing={2}>
                    {selectedCharacter.faceImages.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Paper sx={{ padding: '10px', textAlign: 'center' }}>
                          <img 
                            src={image} 
                            alt={`Face ${index + 1}`} 
                            style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <Typography variant="caption" sx={{ display: 'block', marginTop: '5px' }}>
                            Face {index + 1}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ marginBottom: '20px' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    👕 Clothing & Outfits
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '15px' }}>
                    Add different clothing items and outfits for character variation.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => handleUploadImage('clothing')}
                    sx={{ marginBottom: '15px' }}
                  >
                    Upload Clothing
                  </Button>
                  <Grid container spacing={2}>
                    {clothingCategories.map((category) => (
                      <Grid item xs={6} sm={4} md={3} key={category.id}>
                        <Paper sx={{ padding: '15px', textAlign: 'center', cursor: 'pointer' }}>
                          <Typography variant="h4" sx={{ marginBottom: '5px' }}>{category.icon}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', marginBottom: '5px' }}>
                            {category.name}
                          </Typography>
                          <Typography variant="h6">
                            {selectedCharacter.clothing.filter(item => item.category === category.id).length}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ marginBottom: '20px' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    😊 Expressions
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => handleUploadImage('expression')}
                    fullWidth
                    sx={{ marginBottom: '15px' }}
                  >
                    Upload Expression
                  </Button>
                  <Stack spacing={1}>
                    {selectedCharacter.expressions.map((expression) => (
                      <Box key={expression.id} sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar src={expression.image} sx={{ width: 40, height: 40 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2">{expression.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {expression.emotion}
                          </Typography>
                        </Box>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎭 Accessories
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => handleUploadImage('accessory')}
                    fullWidth
                    sx={{ marginBottom: '15px' }}
                  >
                    Upload Accessory
                  </Button>
                  <Stack spacing={1}>
                    {selectedCharacter.accessories.map((accessory) => (
                      <Box key={accessory.id} sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar src={accessory.image} sx={{ width: 40, height: 40 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2">{accessory.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {accessory.category}
                          </Typography>
                        </Box>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            Character Builder
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCharacterDialog(true)}
            sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}
          >
            New Character
          </Button>
        </Box>

        <Grid container spacing={3}>
          {filteredCharacters.map((character) => (
            <Grid item xs={12} md={6} lg={4} key={character.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 }
                }}
                onContextMenu={(e) => handleContextMenu(e, character)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ marginRight: '10px', bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {character.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => toggleStar(character.id, 'character')}
                    >
                      {character.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '15px' }}>
                    {character.description}
                  </Typography>

                  <Grid container spacing={1} sx={{ marginBottom: '15px' }}>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Faces</Typography>
                        <Typography variant="h6">{character.faceImages.length}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Clothes</Typography>
                        <Typography variant="h6">{character.clothing.length}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Expressions</Typography>
                        <Typography variant="h6">{character.expressions.length}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Poses</Typography>
                        <Typography variant="h6">{character.poses.length}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ marginBottom: '15px' }}>
                    <Typography variant="caption" color="success.main" display="block" gutterBottom>
                      ✅ Deepfake Ready • AI Compatible
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    {character.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<VisibilityIcon />}
                      onClick={() => setSelectedCharacter(character)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => setSelectedCharacter(character)}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderAssetLibrary = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Asset Library
        </Typography>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={filterType}
              label="Filter Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Background">Backgrounds</MenuItem>
              <MenuItem value="Audio">Audio</MenuItem>
              <MenuItem value="Prop">Props</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialog(true)}
            sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}
          >
            Upload Asset
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredAssets.map((asset) => (
          <Grid item xs={12} md={6} lg={4} key={asset.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }}
              onContextMenu={(e) => handleContextMenu(e, asset)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {asset.type === 'Background' && <ImageIcon sx={{ marginRight: '10px', color: 'primary.main' }} />}
                    {asset.type === 'Audio' && <MusicIcon sx={{ marginRight: '10px', color: 'primary.main' }} />}
                    {asset.type === 'Prop' && <FolderIcon sx={{ marginRight: '10px', color: 'primary.main' }} />}
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {asset.name}
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={() => toggleStar(asset.id, 'asset')}
                  >
                    {asset.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '10px' }}>
                  {asset.type} • {asset.category} • v{asset.version}
                </Typography>

                <Box sx={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
                  {asset.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
                  <Button variant="outlined" size="small" startIcon={<VisibilityIcon />}>
                    Preview
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderVersionControl = () => (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        Version Control
      </Typography>

      <Paper sx={{ padding: '20px' }}>
        <Typography variant="h6" gutterBottom>
          Recent Changes
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Briefing Room Background"
              secondary="Updated lighting and added new camera angles"
            />
            <ListItemSecondaryAction>
              <Chip label="v1.2" size="small" />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Utah Character Model"
              secondary="Added new expressions and outfit variations"
            />
            <ListItemSecondaryAction>
              <Chip label="v2.1" size="small" />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Tension Music Track"
              secondary="Extended duration and improved audio quality"
            />
            <ListItemSecondaryAction>
              <Chip label="v1.1" size="small" />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Asset Manager
        </Typography>
        <TextField
          size="small"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ marginRight: '10px', color: 'text.secondary' }} />
          }}
          sx={{ width: '300px' }}
        />
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ marginBottom: '30px' }}>
        <Tab label="Character Builder" />
        <Tab label="Asset Library" />
        <Tab label="Version Control" />
      </Tabs>

      {activeTab === 0 && renderCharacterBuilder()}
      {activeTab === 1 && renderAssetLibrary()}
      {activeTab === 2 && renderVersionControl()}

      {/* Character Dialog */}
      <Dialog open={characterDialog} onClose={() => setCharacterDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Character</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
            <TextField
              label="Character Name"
              value={newCharacter.name}
              onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              value={newCharacter.description}
              onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newCharacter.category}
                label="Category"
                onChange={(e) => setNewCharacter({ ...newCharacter, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Typography>{category.icon}</Typography>
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Tags (comma-separated)"
              value={newCharacter.tags.join(', ')}
              onChange={(e) => setNewCharacter({ 
                ...newCharacter, 
                tags: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCharacterDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Character</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Image</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '20px' }}>
            Upload images for {uploadType} training. Supported formats: JPG, PNG, WebP
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => document.getElementById('file-upload').click()}
            fullWidth
          >
            Choose File
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCloseContextMenu}>
          <VisibilityIcon sx={{ marginRight: '10px' }} />
          Preview
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <EditIcon sx={{ marginRight: '10px' }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <DownloadIcon sx={{ marginRight: '10px' }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ marginRight: '10px' }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AssetManager;

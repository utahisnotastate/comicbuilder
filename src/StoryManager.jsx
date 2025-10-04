import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  Divider,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const StoryManager = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "The Chronicles of Utah",
      type: "Comic Book",
      status: "In Progress",
      lastModified: "2024-01-15",
      scenes: [
        { id: 1, title: "Scene 1: The Beginning", characters: ["Utah", "Director"], dialogueCount: 15 },
        { id: 2, title: "Scene 2: The Revelation", characters: ["Utah", "Universe", "God"], dialogueCount: 23 }
      ]
    }
  ]);
  const [characters, setCharacters] = useState([
    { id: 1, name: "Utah", description: "Time traveler with synesthesia", appearances: 5 },
    { id: 2, name: "Director", description: "Intelligence briefing officer", appearances: 3 },
    { id: 3, name: "Universe", description: "Cosmic entity", appearances: 2 }
  ]);
  const [dialogueLibrary, setDialogueLibrary] = useState([
    { id: 1, character: "Utah", text: "So basically, whenever a National Security issue should arise...", scene: "Scene 1" },
    { id: 2, character: "Director", text: "Who?", scene: "Scene 1" },
    { id: 3, character: "Utah", text: "Mostly criminals pretending to be the Israeli Government.", scene: "Scene 1" }
  ]);
  
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [newCharacterDialog, setNewCharacterDialog] = useState(false);
  const [scriptEditor, setScriptEditor] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', type: 'Comic Book', description: '' });
  const [newCharacter, setNewCharacter] = useState({ name: '', description: '' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateProject = () => {
    const project = {
      id: Date.now(),
      ...newProject,
      status: "New",
      lastModified: new Date().toISOString().split('T')[0],
      scenes: []
    };
    setProjects([...projects, project]);
    setNewProjectDialog(false);
    setNewProject({ title: '', type: 'Comic Book', description: '' });
  };

  const handleCreateCharacter = () => {
    const character = {
      id: Date.now(),
      ...newCharacter,
      appearances: 0
    };
    setCharacters([...characters, character]);
    setNewCharacterDialog(false);
    setNewCharacter({ name: '', description: '' });
  };

  const renderProjects = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewProjectDialog(true)}
          sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}
        >
          New Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {project.title}
                  </Typography>
                  <Chip 
                    label={project.status} 
                    size="small" 
                    color={project.status === 'In Progress' ? 'primary' : 'default'}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '10px' }}>
                  Type: {project.type}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '15px' }}>
                  Last Modified: {project.lastModified}
                </Typography>

                <Box sx={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
                  <Chip label={`${project.scenes.length} Scenes`} size="small" />
                  <Chip label={`${project.scenes.reduce((acc, scene) => acc + scene.dialogueCount, 0)} Dialogue`} size="small" />
                </Box>
                
                <Box sx={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
                  <Button variant="outlined" size="small" startIcon={<VisibilityIcon />}>
                    View
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<EditIcon />}>
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

  const renderScriptEditor = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Script Editor
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' }}
        >
          Save Script
        </Button>
      </Box>

      <Paper sx={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h6" gutterBottom>
          Scene 1: The Beginning
        </Typography>
        <TextField
          multiline
          rows={15}
          fullWidth
          placeholder="INT. BRIEFING ROOM - DAY

UTAH
My name is Utah Hans, and I have suffered from a very specific form of synesthesia. You know how Kanye can see music or whatever? I can see National Security issues and can talk to them to fix them.

DIRECTOR
Who?

UTAH
Mostly criminals pretending to be the Israeli Government.

DIRECTOR
Why?

UTAH
They're trying to cover up their history. In WWII, criminals within the Israeli military got the rest of the world to lie, saying their people were being killed because of their faith."
          variant="outlined"
          sx={{ fontFamily: 'monospace' }}
        />
      </Paper>

      <Box sx={{ display: 'flex', gap: '10px' }}>
        <Button variant="outlined" startIcon={<AddIcon />}>
          Add Scene
        </Button>
        <Button variant="outlined" startIcon={<FolderIcon />}>
          Import Script
        </Button>
        <Button variant="outlined" startIcon={<DescriptionIcon />}>
          Export Script
        </Button>
      </Box>
    </Box>
  );

  const renderCharacters = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Character Tracking
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewCharacterDialog(true)}
          sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}
        >
          New Character
        </Button>
      </Box>

      <Grid container spacing={3}>
        {characters.map((character) => (
          <Grid item xs={12} md={6} lg={4} key={character.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <PersonIcon sx={{ marginRight: '10px', color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {character.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '10px' }}>
                  {character.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label={`${character.appearances} Appearances`} size="small" />
                  <Box>
                    <Tooltip title="Edit Character">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Character">
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderDialogueLibrary = () => (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
        Dialogue Library
      </Typography>

      <Paper sx={{ maxHeight: '600px', overflow: 'auto' }}>
        <List>
          {dialogueLibrary.map((dialogue) => (
            <React.Fragment key={dialogue.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Chip label={dialogue.character} size="small" color="primary" />
                      <Typography variant="body1">
                        {dialogue.text}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      From: {dialogue.scene}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Use in Panel">
                    <IconButton size="small">
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ marginBottom: '30px' }}>
        <Tab label="Projects" />
        <Tab label="Script Editor" />
        <Tab label="Characters" />
        <Tab label="Dialogue Library" />
      </Tabs>

      {activeTab === 0 && renderProjects()}
      {activeTab === 1 && renderScriptEditor()}
      {activeTab === 2 && renderCharacters()}
      {activeTab === 3 && renderDialogueLibrary()}

      {/* New Project Dialog */}
      <Dialog open={newProjectDialog} onClose={() => setNewProjectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
            <TextField
              label="Project Title"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Project Type"
              select
              value={newProject.type}
              onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
              fullWidth
            >
              <option value="Comic Book">Comic Book</option>
              <option value="Visual Novel">Visual Novel</option>
              <option value="Ebook">Ebook</option>
              <option value="Graphic Novel">Graphic Novel</option>
            </TextField>
            <TextField
              label="Description"
              multiline
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewProjectDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateProject}>Create Project</Button>
        </DialogActions>
      </Dialog>

      {/* New Character Dialog */}
      <Dialog open={newCharacterDialog} onClose={() => setNewCharacterDialog(false)} maxWidth="sm" fullWidth>
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCharacterDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCharacter}>Create Character</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoryManager;

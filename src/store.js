// src/store.js
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Helper function for creating a new, blank panel
const createNewPanel = () => ({
  id: uuidv4(),
  image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iNjAwIiB5Mj0iNDAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2ZyB4PSIyMDAiIHk9IjE1MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiPgo8dGV4dCB4PSIxMDAiIHk9IjUwIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TYW1wbGUgQ29taWMgUGFuZWw8L3RleHQ+Cjwvc3ZnPgo8L3N2Zz4K',
  paperTexture: 'url("https://www.transparenttextures.com/patterns/paper.png")',
  font: '"Special Elite", monospace',
  elements: [], // Start with no elements for a cleaner UX
});

// Simplified history implementation
let history = [];
let historyIndex = -1;
const maxHistorySize = 50;

const saveToHistory = (state) => {
  const stateCopy = JSON.parse(JSON.stringify(state));
  history = history.slice(0, historyIndex + 1);
  history.push(stateCopy);
  if (history.length > maxHistorySize) {
    history.shift();
  } else {
    historyIndex++;
  }
};

const undo = () => {
  if (historyIndex > 0) {
    historyIndex--;
    return history[historyIndex];
  }
  return null;
};

const redo = () => {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    return history[historyIndex];
  }
  return null;
};

export const usePanelStore = create((set, get) => ({
  // STATE
  savedPanels: [],
  activePanel: createNewPanel(),

  // ACTIONS
  setActivePanel: (panel) => {
    set({ activePanel: panel });
  },
  
  saveActivePanel: () => {
    const state = get();
    const existingIndex = state.savedPanels.findIndex(p => p.id === state.activePanel.id);
    
    let updatedPanels;
    if (existingIndex !== -1) {
      // If panel already exists, update it
      updatedPanels = [...state.savedPanels];
      updatedPanels[existingIndex] = state.activePanel;
    } else {
      // Otherwise, add it as a new saved panel
      updatedPanels = [...state.savedPanels, state.activePanel];
    }
    
    set({ savedPanels: updatedPanels });
  },

  loadPanelForEditing: (panelId) => {
    const state = get();
    const panelToLoad = state.savedPanels.find(p => p.id === panelId) || createNewPanel();
    set({ activePanel: JSON.parse(JSON.stringify(panelToLoad)) }); // Deep copy
  },

  createNewPanel: () => {
    set({ activePanel: createNewPanel() });
  },

  updateElement: (elementId, newProps) => {
    const state = get();
    set({
      activePanel: {
        ...state.activePanel,
        elements: state.activePanel.elements.map(el =>
          el.id === elementId ? { ...el, ...newProps } : el
        ),
      },
    });
  },

  addElement: (type) => {
    const state = get();
    const newElement = {
      id: uuidv4(),
      type,
      position: { x: 50, y: 50 },
      size: type === 'dialogue' ? { width: 250, height: 'auto' } : { width: 150, height: 30 },
      rotation: type === 'dialogue' ? -1 : -10,
      ...(type === 'dialogue' && { character: 'CHARACTER', dialogue: 'Your text here...' }),
    };
    
    set({
      activePanel: {
        ...state.activePanel,
        elements: [...state.activePanel.elements, newElement],
      },
    });
  },

  removeElement: (elementId) => {
    const state = get();
    set({
      activePanel: {
        ...state.activePanel,
        elements: state.activePanel.elements.filter(el => el.id !== elementId),
      },
    });
  },

  updatePanelStyle: (styleProps) => {
    const state = get();
    set({
      activePanel: {
        ...state.activePanel,
        ...styleProps,
      },
    });
  },

      // Simplified history actions
      undo: () => {
        const previousState = undo();
        if (previousState) {
          set(previousState);
        }
      },

      redo: () => {
        const nextState = redo();
        if (nextState) {
          set(nextState);
        }
      },

      // Batch panel generation from document
      generatePanelsFromDocument: (panels) => {
        const state = get();
        const newPanels = panels.map(panel => ({
          ...panel,
          id: panel.id || uuidv4(),
        }));
        
        set({ 
          savedPanels: [...state.savedPanels, ...newPanels],
          activePanel: newPanels[0] || state.activePanel // Set first panel as active
        });
      },

      // Preview generation
      generatePreview: () => {
        const state = get();
        // This will be handled by the UI to show a preview
        return state.activePanel;
      },
}));

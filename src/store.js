// src/store.js
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { panelToClipRows, panelsToClipRows } from './utils/aiUtils';
import { generateDialogue } from './utils/llmUtils';
import { captionImage } from './utils/visionUtils';

// Helper function for creating a new, blank panel
const createNewPanel = () => ({
  id: uuidv4(),
  image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iNjAwIiB5Mj0iNDAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2ZyB4PSIyMDAiIHk9IjE1MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiPgo8dGV4dCB4PSIxMDAiIHk9IjUwIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TYW1wbGUgQ29taWMgUGFuZWw8L3RleHQ+Cjwvc3ZnPgo8L3N2Zz4K',
  paperTexture: 'url("https://www.transparenttextures.com/patterns/paper.png")',
  font: '"Special Elite", monospace',
  elements: [], // Start with no elements for a cleaner UX
  styles: [], // Per-panel style variants
});

// Normalize any externally provided panel-like object to our schema
const normalizeImportedPanel = (obj) => {
  if (!obj) return null;
  const normalized = {
    id: obj.id || uuidv4(),
    image: obj.image || obj.preview || obj.src || '',
    paperTexture: obj.paperTexture || 'url("https://www.transparenttextures.com/patterns/paper.png")',
    font: obj.font || '"Special Elite", monospace',
    elements: Array.isArray(obj.elements) ? obj.elements : [],
    styles: Array.isArray(obj.styles) ? obj.styles : [],
    metadata: obj.metadata || {},
  };
  return normalized.image ? normalized : null;
};

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
  pipelineSettings: { webhookUrl: '', autoSendOnSave: false, target: 'veo' },
  voiceMap: {},
  story: { theme: '', logline: '', beats: [], characters: [] },
  characterRegistry: [],
  feedback: { images: {}, texts: {} },

  // ACTIONS
  setActivePanel: (panel) => {
    set({ activePanel: panel });
  },

  saveActivePanel: async () => {
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

    // Auto-send to pipeline if enabled
    const { autoSendOnSave, webhookUrl } = get().pipelineSettings || {};
    if (autoSendOnSave && webhookUrl) {
      try {
        await get().sendPanelToPipeline(state.activePanel);
      } catch (e) {
        console.warn('Auto-send failed:', e);
      }
    }
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
      zIndex: type === 'tape' ? 200 : 100,
      ...(type === 'tape' && { color: 'rgba(0, 0, 0, 0.6)' }),
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

  // --- Video Pipeline settings & helpers ---
  setPipelineSettings: (settings) => {
    const current = get().pipelineSettings || {};
    set({ pipelineSettings: { ...current, ...settings } });
  },

  setVoiceMap: (map) => {
    const current = get().voiceMap || {};
    set({ voiceMap: { ...current, ...map } });
  },

  normalizePanelToClips: (panel) => {
    const state = get();
    return panelToClipRows(panel || state.activePanel, state.voiceMap);
  },

  normalizeAllToClips: () => {
    const state = get();
    return panelsToClipRows(state.savedPanels, state.voiceMap);
  },

  sendPanelToPipeline: async (panel) => {
    const state = get();
    const { webhookUrl, target } = state.pipelineSettings || {};
    if (!webhookUrl) return { ok: false, reason: 'no_webhook' };
    const rows = panelToClipRows(panel || state.activePanel, state.voiceMap);
    if (!rows.length) return { ok: false, reason: 'no_rows' };
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: target || 'veo', rows })
    });
    let data = null; try { data = await res.json(); } catch (_) {}
    return { ok: res.ok, status: res.status, data };
  },

  sendAllToPipeline: async () => {
    const state = get();
    const { webhookUrl, target } = state.pipelineSettings || {};
    if (!webhookUrl) return { ok: false, reason: 'no_webhook' };
    const rows = panelsToClipRows(state.savedPanels, state.voiceMap);
    if (!rows.length) return { ok: false, reason: 'no_rows' };
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: target || 'veo', rows })
    });
    let data = null; try { data = await res.json(); } catch (_) {}
    return { ok: res.ok, status: res.status, data };
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

      // Reorder saved panels
      reorderSavedPanels: (fromIndex, toIndex) => {
        const state = get();
        const panels = [...state.savedPanels];
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= panels.length || toIndex >= panels.length) return;
        const [moved] = panels.splice(fromIndex, 1);
        panels.splice(toIndex, 0, moved);
        set({ savedPanels: panels });
      },

      // Add a style variant to a panel
      addPanelStyle: (panelId, style) => {
        const state = get();
        const panels = state.savedPanels.map(p => {
          if (p.id !== panelId) return p;
          const nextStyles = Array.isArray(p.styles) ? [...p.styles] : [];
          nextStyles.push({ id: style.id || uuidv4(), name: style.name || 'Style', image: style.image });
          return { ...p, styles: nextStyles };
        });
        set({ savedPanels: panels });
      },

      // Remove a style variant from a panel
      removePanelStyle: (panelId, styleId) => {
        const state = get();
        const panels = state.savedPanels.map(p => {
          if (p.id !== panelId) return p;
          const nextStyles = (p.styles || []).filter(s => s.id !== styleId);
          return { ...p, styles: nextStyles };
        });
        set({ savedPanels: panels });
      },

      // Append externally imported panels
      addSavedPanels: (panels) => {
        const state = get();
        const arr = Array.isArray(panels) ? panels : [panels];
        const normalized = arr.map(normalizeImportedPanel).filter(Boolean);
        if (!normalized.length) return;
        set({ savedPanels: [...state.savedPanels, ...normalized] });
      },

      // Update an image on a saved panel by id
      updateSavedPanelImage: (panelId, imageUrl) => {
        const state = get();
        const panels = state.savedPanels.map(p => (p.id === panelId ? { ...p, image: imageUrl } : p));
        set({ savedPanels: panels });
        // If active panel matches, mirror the change
        if (state.activePanel && state.activePanel.id === panelId) {
          set({ activePanel: { ...state.activePanel, image: imageUrl } });
        }
      },

      // Update active panel image
      setActivePanelImage: (imageUrl) => {
        const state = get();
        if (!state.activePanel) return;
        set({ activePanel: { ...state.activePanel, image: imageUrl } });
      },

      // --- Storytelling state & actions ---
      setStory: (updates) => {
        const state = get();
        const next = { ...(state.story || {}), ...(updates || {}) };
        set({ story: next });
      },

      upsertCharacter: (character) => {
        const state = get();
        const arr = Array.isArray(state.characterRegistry) ? [...state.characterRegistry] : [];
        const idx = arr.findIndex(c => c.id === character.id || c.name?.toLowerCase() === character.name?.toLowerCase());
        if (idx >= 0) {
          arr[idx] = { ...arr[idx], ...character };
        } else {
          arr.push({ id: character.id || uuidv4(), ...character });
        }
        set({ characterRegistry: arr });
      },

      rateGeneratedAsset: ({ type, id, like, notes }) => {
        const state = get();
        const fb = state.feedback || { images: {}, texts: {} };
        if (type === 'image') fb.images[id] = { like: !!like, notes: notes || '' };
        if (type === 'text') fb.texts[id] = { like: !!like, notes: notes || '' };
        set({ feedback: fb });
      },

      generatePanelsFromBeats: (beats = []) => {
        const state = get();
        const panels = (beats || []).map((b, i) => ({
          id: uuidv4(),
          image: '',
          paperTexture: 'url("https://www.transparenttextures.com/patterns/paper.png")',
          font: '"Special Elite", monospace',
          elements: [],
          styles: [],
          metadata: {
            sceneTitle: b.title || `Beat ${i + 1}`,
            panelNumber: i + 1,
            imagePrompt: b.imagePrompt || b.summary || 'comic panel'
          },
        }));
        set({ savedPanels: [...state.savedPanels, ...panels], activePanel: panels[0] || state.activePanel });
      },

      generateDialogueForPanel: async (panelId) => {
        const state = get();
        const panel = state.savedPanels.find(p => p.id === panelId) || state.activePanel;
        if (!panel) return;
        let cap = '';
        try {
          if (panel.image) cap = await captionImage(panel.image);
        } catch (_) {}
        const lines = await generateDialogue({ panel, caption: cap });
        const withIds = lines.map(l => ({ id: uuidv4(), type: 'dialogue', character: l.character || 'CHARACTER', dialogue: l.dialogue || '' }));
        const nextPanel = { ...panel, elements: [...(panel.elements || []), ...withIds] };
        const panels = state.savedPanels.map(p => (p.id === nextPanel.id ? nextPanel : p));
        set({ savedPanels: panels, activePanel: state.activePanel?.id === nextPanel.id ? nextPanel : state.activePanel });
      },

      generateDialogueForAllPanels: async () => {
        const state = get();
        for (const p of state.savedPanels) {
          await get().generateDialogueForPanel(p.id);
        }
      },
}));

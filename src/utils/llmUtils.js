// src/utils/llmUtils.js
// Pluggable, browser-friendly LLM utilities with a solid local fallback.

const llmProviders = {};
let activeLLMProvider = 'local';

const ensureProvider = (name) => {
  if (!llmProviders[name]) throw new Error(`LLM provider not registered: ${name}`);
  return llmProviders[name];
};

export const registerLLMProvider = (name, api) => {
  // api: { brainstorm(theme, opts), dialogue(context) }
  llmProviders[name] = api;
};

export const setActiveLLMProvider = (name) => {
  activeLLMProvider = name;
};

export const getActiveLLMProvider = () => activeLLMProvider;

// --- Local fallback generator (deterministic-ish from input) ---
const hash = (s) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const pick = (arr, n) => {
  const res = [];
  let i = 0;
  while (res.length < n && i < arr.length) {
    res.push(arr[i]);
    i++;
  }
  return res;
};

const THEMES = {
  sci: {
    vibes: ['hopeful', 'mysterious', 'tense', 'grand'],
    settings: ['orbital station', 'dusty colony', 'neon megacity', 'ancient derelict ship'],
    prompts: ['cinematic sci‑fi', 'luminous control room', 'foggy docking bay', 'crowded bazaar under neon rain']
  },
  fantasy: {
    vibes: ['whimsical', 'ominous', 'heroic', 'tragic'],
    settings: ['mossy ruins', 'moonlit forest', 'castle keep', 'market at dawn'],
    prompts: ['high‑fantasy illustration', 'ethereal glade', 'torchlit hallway', 'storm over citadel']
  },
  noir: {
    vibes: ['moody', 'brooding', 'dangerous', 'intimate'],
    settings: ['rainy alley', 'smoky bar', 'police archive', 'rooftop skyline'],
    prompts: ['noir, high contrast', 'cigarette smoke and neon', 'shadows slicing blinds', 'lonely streetlamp']
  }
};

const localBrainstorm = async (theme = 'sci‑fi', opts = {}) => {
  const seed = hash((theme || '') + JSON.stringify(opts || {}));
  const themeKey = /fantasy/i.test(theme) ? 'fantasy' : /noir|detective/i.test(theme) ? 'noir' : 'sci';
  const bank = THEMES[themeKey];

  const vibe = bank.vibes[seed % bank.vibes.length];
  const settingA = bank.settings[(seed >> 3) % bank.settings.length];
  const settingB = bank.settings[(seed >> 5) % bank.settings.length];
  const basePrompt = bank.prompts[(seed >> 2) % bank.prompts.length];

  const logline = `A ${vibe} ${themeKey.replace('sci', 'sci‑fi')} tale set between ${settingA} and ${settingB}, where unlikely allies confront a truth larger than themselves.`;

  const characters = [
    {
      id: 'char-' + (seed % 1000),
      name: opts.heroName || 'Alex',
      bio: 'Reluctant protagonist with a sharp mind and a hidden past.',
      descriptors: ['determined', 'resourceful', settingA],
      token: '<AlexToken>'
    },
    {
      id: 'char-' + ((seed >> 4) % 1000),
      name: opts.partnerName || 'Rin',
      bio: 'Cynical insider who knows the system’s cracks.',
      descriptors: ['wry', 'street‑smart', settingB],
      token: '<RinToken>'
    }
  ];

  const beats = [
    { id: 'beat1', title: 'Inciting Spark', summary: `A clue surfaces in the ${settingA}.`, imagePrompt: `${basePrompt}, ${settingA}, dramatic lighting` },
    { id: 'beat2', title: 'Reluctant Allies', summary: `Alex and Rin form a fragile pact.`, imagePrompt: `${basePrompt}, two figures in tense discussion` },
    { id: 'beat3', title: 'Into the Maw', summary: `The pair ventures into ${settingB}.`, imagePrompt: `${basePrompt}, ${settingB}, looming danger` },
    { id: 'beat4', title: 'Revelation', summary: `A truth reframes the conflict.`, imagePrompt: `${basePrompt}, revelation, light cutting through shadows` }
  ];

  const sampleDialogues = [
    { character: 'Alex', line: 'We both know this doesn’t end well.' },
    { character: 'Rin', line: 'Maybe it doesn’t end. Maybe it changes.' }
  ];

  return { logline, beats, characters, sampleDialogues };
};

const localDialogue = async (context = {}) => {
  const { panel, caption } = context;
  const who = (panel?.elements || []).find(e => e.type === 'dialogue')?.character || 'Alex';
  const alt = who === 'Alex' ? 'Rin' : 'Alex';
  const desc = caption ? ` (${caption})` : '';
  return [
    { character: who, dialogue: `This feels wrong${desc}, but it’s the only way.` },
    { character: alt, dialogue: 'Then we make it right, one choice at a time.' }
  ];
};

registerLLMProvider('local', {
  brainstorm: localBrainstorm,
  dialogue: localDialogue,
});

export const generateStoryArtifacts = async (theme, opts = {}) => {
  const api = ensureProvider(activeLLMProvider);
  return api.brainstorm(theme, opts);
};

export const generateDialogue = async (context) => {
  const api = ensureProvider(activeLLMProvider);
  return api.dialogue(context);
};

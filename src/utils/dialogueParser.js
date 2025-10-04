// src/utils/dialogueParser.js

export const parseDialogueText = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const lines = text.split('\n').filter(line => line.trim());
  const dialogue = [];
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Match pattern: "Character: Dialogue text"
    const match = trimmedLine.match(/^([^:]+):\s*(.+)$/);
    
    if (match) {
      const [, character, dialogueText] = match;
      dialogue.push({
        character: character.trim(),
        dialogue: dialogueText.trim()
      });
    } else {
      // If no colon found, treat as continuation of previous dialogue
      if (dialogue.length > 0) {
        dialogue[dialogue.length - 1].dialogue += ' ' + trimmedLine;
      } else {
        // If it's the first line and no colon, treat as unnamed character
        dialogue.push({
          character: 'UNKNOWN',
          dialogue: trimmedLine
        });
      }
    }
  });
  
  return dialogue;
};

export const generateTapePositions = (dialogueCount, imageWidth = 660, imageHeight = 400) => {
  const tapes = [];
  const tapeWidth = 120;
  const tapeHeight = 30;
  
  // Generate tape positions only on the image area
  const positions = [
    { x: -15, y: -15, rotation: -8 },
    { x: imageWidth - tapeWidth + 15, y: -15, rotation: 8 },
    { x: -15, y: imageHeight - tapeHeight + 15, rotation: -8 },
    { x: imageWidth - tapeWidth + 15, y: imageHeight - tapeHeight + 15, rotation: 8 },
    { x: imageWidth / 2 - tapeWidth / 2, y: -15, rotation: 0 },
    { x: -15, y: imageHeight / 2 - tapeHeight / 2, rotation: -15 },
    { x: imageWidth - tapeWidth + 15, y: imageHeight / 2 - tapeHeight / 2, rotation: 15 },
    { x: imageWidth / 4, y: imageHeight / 4, rotation: 12 },
    { x: imageWidth * 3/4 - tapeWidth, y: imageHeight * 3/4 - tapeHeight, rotation: -12 },
  ];
  
  // Select random positions based on dialogue count (but limit to image area)
  const selectedPositions = positions.slice(0, Math.min(dialogueCount + 2, positions.length));
  
  selectedPositions.forEach((pos, index) => {
    tapes.push({
      id: `tape-${index}`,
      type: 'tape',
      position: { x: pos.x, y: pos.y },
      size: { width: tapeWidth, height: tapeHeight },
      rotation: pos.rotation,
      color: getRandomTapeColor()
    });
  });
  
  return tapes;
};

const getRandomTapeColor = () => {
  const colors = [
    'rgba(255, 220, 150, 0.7)', // Classic tape
    'rgba(255, 200, 120, 0.7)', // Slightly darker
    'rgba(255, 240, 180, 0.7)', // Lighter
    'rgba(240, 200, 140, 0.7)', // More yellow
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateDialoguePositions = (dialogue, panelWidth = 700, imageHeight = 400) => {
  return dialogue.map((item, index) => {
    const baseWidth = panelWidth - 40; // Full width minus padding
    const baseHeight = 'auto';
    
    // Position dialogue below the image
    const yPosition = imageHeight + 20 + (index * 60); // Start below image, stack vertically
    
    return {
      id: `dialogue-${index}`,
      type: 'dialogue',
      character: item.character,
      dialogue: item.dialogue,
      position: { x: 20, y: yPosition },
      size: { width: baseWidth, height: baseHeight },
      rotation: 0, // No rotation for clean transcript look
    };
  });
};

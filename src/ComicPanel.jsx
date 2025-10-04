// src/ComicPanel.jsx
import React from 'react';
import { Rnd } from 'react-rnd';
import { usePanelStore } from './store';

const styles = {
  wrapper: {
    border: '2px solid #333',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    position: 'relative',
    width: '700px',
    overflow: 'visible', // Allow content to extend beyond
    backgroundColor: '#f4f1ea',
    borderRadius: '8px',
    padding: '20px',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: '20px',
  },
  image: {
    display: 'block',
    width: '100%',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  dialogueBox: {
    backgroundColor: '#fff',
    padding: '15px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #ddd',
    borderRadius: '4px',
    textAlign: 'left',
    cursor: 'grab',
    position: 'relative',
    marginBottom: '10px',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  tape: {
    backgroundColor: 'rgba(255, 220, 150, 0.85)',
    boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
    border: '1px solid rgba(200, 150, 100, 0.8)',
    opacity: 0.9,
    cursor: 'grab',
    borderRadius: '2px',
    position: 'relative',
    '&:active': {
      cursor: 'grabbing',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)',
      borderRadius: '2px',
    },
  },
  characterName: {
    fontWeight: 'bold',
    marginBottom: '8px',
    fontSize: '16px',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dialogueText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#222',
    fontStyle: 'normal',
  },
};

const Element = ({ element }) => {
  const updateElement = usePanelStore((state) => state.updateElement);
  const removeElement = usePanelStore((state) => state.removeElement);
  const isTape = element.type === 'tape';

  const handleDragStop = React.useCallback((e, d) => {
    updateElement(element.id, { position: { x: d.x, y: d.y } });
  }, [element.id, updateElement]);

  const handleResizeStop = React.useCallback((e, direction, ref, delta, position) => {
    updateElement(element.id, {
      size: { width: ref.style.width, height: ref.style.height },
      position: { x: position.x, y: position.y },
    });
  }, [element.id, updateElement]);

  const handleDoubleClick = React.useCallback(() => {
    if (window.confirm('Delete this element?')) {
      removeElement(element.id);
    }
  }, [element.id, removeElement]);

  return (
    <Rnd
      size={{ width: element.size.width, height: element.size.height }}
      position={{ x: element.position.x, y: element.position.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={false}
      enableResizing={!isTape}
      onDoubleClick={handleDoubleClick}
      bounds="parent"
    >
      <div style={{
        ...(isTape ? styles.tape : styles.dialogueBox),
        transform: `rotate(${element.rotation}deg)`,
        fontFamily: usePanelStore.getState().activePanel.font,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        {!isTape && (
          <>
            <div style={styles.characterName}>{element.character}</div>
            <div style={styles.dialogueText}>{element.dialogue}</div>
          </>
        )}
      </div>
    </Rnd>
  );
};

const ComicPanel = React.forwardRef(({ panel: propPanel, ...props }, ref) => {
  const storePanel = usePanelStore((state) => state.activePanel);
  const panel = propPanel || storePanel;

  // Separate tape elements (for image) from dialogue elements (for below)
  const tapeElements = panel.elements.filter(el => el.type === 'tape');
  const dialogueElements = panel.elements.filter(el => el.type === 'dialogue');

  return (
    <div
      ref={ref}
      style={{
        ...styles.wrapper,
        backgroundImage: panel.paperTexture,
        fontFamily: panel.font,
      }}
    >
      {/* Image Container with Tape */}
      <div style={styles.imageContainer}>
        <img src={panel.image} alt="Comic panel background" style={styles.image} />
        {tapeElements.map(el => <Element key={el.id} element={el} />)}
      </div>
      
      {/* Dialogue Below Image */}
      {dialogueElements.map(el => <Element key={el.id} element={el} />)}
    </div>
  );
});

ComicPanel.displayName = 'ComicPanel';

export default ComicPanel;

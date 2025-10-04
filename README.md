# Comic Builder

A professional-grade React application for creating comic book panels with taped images and dialogue. Perfect for comic creators who want to generate print-ready assets for InDesign.

## Features

### Panel Editor
- **Interactive Elements**: Drag, drop, resize, and rotate dialogue boxes and tape
- **Customizable Styling**: Choose from different fonts and paper textures
- **Image Upload**: Upload your own images or use the built-in placeholder
- **History Management**: Undo/redo functionality for all changes
- **Save Panels**: Save your work to a library for later use

### Page Composer
- **Multiple Layouts**: Choose from 2x2 grid, top banner, single panel, or 3-panel strip layouts
- **Panel Assignment**: Drag saved panels to different slots on the page
- **Print-Ready Export**: Generate high-resolution images optimized for InDesign (300 DPI)

### Professional Export
- **High Resolution**: All exports are generated at 3x pixel ratio for crisp printing
- **InDesign Ready**: Standard comic page dimensions (6.625" x 10.25")
- **PNG Format**: Lossless format perfect for professional printing

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**: Navigate to `http://localhost:5173`

## Usage

### Creating a Panel
1. Switch to the "Panel Editor" tab
2. Upload an image using the "Upload Image" button
3. Add dialogue boxes and tape using the control buttons
4. Drag elements to position them
5. Resize dialogue boxes by dragging their corners
6. Double-click elements to delete them
7. Save your panel using the save button

### Composing a Page
1. Switch to the "Page Composer" tab
2. Choose a layout from the dropdown
3. Assign saved panels to slots by clicking the slot chips
4. Export the complete page for InDesign

## Technical Stack

- **React 19**: Latest React with modern features
- **Zustand**: Lightweight state management
- **Material-UI**: Professional UI components
- **React-RND**: Drag and drop functionality
- **HTML-to-Image**: High-quality image export
- **Vite**: Fast development and building

## File Structure

```
src/
├── App.jsx              # Main application with tabbed interface
├── Editor.jsx           # Panel editing workspace
├── PageComposer.jsx     # Page layout and composition
├── ComicPanel.jsx       # Interactive panel component
├── ControlPanel.jsx     # Editing controls and tools
├── store.js             # Zustand state management
└── components/
    └── SampleImage.jsx  # Placeholder image component
```

## Customization

### Adding New Fonts
Edit the `fonts` object in `ControlPanel.jsx`:
```javascript
const fonts = {
  'Your Font': '"Your Font Name", fallback',
  // ... existing fonts
};
```

### Adding New Paper Textures
Edit the `paperTextures` object in `ControlPanel.jsx`:
```javascript
const paperTextures = {
  'Your Texture': 'url("path/to/texture.png")',
  // ... existing textures
};
```

### Adding New Page Layouts
Edit the `layouts` object in `PageComposer.jsx`:
```javascript
const layouts = {
  'Your Layout': {
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: '1fr',
    gap: '15px',
    slots: 3,
  },
  // ... existing layouts
};
```

## Export Specifications

- **Single Panel**: 650px width, auto height, 3x pixel ratio
- **Full Page**: 1988px × 3075px (6.625" × 10.25" at 300 DPI)
- **Format**: PNG (lossless)
- **Color Space**: RGB
- **Background**: Paper texture or solid color

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
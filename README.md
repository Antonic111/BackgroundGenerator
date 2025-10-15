# OBS Background Generator

A modern, standalone background generator for OBS Studio built with React and optimized for performance.

## Features

- 🎮 **Game-Specific Presets**: Pre-configured settings for Pokemon, Zelda, Gooner, and Balls themes
- 🖼️ **Image Management**: Upload custom images or use built-in image sets
- ⚡ **Real-time Preview**: Live preview with smooth animations
- 💾 **Preset System**: Save and load custom configurations
- 🎨 **Advanced Controls**: Fine-tune animation, appearance, and effects
- 📱 **OBS Ready**: Export URLs for direct use in OBS Studio
- 🔧 **Standalone**: No external dependencies required

## Quick Start

### Development Mode

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

### Building for Production

1. Build the application:
```bash
npm run build
```

2. The built files will be in the `dist` folder

### Building Standalone Version

1. Build standalone HTML file:
```bash
npm run build-standalone
```

2. Use the generated HTML file directly in OBS Studio

## Usage

### Basic Usage

1. **Select a Preset**: Choose from Pokemon, Zelda, Gooner, or Balls presets
2. **Load Images**: Upload your own images or use the built-in sets
3. **Customize Settings**: Adjust animation speed, image size, colors, and effects
4. **Preview**: Use the Play/Pause button to see your background in action
5. **Export for OBS**: Click "Export for OBS" to get a URL for OBS Studio

### OBS Integration

1. In OBS Studio, add a "Browser Source"
2. Paste the exported URL
3. Set dimensions to 1920x1080 (or your preferred resolution)
4. Enable "Shutdown source when not visible" for better performance

### Preset Management

- **Save Current Settings**: Click "Save" in the Presets panel to create a custom preset
- **Export Presets**: Save your presets to a JSON file for backup
- **Import Presets**: Load presets from a JSON file
- **Delete Presets**: Remove custom presets (default presets cannot be deleted)

### Image Management

- **Upload Images**: Drag and drop or click to upload image files
- **Quick Load Sets**: Use pre-made image sets for different themes
- **Export Images**: Save your image collection as a JSON file
- **Base64 Embedding**: Images are converted to base64 for standalone operation

## Settings Reference

### Animation
- **Animation Speed**: Overall animation speed multiplier
- **Scroll Speed**: How fast images move horizontally
- **Image Count**: Number of images displayed
- **Line Count**: Number of horizontal lines

### Appearance
- **Image Size**: Size of individual images
- **Line Spacing**: Vertical spacing between lines
- **Image Spacing**: Horizontal spacing between images
- **Background Color**: Base background color
- **Uniform Size**: Make all images the same size

### Effects
- **Blur Amount**: CSS blur filter applied to the canvas
- **Canvas Rotation**: Rotate the entire canvas
- **Image Rotation Speed**: How fast images rotate
- **Image Tint Color**: Color overlay for images
- **Tint Intensity**: Strength of the color overlay

### Gradient
- **Gradient Type**: None, Linear, or Radial gradient
- **Gradient Direction**: Direction of linear gradient
- **Gradient Intensity**: Opacity of the gradient
- **Gradient Color 2**: Second color for the gradient

## Technical Details

- **Framework**: React 18 with Vite
- **Animation**: Framer Motion for smooth UI animations
- **Canvas**: HTML5 Canvas for high-performance rendering
- **Storage**: LocalStorage for settings and presets
- **Build**: Vite with single-file output for OBS compatibility

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

- Use fewer images (20-40) for better performance
- Enable "Shutdown source when not visible" in OBS
- Use uniform image sizes for consistent performance
- Consider using CSS blur instead of canvas blur for better performance

## Troubleshooting

### Images not loading
- Check that images are in supported formats (PNG, JPG, GIF, WebP)
- Ensure images are not too large (recommended: under 1MB each)

### Performance issues
- Reduce image count
- Use smaller image sizes
- Disable blur effects
- Close other browser tabs

### OBS integration issues
- Ensure the URL is accessible from OBS
- Check that OBS has internet access
- Try refreshing the browser source

## License

MIT License - feel free to use and modify as needed.

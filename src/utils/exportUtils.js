// Professional Export Utilities for Chronicle Crafter

export const exportFormats = {
  PNG: {
    name: 'PNG (High Quality)',
    description: 'High-resolution PNG images for print',
    resolution: 300,
    colorSpace: 'RGB',
    compression: 'lossless'
  },
  PDF: {
    name: 'PDF (Print Ready)',
    description: 'Professional PDF for commercial printing',
    resolution: 300,
    colorSpace: 'CMYK',
    compression: 'lossless'
  },
  EPUB: {
    name: 'EPUB (Ebook)',
    description: 'Reflowable ebook format',
    resolution: 150,
    colorSpace: 'RGB',
    compression: 'optimized'
  },
  RENPY: {
    name: 'RenPy (Visual Novel)',
    description: 'Visual novel engine format',
    resolution: 1920,
    colorSpace: 'RGB',
    compression: 'optimized'
  }
};

export const pageSizes = {
  'comic-book': { width: 6.625, height: 10.25, name: 'Comic Book' },
  'graphic-novel': { width: 7, height: 10, name: 'Graphic Novel' },
  'ebook': { width: 5.5, height: 8.5, name: 'Ebook' },
  'visual-novel': { width: 16, height: 9, name: 'Visual Novel (16:9)' },
  'custom': { width: 8.5, height: 11, name: 'Custom' }
};

export const calculateExportDimensions = (pageSize, resolution, format) => {
  const size = pageSizes[pageSize];
  const dpi = format === 'EPUB' ? 150 : resolution;
  
  return {
    width: Math.round(size.width * dpi),
    height: Math.round(size.height * dpi),
    dpi: dpi
  };
};

export const generatePNGExport = async (element, options = {}) => {
  const {
    width = 2100,
    height = 3000,
    dpi = 300,
    backgroundColor = '#ffffff',
    quality = 1.0
  } = options;

  try {
    const canvas = await htmlToImage.toCanvas(element, {
      width,
      height,
      backgroundColor,
      pixelRatio: dpi / 96, // Convert DPI to pixel ratio
      quality,
      cacheBust: true
    });

    return canvas.toDataURL('image/png', quality);
  } catch (error) {
    console.error('PNG export failed:', error);
    throw error;
  }
};

export const generatePDFExport = async (pages, options = {}) => {
  const {
    pageSize = 'comic-book',
    resolution = 300,
    margin = 0.5,
    bleed = 0.125
  } = options;

  // This would integrate with a PDF library like jsPDF
  // For now, we'll return a placeholder
  return {
    success: true,
    message: 'PDF export would be generated here',
    pages: pages.length,
    dimensions: calculateExportDimensions(pageSize, resolution, 'PDF')
  };
};

export const generateEPUBExport = async (content, options = {}) => {
  const {
    title = 'Chronicle Crafter Export',
    author = 'Unknown',
    language = 'en'
  } = options;

  // This would integrate with an EPUB generation library
  // For now, we'll return a placeholder
  return {
    success: true,
    message: 'EPUB export would be generated here',
    title,
    author,
    language
  };
};

export const generateRenPyExport = async (scenes, options = {}) => {
  const {
    projectName = 'chronicle_crafter_project',
    resolution = '1920x1080'
  } = options;

  // This would generate RenPy-compatible files
  // For now, we'll return a placeholder
  return {
    success: true,
    message: 'RenPy export would be generated here',
    projectName,
    resolution,
    scenes: scenes.length
  };
};

export const validateExportSettings = (settings) => {
  const errors = [];

  if (!settings.format) {
    errors.push('Export format is required');
  }

  if (!settings.pageSize) {
    errors.push('Page size is required');
  }

  if (settings.resolution < 150 || settings.resolution > 600) {
    errors.push('Resolution must be between 150 and 600 DPI');
  }

  if (settings.margin < 0 || settings.margin > 2) {
    errors.push('Margin must be between 0 and 2 inches');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getExportPreview = (settings) => {
  const dimensions = calculateExportDimensions(settings.pageSize, settings.resolution, settings.format);
  
  return {
    dimensions,
    fileSize: estimateFileSize(dimensions, settings.format),
    colorSpace: exportFormats[settings.format]?.colorSpace || 'RGB',
    compression: exportFormats[settings.format]?.compression || 'lossless'
  };
};

const estimateFileSize = (dimensions, format) => {
  const pixels = dimensions.width * dimensions.height;
  
  switch (format) {
    case 'PNG':
      return `${Math.round(pixels * 4 / 1024 / 1024)} MB`;
    case 'PDF':
      return `${Math.round(pixels * 3 / 1024 / 1024)} MB`;
    case 'EPUB':
      return `${Math.round(pixels * 2 / 1024 / 1024)} MB`;
    case 'RENPY':
      return `${Math.round(pixels * 2 / 1024 / 1024)} MB`;
    default:
      return 'Unknown';
  }
};

export const downloadFile = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const batchExport = async (items, format, options = {}) => {
  const results = [];
  
  for (let i = 0; i < items.length; i++) {
    try {
      let result;
      
      switch (format) {
        case 'PNG':
          result = await generatePNGExport(items[i], options);
          break;
        case 'PDF':
          result = await generatePDFExport([items[i]], options);
          break;
        case 'EPUB':
          result = await generateEPUBExport(items[i], options);
          break;
        case 'RENPY':
          result = await generateRenPyExport([items[i]], options);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      results.push({
        index: i,
        success: true,
        result
      });
    } catch (error) {
      results.push({
        index: i,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

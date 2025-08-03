export default {
  title: 'Personal Page Builder',
  core: {
    desc: 'Build and customize your personal page with ease'
  },
  layout: {
    author: {
      withLove: 'Made with love by',
      name: 'Bulygin Nikita',
      contacts: 'Contact Information',
      contactsDescription: 'Get in touch with me through any of these channels',
      copy: 'Copy'
    }
  },
  language: {
    selectTitle: 'Select Language',
    selectDescription: 'Choose your preferred language',
    selectLanguage: 'Select Language'
  },
  navigation: {
    show: 'Show navigation',
    hide: 'Hide navigation',
    title: 'Navigation'
  },
  editor: {
    title: 'Editor Controller',
    settings: 'Settings',
    currentFile: 'Current File',
    noFileSelected: 'No file selected',
    save: 'Save',
    saveChanges: 'Save Changes',
    clearCache: 'Clear Cache',
    clearCacheLoading: 'Clearing localStorage...',
    clearCacheSuccess: 'Cache cleared, reloading page...',
    clearCacheError: 'Failed to clear localStorage',
    preview: {
      show: 'Show preview',
      hide: 'Hide preview',
      toggle: 'Toggle preview'
    },
    split: {
      enable: 'Enable split screen',
      disable: 'Disable split screen',
      toggle: 'Toggle split screen'
    },
    theme: {
      light: 'Switch to light theme',
      dark: 'Switch to dark theme'
    },
    panels: {
      title: 'Panels',
      leftPanel: 'Left panel',
      rightPanel: 'Right panel',
      activePanel: 'Active panel',
      left: 'Left',
      right: 'Right',
      edit: 'Edit',
      preview: 'Preview'
    }
  },
  treeView: {
    loading: 'Loading...',
    error: 'Error loading content structure',
    createFile: {
      title: 'Create new file',
      description: 'Enter file name (only English letters, numbers, hyphens and underscores)',
      placeholder: 'my-new-file.md or folder/',
      create: 'Create',
      fileNameRequired: 'File name is required',
      invalidPath: 'Path must end with / (folder) or .md (file)',
      invalidCharacters: 'Path can only contain English letters, numbers, hyphens, underscores and /',
      fileExists: 'File or folder with this name already exists',
      success: 'File created successfully',
      error: 'Failed to create file'
    },
    rename: {
      title: 'Rename {type}',
      description: 'Enter new name for {type}',
      newName: 'New name',
      newNameRequired: 'New name is required',
      rename: 'Rename',
      cancel: 'Cancel',
      fullPath: 'Full path',
      type: 'Type',
      folder: 'Folder',
      file: 'File',
      success: 'Item renamed successfully',
      error: 'Failed to rename item'
    },
    delete: {
      title: 'Delete {type}',
      description: 'Are you sure you want to delete {type} "{name}"? This action cannot be undone.',
      delete: 'Delete',
      cancel: 'Cancel',
      warning: '⚠️ Warning!',
      folderWarning: 'This folder contains {count} file(s). When deleting a folder, all its contents will be permanently deleted.',
      fullPath: 'Full path',
      type: 'Type',
      success: 'Item deleted successfully',
      error: 'Failed to delete item'
    },
    actions: {
      create: 'Create new file',
      rename: 'Rename',
      delete: 'Delete',
      revertChanges: 'Revert changes',
      export: 'Export',
      import: 'Import'
    },
    status: {
      left: 'L',
      right: 'R',
      modified: 'M'
    },
    export: {
      title: 'Export Content',
      description: 'Export all markdown files as a ZIP archive',
      success: 'Content exported successfully',
      error: 'Failed to export content',
      downloading: 'Downloading archive...'
    },
    import: {
      title: 'Import Content',
      description: 'Import markdown files from ZIP archive. This will replace all existing content.',
      warning: '⚠️ Warning! This action will replace all existing content.',
      selectFile: 'Select ZIP file',
      success: 'Content imported successfully',
      error: 'Failed to import content',
      uploading: 'Uploading and processing...',
      importedCount: 'Imported {count} files'
    }
  },
  gallery: {
    title: 'Image Gallery',
    description: 'Upload and manage your images',
    loading: 'Loading images...',
    loadError: 'Failed to load images',
    retry: 'Try again',
    empty: {
      title: 'No images yet',
      description: 'Upload your first image to get started'
    },
    upload: {
      title: 'Upload Image',
      description: 'Drag and drop images here, or click to select files. You can also paste images from clipboard.',
      selectFile: 'Select files',
      uploading: 'Uploading...',
      dropHere: 'Drop images here to upload',
      success: 'Image uploaded successfully',
      successDescription: 'Your image has been uploaded and processed',
      error: 'Upload failed',
      errorDescription: 'Failed to upload image'
    },
    crop: {
      title: 'Crop Image',
      apply: 'Apply',
      cancel: 'Cancel',
      reset: 'Reset',
      size: 'Crop area size'
    },
    actions: {
      view: 'View full size',
      copy: 'Copy link',
      delete: 'Delete image'
    },
    copy: {
      success: 'Link copied',
      description: 'Image link copied to clipboard',
      error: 'Copy failed',
      errorDescription: 'Failed to copy link'
    },
    info: {
      size: 'File size',
      dimensions: 'Dimensions',
      uploaded: 'Uploaded'
    }
  },
  admin: {
    analytics: {
      title: 'Analytics',
      description: 'Statistics of visits and user actions',
      loading: 'Loading statistics...',
      error: 'Error loading statistics',
      retry: 'Try again',
      
      // General statistics
      generalStats: {
        title: 'General Statistics',
        uniqueVisitors: 'Unique Visitors',
        totalActions: 'Total Actions',
        actionTypes: 'Action Types'
      },
      
      // Detailed visit statistics
      detailedVisits: {
        title: 'Detailed Visit Statistics',
        period: 'Analysis Period',
        periodDescription: 'Last 30 days',
        daysWithData: 'days with data',
        averageDaily: 'Average visits per day',
        maxDaily: 'Maximum per day',
        totalVisits: 'Total visits',
        topDays: 'Top days by visits'
      },
      
      // Charts
      charts: {
        visitsTitle: 'Visits by Day',
        actionsTitle: 'Statistics by Action Types',
        visitsYAxis: 'Number of visits',
        actionsYAxis: 'Number of actions'
      },
      
      // Action statistics
      actionStats: {
        title: 'Action Statistics',
        pageViews: 'Page Views',
        imageLoads: 'Image Loads',
        buttonClicks: 'Button Clicks',
        linkClicks: 'Link Clicks'
      },
      
      // Top lists
      topLists: {
        pages: {
          title: 'Top Pages by Views',
          views: 'views'
        },
        images: {
          title: 'Top Images',
          loads: 'loads'
        },
        buttons: {
          title: 'Top Buttons by Clicks',
          clicks: 'clicks'
        },
        links: {
          title: 'Top Links by Clicks',
          clicks: 'clicks'
        }
      },
      
      // Formatting
      formatting: {
        visits: 'visits',
        actions: 'actions',
        views: 'views',
        loads: 'loads',
        clicks: 'clicks'
      }
    },
    gallery: {
      title: 'Gallery Management',
      description: 'Manage your image gallery with advanced tools',
      loading: 'Loading gallery...',
      loadError: 'Failed to load gallery',
      retry: 'Try again',
      empty: {
        title: 'Gallery is empty',
        description: 'Start by uploading some images'
      },
      upload: {
        title: 'Upload Images',
        uploading: 'Uploading images...',
        success: 'Images uploaded successfully',
        successDescription: 'Your images have been uploaded and processed',
        error: 'Upload failed',
        errorDescription: 'Failed to upload images'
      },
      delete: {
        title: 'Delete Image',
        deleting: 'Deleting image...',
        success: 'Image deleted successfully',
        successDescription: 'Image has been removed from gallery',
        error: 'Delete failed',
        errorDescription: 'Failed to delete image'
      },
      clear: {
        title: 'Clear Gallery',
        clearing: 'Clearing gallery...',
        success: 'Gallery cleared successfully',
        successDescription: 'All images have been removed',
        error: 'Clear failed',
        errorDescription: 'Failed to clear gallery',
        confirm: 'Are you sure you want to clear the entire gallery? This action cannot be undone.'
      },
      stats: {
        total: 'Total Images',
        size: 'Total Size',
        today: 'Today\'s Uploads',
        average: 'Average Size'
      },
      grid: {
        title: 'Gallery Images'
      },
      actions: {
        export: 'Export Gallery',
        clear: 'Clear Gallery'
      }
    }
  },
  common: {
    loading: 'Loading...',
    noContent: 'No content found',
    noContentDescription: 'The requested page does not contain any content.'
  },
  error: {
    tryAgain: 'Try Again',
    goHome: 'Go Home',
    goBack: 'Go Back',
    teapotMessage: '🫖 I\'m a teapot! But that doesn\'t mean I can\'t help you find the page you need.',
    pathInfo: 'Path: {path} in locale {locale}',
    titles: {
      404: 'Page Not Found',
      418: 'I\'m a Teapot!',
      403: 'Access Forbidden',
      500: 'Internal Server Error',
      default: 'Something went wrong'
    },
    messages: {
      404: 'The page you are looking for does not exist or has been moved.',
      418: 'The server refuses to brew coffee because it is a teapot.',
      403: 'You do not have permission to access this page.',
      500: 'An internal server error occurred. Please try again later.',
      default: 'An unexpected error occurred. Please refresh the page.'
    }
  }
}
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
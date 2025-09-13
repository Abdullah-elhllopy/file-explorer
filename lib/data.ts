export interface FileNode {
  id: string;
  name: string;
  type: 'file';
}

export interface FolderNode {
  id: string;
  name: string;
  type: 'folder';
  children: Array<FolderNode | FileNode>;
  parentId?: string;
}

// In-memory data store
let fileSystem: FolderNode = {
  id: 'root',
  name: 'My Files',
  type: 'folder',
  children: [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      parentId: 'root',
      children: [

      ]
    },
    {
      id: '2',
      name: 'Images',
      type: 'folder',
      parentId: 'root',
      children: [
      ]
    }
  ]
};

// Helper function to find a folder by ID
export function findFolder(id: string): FolderNode | null {
  function search(node: FolderNode): FolderNode | null {
    if (node.id === id) {
      return node;
    }
    for (const child of node.children) {
      if (child.type === 'folder') {
        const result = search(child);
        if (result) return result;
      }
    }
    return null;
  }
  return search(fileSystem);
}

// Helper function to find parent folder
export function findParentFolder(childId: string): FolderNode | null {
  function search(node: FolderNode): FolderNode | null {
    for (const child of node.children) {
      if (child.id === childId) {
        return node;
      }
      if (child.type === 'folder') {
        const result = search(child);
        if (result) return result;
      }
    }
    return null;
  }
  return search(fileSystem);
}

// Helper function to get breadcrumb path
export function getBreadcrumbPath(folderId: string): Array<{id: string, name: string}> {
  const path: Array<{id: string, name: string}> = [];
  let currentFolder = findFolder(folderId);
  
  while (currentFolder) {
    path.unshift({ id: currentFolder.id, name: currentFolder.name });
    if (currentFolder.id === 'root') break;
    currentFolder = findParentFolder(currentFolder.id);
  }
  
  return path;
}

// Helper function to get recent files (last 10 files)
export function getRecentFiles(): FileNode[] {
  const files: FileNode[] = [];
  
  function collectFiles(node: FolderNode) {
    for (const child of node.children) {
      if (child.type === 'file') {
        files.push(child);
      } else {
        collectFiles(child);
      }
    }
  }
  
  collectFiles(fileSystem);
  return files.slice(-10); // Return last 10 files
}

// Helper function to get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Helper function to get all folders for dropdown selection
export function getAllFolders(): Array<{id: string, name: string, path: string}> {
  const folders: Array<{id: string, name: string, path: string}> = [];
  
  function collectFolders(node: FolderNode, path: string = '') {
    const currentPath = path ? `${path} / ${node.name}` : node.name;
    folders.push({ 
      id: node.id, 
      name: node.name, 
      path: currentPath 
    });
    
    for (const child of node.children) {
      if (child.type === 'folder') {
        collectFolders(child, currentPath);
      }
    }
  }
  
  collectFolders(fileSystem);
  return folders;
}
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);
  
  const iconMap: Record<string, string> = {
    // Images
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'webp': '🖼️',
    
    // Videos
    'mp4': '🎬',
    'avi': '🎬',
    'mov': '🎬',
    'wmv': '🎬',
    'flv': '🎬',
    'webm': '🎬',
    
    // Audio
    'mp3': '🎵',
    'wav': '🎵',
    'flac': '🎵',
    'aac': '🎵',
    
    // Documents
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'txt': '📄',
    'rtf': '📝',
    
    // Spreadsheets
    'xls': '📊',
    'xlsx': '📊',
    'csv': '📊',
    
    // Presentations
    'ppt': '📊',
    'pptx': '📊',
    
    // Code
    'js': '⚡',
    'ts': '⚡',
    'jsx': '⚡',
    'tsx': '⚡',
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'sass': '🎨',
    'json': '📋',
    'xml': '📋',
    'yml': '⚙️',
    'yaml': '⚙️',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'c': '⚙️',
    'php': '🐘',
    'rb': '💎',
    'go': '🐹',
    'rust': '🦀',
    'sql': '🗃️',
    'sh': '📜',
    'bat': '📜',
    
    // Archives
    'zip': '📦',
    'rar': '📦',
    '7z': '📦',
    'tar': '📦',
    'gz': '📦'
  };
  
  return iconMap[ext] || '📄';
}
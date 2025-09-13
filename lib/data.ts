export interface FileNode {
  id: string;
  name: string;
  type: 'file';
  fileSystemName?: string; // For tracking actual file on disk
  size?: number;
  uploadedAt?: string;
}

export interface FolderNode {
  id: string;
  name: string;
  type: 'folder';
  children: Array<FolderNode | FileNode>;
  parentId?: string;
  createdAt?: string;
}

// In-memory data store
let fileSystem: FolderNode = {
  id: 'root',
  name: 'My Files',
  type: 'folder',
  createdAt: new Date().toISOString(),
  children: [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      parentId: 'root',
      createdAt: new Date().toISOString(),
      children: []
    },
    {
      id: '2',
      name: 'Images',
      type: 'folder',
      parentId: 'root',
      createdAt: new Date().toISOString(),
      children: []
    },
    {
      id: '3',
      name: 'Videos',
      type: 'folder',
      parentId: 'root',
      createdAt: new Date().toISOString(),
      children: []
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

// Helper function to get recent files (last 10 files, sorted by upload date)
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
  
  // Sort by upload date (newest first) and return last 10
  return files
    .sort((a, b) => {
      const dateA = new Date(a.uploadedAt || 0).getTime();
      const dateB = new Date(b.uploadedAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 10);
}

// Helper function to get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Helper function to get file type category
export function getFileType(filename: string): string {
  const ext = getFileExtension(filename);
  
  const typeMap: Record<string, string> = {
    // Images
    'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 
    'svg': 'image', 'webp': 'image', 'bmp': 'image', 'ico': 'image',
    
    // Videos
    'mp4': 'video', 'avi': 'video', 'mov': 'video', 'wmv': 'video', 
    'flv': 'video', 'webm': 'video', 'mkv': 'video', '3gp': 'video',
    
    // Audio
    'mp3': 'audio', 'wav': 'audio', 'flac': 'audio', 'aac': 'audio',
    'ogg': 'audio', 'm4a': 'audio', 'wma': 'audio',
    
    // Documents
    'pdf': 'document', 'doc': 'document', 'docx': 'document', 
    'txt': 'document', 'rtf': 'document', 'odt': 'document',
    'xls': 'document', 'xlsx': 'document', 'csv': 'document',
    'ppt': 'document', 'pptx': 'document', 'odp': 'document',
    
    // Code
    'js': 'code', 'ts': 'code', 'jsx': 'code', 'tsx': 'code',
    'html': 'code', 'css': 'code', 'scss': 'code', 'sass': 'code',
    'json': 'code', 'xml': 'code', 'yml': 'code', 'yaml': 'code',
    'py': 'code', 'java': 'code', 'cpp': 'code', 'c': 'code',
    'php': 'code', 'rb': 'code', 'go': 'code', 'rust': 'code',
    'sql': 'code', 'sh': 'code', 'bat': 'code',
    
    // Archives
    'zip': 'archive', 'rar': 'archive', '7z': 'archive', 
    'tar': 'archive', 'gz': 'archive', 'bz2': 'archive'
  };
  
  return typeMap[ext] || 'file';
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

// Enhanced file icon function
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);
  
  const iconMap: Record<string, string> = {
    // Images
    'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
    'svg': '🖼️', 'webp': '🖼️', 'bmp': '🖼️', 'ico': '🖼️',
    
    // Videos
    'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'wmv': '🎬',
    'flv': '🎬', 'webm': '🎬', 'mkv': '🎬', '3gp': '🎬',
    
    // Audio
    'mp3': '🎵', 'wav': '🎵', 'flac': '🎵', 'aac': '🎵',
    'ogg': '🎵', 'm4a': '🎵', 'wma': '🎵',
    
    // Documents
    'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📄', 'rtf': '📝',
    
    // Spreadsheets
    'xls': '📊', 'xlsx': '📊', 'csv': '📊',
    
    // Presentations
    'ppt': '📊', 'pptx': '📊', 'odp': '📊',
    
    // Code
    'js': '⚡', 'ts': '⚡', 'jsx': '⚡', 'tsx': '⚡',
    'html': '🌐', 'css': '🎨', 'scss': '🎨', 'sass': '🎨',
    'json': '📋', 'xml': '📋', 'yml': '⚙️', 'yaml': '⚙️',
    'py': '🐍', 'java': '☕', 'cpp': '⚙️', 'c': '⚙️',
    'php': '🐘', 'rb': '💎', 'go': '🐹', 'rust': '🦀',
    'sql': '🗃️', 'sh': '📜', 'bat': '📜',
    
    // Archives
    'zip': '📦', 'rar': '📦', '7z': '📦', 'tar': '📦', 'gz': '📦'
  };
  
  return iconMap[ext] || '📄';
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString();
}

// Helper function to get file stats
export function getFileSystemStats() {
  let totalFiles = 0;
  let totalFolders = 0;
  let totalSize = 0;
  
  function traverse(node: FolderNode) {
    if (node.type === 'folder') {
      totalFolders++;
      for (const child of node.children) {
        if (child.type === 'folder') {
          traverse(child);
        } else {
          totalFiles++;
          totalSize += child.size || 0;
        }
      }
    }
  }
  
  traverse(fileSystem);
  
  return {
    totalFiles: totalFiles - 1, // Exclude root folder
    totalFolders,
    totalSize: formatFileSize(totalSize)
  };
}
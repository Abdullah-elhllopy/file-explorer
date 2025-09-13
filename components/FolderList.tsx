'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FolderNode, FileNode } from '@/lib/data';
import { getFileIcon, getFileExtension, getFileType, formatFileSize, formatDate, findFile, parseBreadcrumbPath, buildBreadcrumbQuery } from '@/lib/data';

interface FileViewerProps {
  file: FileNode;
  onClose: () => void;
}

interface DeleteConfirmState {
  type: 'file' | 'folder';
  id: string;
  name: string;
}

function FileViewer({ file, onClose }: FileViewerProps) {
  const [textContent, setTextContent] = useState<string>('');
  const [loadingText, setLoadingText] = useState(false);
  const extension = getFileExtension(file.name);
  
  // Update lastAccessed when file is viewed
  React.useEffect(() => {
    findFile(file.id); // This updates the lastAccessed timestamp
  }, [file.id]);
  
  console.log('file' ,file)
  // Use fileSystemName if available, otherwise fall back to display name
  const fileName = (file as any).fileSystemName || file.name;
  const publicPath = `/${fileName}`;

  const renderFileContent = () => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv'];
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
    const textExtensions = ['txt', 'md', 'markdown', 'json', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rust', 'yml', 'yaml', 'csv'];

    if (imageExtensions.includes(extension)) {
      return (
        <div className="text-center">
          <img 
            src={publicPath} 
            alt={file.name}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-sm mx-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
              errorDiv?.classList.remove('hidden');
            }}
          />
          <div className="hidden text-gray-500 py-8">
            <div className="text-6xl mb-4">{getFileIcon(file.name)}</div>
            <p>Image could not be loaded</p>
          </div>
        </div>
      );
    }

    if (videoExtensions.includes(extension)) {
      return (
        <div className="text-center">
          <video 
            controls 
            className="max-w-full max-h-96 rounded-lg shadow-sm mx-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
              errorDiv?.classList.remove('hidden');
            }}
          >
            <source src={publicPath} type={`video/${extension}`} />
            Your browser does not support the video tag.
          </video>
          <div className="hidden text-gray-500 py-8">
            <div className="text-6xl mb-4">{getFileIcon(file.name)}</div>
            <p>Video could not be loaded</p>
          </div>
        </div>
      );
    }

    if (audioExtensions.includes(extension)) {
      return (
        <div className="text-center">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="text-6xl mb-4">{getFileIcon(file.name)}</div>
            <h3 className="font-medium text-gray-900 mb-4">{file.name}</h3>
            <audio 
              controls 
              className="w-full max-w-md mx-auto"
              onError={(e) => {
                const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                errorDiv?.classList.remove('hidden');
              }}
            >
              <source src={publicPath} type={`audio/${extension}`} />
              Your browser does not support the audio tag.
            </audio>
            <div className="hidden text-red-500 mt-2">
              <p>Audio could not be loaded</p>
            </div>
          </div>
        </div>
      );
    }

    if (extension === 'pdf') {
      return (
        <div className="w-full">
          <iframe
            src={publicPath}
            className="w-full h-96 rounded-lg border shadow-sm"
            title={file.name}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
              errorDiv?.classList.remove('hidden');
            }}
          />
          <div className="hidden text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">{getFileIcon(file.name)}</div>
            <p>PDF could not be loaded</p>
            <a 
              href={publicPath}
              download={file.name}
              className="btn-primary mt-4 inline-block"
            >
              Download PDF
            </a>
          </div>
        </div>
      );
    }

    if (textExtensions.includes(extension)) {
      return (
        <div className="w-full">
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
              {loadingText ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                  Loading text content...
                </div>
              ) : textContent ? (
                textContent
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">{getFileIcon(file.name)}</div>
                  <button 
                    onClick={async () => {
                      setLoadingText(true);
                      try {
                        const response = await fetch(publicPath);
                        if (!response.ok) throw new Error('Failed to load file');
                        const text = await response.text();
                        setTextContent(text);
                      } catch (error) {
                        setTextContent('Error loading file content. The file might not be accessible or is too large to display.');
                      } finally {
                        setLoadingText(false);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Load Text Content
                  </button>
                </div>
              )}
            </pre>
          </div>
          <div className="mt-4 text-center">
            <a 
              href={publicPath}
              download={file.name}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg inline-block transition-colors"
            >
              Download File
            </a>
          </div>
        </div>
      );
    }

    // Default fallback for unsupported file types
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-6">{getFileIcon(file.name)}</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
        <p className="text-gray-500 mb-4">Preview not available for this file type</p>
        <div className="text-sm text-gray-400 mb-6 space-y-1">
          <p>Type: {getFileExtension(file.name).toUpperCase() || 'Unknown'}</p>
          {file.size && <p>Size: {formatFileSize(file.size)}</p>}
        </div>
        <a 
          href={publicPath}
          download={file.name}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-block transition-colors"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{file.name}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded text-xs uppercase font-medium">
                  {getFileExtension(file.name) || 'Unknown'}
                </span>
                {file.size && <span>{formatFileSize(file.size)}</span>}
                {(file as any).uploadedAt && (
                  <span>Uploaded {formatDate((file as any).uploadedAt)}</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6">
          {renderFileContent()}
        </div>
      </div>
    </div>
  );
}

export function FolderList({ nodes }: { nodes: Array<FolderNode | FileNode> }) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFileClick = (file: FileNode) => {
    // Update lastAccessed timestamp when file is clicked
    findFile(file.id);
    setSelectedFile(file);
  };

  const handleFolderClick = (folder: FolderNode) => {
    const pathQuery = searchParams.get('path');
    const currentPath = parseBreadcrumbPath(pathQuery);
    const newQuery = buildBreadcrumbQuery(currentPath, { id: folder.id, name: folder.name });
    
    if (newQuery) {
      router.push(`/folder/${folder.id}?path=${newQuery}`);
    } else {
      router.push(`/folder/${folder.id}`);
    }
  };

  const handleDelete = async (type: 'file' | 'folder', id: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/delete/${type}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
        setDeleteConfirm(null);
      } else {
        const error = await response.json();
        alert(error.error || `Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}. Please try again.`);
    } finally {
      setDeleting(false);
    }
  };

  if (!nodes.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-8xl mb-6">📁</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">This folder is empty</h3>
        <p className="text-gray-600">Upload files or create folders to get started</p>
      </div>
    );
  }

  const folders = nodes.filter(node => node.type === 'folder') as FolderNode[];
  const files = nodes.filter(node => node.type === 'file') as FileNode[];

  return (
    <>
      <div className="space-y-12">
        {folders.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="text-lg">📁</span>
              Folders ({folders.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <div key={folder.id} className="group relative">
                  <div 
                    onClick={() => handleFolderClick(folder)}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white cursor-pointer"
                  >
                    <div className="text-5xl mb-4 text-blue-500">📁</div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate mb-2">{folder.name}</p>
                      <p className="text-sm text-gray-500 mb-1">
                        {folder.children.length} {folder.children.length === 1 ? 'item' : 'items'}
                      </p>
                      {(folder as any).createdAt && (
                        <p className="text-xs text-gray-400">
                          Created {formatDate((folder as any).createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteConfirm({ type: 'folder', id: folder.id, name: folder.name });
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 text-red-600 rounded-full p-2 text-sm"
                    title="Delete folder"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="text-lg">📄</span>
              Files ({files.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file) => {
                const fileType = getFileType ? getFileType(file.name) : 'document';
                return (
                  <div key={file.id} className="group relative">
                    <div
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                      onClick={() => handleFileClick(file)}
                    >
                      <div className="text-5xl mb-4">{getFileIcon(file.name)}</div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate mb-2">{file.name}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs uppercase font-medium">
                            {getFileExtension(file.name) || 'file'}
                          </span>
                          {file.size && (
                            <span className="text-xs">{formatFileSize(file.size)}</span>
                          )}
                        </div>
                        {(file as any).uploadedAt && (
                          <p className="text-xs text-gray-400">
                            {formatDate((file as any).uploadedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteConfirm({ type: 'file', id: file.id, name: file.name });
                      }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 text-red-600 rounded-full p-2 text-sm"
                      title="Delete file"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewer 
          file={selectedFile} 
          onClose={() => setSelectedFile(null)} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">⚠️</div>
              <h3 className="text-lg font-semibold text-red-600">
                Delete {deleteConfirm.type === 'file' ? 'File' : 'Folder'}
              </h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-medium">"{deleteConfirm.name}"</span>? 
              {deleteConfirm.type === 'file' ? (
                ' This action cannot be undone.'
              ) : (
                ' The folder must be empty to delete.'
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 min-w-[100px] flex items-center justify-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  `Delete ${deleteConfirm.type === 'file' ? 'File' : 'Folder'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
'use client';
import dynamic from 'next/dynamic';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FolderNode, FileNode } from '@/lib/data';
import { getFileIcon, getFileExtension, getFileType, formatFileSize, formatDate, findFile, parseBreadcrumbPath, buildBreadcrumbQuery } from '@/lib/data';


const RecentFileViewer = dynamic(() => import('./RecentFilePreview'), {
  ssr: false, 
  loading: () => <div>Loading Account...</div>
})

interface DeleteConfirmState {
  type: 'file' | 'folder';
  id: string;
  name: string;
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

  const handleDownload = (file: FileNode, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use fileSystemName if available, otherwise fall back to display name
    const fileName = (file as any).fileSystemName || file.name;
    const publicPath = `/${fileName}`;
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = publicPath;
    link.download = file.name; // Use the display name for download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Update lastAccessed timestamp
    findFile(file.id);
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
                    
                    {/* Action buttons - only show on hover */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDownload(file, e)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full p-2 text-sm transition-colors"
                        title="Download file"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteConfirm({ type: 'file', id: file.id, name: file.name });
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 rounded-full p-2 text-sm transition-colors"
                        title="Delete file"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {selectedFile && (
        <RecentFileViewer 
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
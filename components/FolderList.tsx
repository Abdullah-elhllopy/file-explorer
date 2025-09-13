'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FolderNode, FileNode } from '@/lib/data';
import { getFileIcon, getFileExtension } from '@/lib/data';

interface FileViewerProps {
  file: FileNode;
  onClose: () => void;
}

function FileViewer({ file, onClose }: FileViewerProps) {
  const [textContent, setTextContent] = useState<string>('');
  const [loadingText, setLoadingText] = useState(false);
  const extension = getFileExtension(file.name);
  const publicPath = `/${file.name}`;

  const renderFileContent = () => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'webm'];
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac'];
    const textExtensions = ['txt', 'md', 'markdown', 'json', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rust', 'yml', 'yaml', 'csv'];

    if (imageExtensions.includes(extension)) {
      return (
        <img 
          src={publicPath} 
          alt={file.name}
          className="max-w-full max-h-96 object-contain rounded-lg"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    if (videoExtensions.includes(extension)) {
      return (
        <video 
          controls 
          className="max-w-full max-h-96 rounded-lg"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src={publicPath} type={`video/${extension}`} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (audioExtensions.includes(extension)) {
      return (
        <audio 
          controls 
          className="w-full"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src={publicPath} type={`audio/${extension}`} />
          Your browser does not support the audio tag.
        </audio>
      );
    }

    if (extension === 'pdf') {
      return (
        <iframe
          src={publicPath}
          className="w-full h-96 rounded-lg border"
          title={file.name}
        />
      );
    }

    if (textExtensions.includes(extension)) {
      return (
        <div className="w-full">
          <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
              {loadingText ? (
                <div className="text-center py-4 text-gray-500">Loading text content...</div>
              ) : textContent ? (
                textContent
              ) : (
                <div className="text-center py-4">
                  <button 
                    onClick={async () => {
                      setLoadingText(true);
                      try {
                        const response = await fetch(publicPath);
                        const text = await response.text();
                        setTextContent(text);
                      } catch (error) {
                        setTextContent('Error loading file content');
                      } finally {
                        setLoadingText(false);
                      }
                    }}
                    className="btn-primary"
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
              className="btn-secondary inline-block"
            >
              Download File
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">{getFileIcon(file.name)}</div>
        <p className="text-gray-600">Preview not available for this file type</p>
        <a 
          href={publicPath}
          download={file.name}
          className="btn-primary mt-4 inline-block"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{file.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="flex justify-center">
          {renderFileContent()}
        </div>
      </div>
    </div>
  );
}

export function FolderList({ nodes }: { nodes: Array<FolderNode | FileNode> }) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  if (!nodes.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-2">📁</div>
        <p>This folder is empty</p>
      </div>
    );
  }

  const folders =  nodes.filter(node => node.type === 'folder') as FolderNode[];
  const files = nodes.filter(node => node.type === 'file') as FileNode[];

  return (
    <>
      <div className="space-y-4">
        {folders.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Folders ({folders.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {folders.map((folder) => (
                <Link
                  key={folder.id}
                  href={`/folder/${folder.id}`}
                  className="folder-item"
                >
                  <div className="text-2xl">📁</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{folder.name}</p>
                    <p className="text-sm text-gray-500">
                      {folder.children.length} items
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Files ({files.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="file-item cursor-pointer"
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="text-2xl">{getFileIcon(file.name)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-sm text-gray-500 uppercase">
                      {getFileExtension(file.name) || 'file'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedFile && (
        <FileViewer 
          file={selectedFile} 
          onClose={() => setSelectedFile(null)} 
        />
      )}

      {/* {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Delete {deleteConfirm.type === 'file' ? 'File' : 'Folder'}
            </h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete "{deleteConfirm.name}"? 
              {deleteConfirm.type === 'file' ? ' This action cannot be undone.' : ' The folder must be empty to delete.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Delete {deleteConfirm.type === 'file' ? 'File' : 'Folder'}
              </button>
            </div>
          </div>
        </div> */}
      {/* )} */}
    </>
  );
}
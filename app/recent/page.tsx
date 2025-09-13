'use client';

import React, { useState } from 'react';
import { getRecentFiles, getFileIcon, getFileExtension, getFileType, formatFileSize, formatDate, findFile } from '@/lib/data';
import type { FileNode } from '@/lib/data';

function FileViewer({ file, onClose }: { file: FileNode; onClose: () => void }) {
  const [textContent, setTextContent] = useState<string>('');
  const [loadingText, setLoadingText] = useState(false);
  const extension = getFileExtension(file.name);
  
  // Update lastAccessed when file is viewed
  React.useEffect(() => {
    findFile(file.id); // This updates the lastAccessed timestamp
  }, [file.id]);
  
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
        <img 
          src={publicPath} 
          alt={file.name}
          className="file-preview mx-auto"
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
          className="file-preview mx-auto"
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
        <div className="text-center">
          <div className="bg-gray-100 p-6 rounded-lg mb-4">
            <div className="text-4xl mb-4">{getFileIcon(file.name)}</div>
            <h3 className="font-medium text-gray-900 mb-4">{file.name}</h3>
            <audio 
              controls 
              className="w-full max-w-md mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            >
              <source src={publicPath} type={`audio/${extension}`} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        </div>
      );
    }

    if (extension === 'pdf') {
      return (
        <iframe
          src={publicPath}
          className="w-full h-96 rounded-lg border shadow-sm"
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
                <div className="text-center py-4 text-gray-500">
                  <div className="loading-spinner mx-auto mb-2"></div>
                  Loading text content...
                </div>
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
        <p className="text-gray-600 mb-4">Preview not available for this file type</p>
        <p className="text-sm text-gray-500 mb-4">
          {file.size ? formatFileSize(file.size) : 'Unknown size'}
        </p>
        <a 
          href={publicPath}
          download={file.name}
          className="btn-primary inline-block"
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
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{file.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{getFileExtension(file.name).toUpperCase()}</span>
              {file.size && <span>{formatFileSize(file.size)}</span>}
              {(file as any).uploadedAt && <span>Uploaded {formatDate((file as any).uploadedAt)}</span>}
            </div>
          </div>
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

export default function RecentPage() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const recentFiles = getRecentFiles();
  console.log('recentFiles ', recentFiles);
  const fileTypes = ['all', 'image', 'video', 'audio', 'document', 'code', 'archive'];
  
  const filteredFiles = filter === 'all' 
    ? recentFiles 
    : recentFiles.filter(file => getFileType(file.name) === filter);

  const handleFileClick = (file: FileNode) => {
    // Update lastAccessed timestamp when file is clicked
    findFile(file.id);
    setSelectedFile(file);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="page-title">Recent Files</h1>
              <p className="text-gray-600 mt-1">
                Your {filteredFiles.length} most recently accessed files
              </p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {fileTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === type
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {type !== 'all' && (
                    <span className="ml-1 text-xs">
                      ({recentFiles.filter(file => getFileType(file.name) === type).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium mb-2">No recent files found</h3>
            <p>{filter === 'all' ? 'Upload some files to see them here' : `No ${filter} files found`}</p>
          </div>
        ) : (
          <div>
            {/* Stats Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{recentFiles.length}</div>
                  <div className="text-sm text-gray-600">Total Files</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {recentFiles.filter(f => getFileType(f.name) === 'image').length}
                  </div>
                  <div className="text-sm text-gray-600">Images</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {recentFiles.filter(f => getFileType(f.name) === 'video').length}
                  </div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {recentFiles.filter(f => getFileType(f.name) === 'document').length}
                  </div>
                  <div className="text-sm text-gray-600">Documents</div>
                </div>
              </div>
            </div>

            {/* Files Grid */}
            <div className="responsive-grid">
              {filteredFiles.map((file) => {
                const fileType = getFileType(file.name);
                return (
                  <div
                    key={file.id}
                    className={`file-item cursor-pointer card-hover`}
                    data-type={fileType}
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="text-4xl mb-3">{getFileIcon(file.name)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate mb-1" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                        <span className="uppercase">{getFileExtension(file.name) || 'file'}</span>
                        {file.size && <span>{formatFileSize(file.size)}</span>}
                      </div>
                      {(file as any).uploadedAt && (
                        <p className="text-xs text-gray-400">
                          {formatDate((file as any).uploadedAt)}
                        </p>
                      )}
                      {(file as any).lastAccessed && (
                        <p className="text-xs text-blue-400">
                          Accessed {formatDate((file as any).lastAccessed)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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
    </>
  );
}
'use client';

import { useState } from 'react';
import { getRecentFiles, getFileIcon, getFileExtension } from '@/lib/data';
import type { FileNode } from '@/lib/data';

function FileViewer({ file, onClose }: { file: FileNode; onClose: () => void }) {
  const extension = getFileExtension(file.name);
  const publicPath = `/${file.name}`;

  const renderFileContent = () => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'webm'];
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac'];

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

export default function RecentPage() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const recentFiles = getRecentFiles();

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Recent Files</h1>
          <p className="text-gray-600 mt-1">
            Your recently accessed files
          </p>
        </div>

        {recentFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p>No recent files found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {recentFiles.map((file) => (
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
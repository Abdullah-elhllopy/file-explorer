'use client';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { getFileIcon, getFileExtension, getFileType, formatFileSize, formatDate, findFile } from '@/lib/data';
import type { FileNode } from '@/lib/data';


const RecentFileViewer = dynamic(() => import('./RecentFilePreview'), {
    ssr: false,
    loading: () => <div>Loading Account...</div>
})
export default function RecentFiles({ recentFiles = [] }: { recentFiles: FileNode[] }) {
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const fileTypes = ['all', 'image', 'video', 'audio', 'document', 'code', 'archive'];

    const filteredFiles = filter === 'all'
        ? recentFiles
        : recentFiles.filter(file => getFileType(file.name) === filter);

    const handleFileClick = (file: FileNode) => {
        // Update lastAccessed timestamp when file is clicked
        findFile(file.id);
        setSelectedFile(file);
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

    return (
        <>
            <div className="max-w-7xl mx-auto h-full">
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
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === type
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
                                        className={`file-item cursor-pointer card-hover group relative`}
                                        data-type={fileType}
                                        onClick={() => handleFileClick(file)}
                                    >
                                        <div className="text-4xl mb-3">{getFileIcon(file.name)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate " title={file.name}>
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
                                        
                                        {/* Download button - only show on hover */}
                                        <button
                                            onClick={(e) => handleDownload(file, e)}
                                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full p-2 text-sm"
                                            title="Download file"
                                        >
                                            ⬇️
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {selectedFile && (
                <RecentFileViewer
                    file={selectedFile}
                    onClose={() => setSelectedFile(null)}
                />
            )}
        </>
    );
}
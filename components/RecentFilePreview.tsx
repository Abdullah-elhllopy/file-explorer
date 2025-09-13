import React, { useState, useEffect } from "react";
import { FileNode, findFile, formatDate, formatFileSize, getFileExtension, getFileIcon } from "@/lib/data";

export default function RecentFileViewer({ file, onClose }: { file: FileNode; onClose: () => void }) {
    const [textContent, setTextContent] = useState<string>('');
    const [loadingText, setLoadingText] = useState(false);
    const extension = getFileExtension(file.name);

    // Update lastAccessed when file is viewed
    useEffect(() => {
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
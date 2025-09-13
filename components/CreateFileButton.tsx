'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FolderNode } from '@/lib/data';

interface CreateFileButtonProps {
    folderId?: string;
    folders?: Array<{id: string, name: string, path: string}>
}

export function CreateFileButton({ folderId = 'root', folders = [] }: CreateFileButtonProps) {
    const [open, setOpen] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState("")
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleSubmit = async (file: File, customName?: string) => {
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (customName?.trim()) {
                formData.append('name', customName.trim());
            }

            const response = await fetch(`/api/files/${selectedFolderId || folderId}`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                router.refresh();
                setOpen(false);
                setName('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleSubmit(file, name);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            console.log('File dropped:', file);
            console.log('Dropped file details:', {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            });
            handleSubmit(file, name);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setName('');
        setDragActive(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="btn flex items-center gap-2"
                type="button"
            >
                <span>📄</span>
                Upload File
            </button>

            {open && (
                <div className="modal-overlay" onClick={handleClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Upload File</h3>

                        <div className="mb-4">
                            <label htmlFor="file-name" className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Name (optional)
                            </label>
                            <input
                                id="file-name"
                                type="text"
                                placeholder="Leave empty to use original filename"
                                className="input-field"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {folderId === 'root' && folders.length > 0 ? (
                            <div className="mb-4">
                                <label htmlFor="folder-select" className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload to Folder
                                </label>
                                <select
                                    id="folder-select"
                                    value={selectedFolderId}
                                    onChange={(e) => setSelectedFolderId(e.target.value)}
                                    className="input-field"
                                    disabled={loading}
                                >
                                    {folders.map((folder) => (
                                        <option key={folder.id} value={folder.id}>
                                            {folder.name} : {folder.path}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : null}

                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="text-4xl mb-4">📁</div>
                            <p className="text-gray-600 mb-4">
                                Drag and drop a file here, or click to select
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Uploading...' : 'Choose File'}
                            </button>
                        </div>

                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
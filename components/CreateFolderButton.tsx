'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateFolderButtonProps {
  folderId?: string;
}

export function CreateFolderButton({ folderId = 'root' }: CreateFolderButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      if (response.ok) {
        router.refresh();
        setOpen(false);
        setName('');
      } else {
        console.error('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setName('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn flex items-center gap-2"
        type="button"
      >
        <span>📁</span>
        New Folder
      </button>
      
      {open && (
        <div className="modal-overlay" onClick={handleClose}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
              
              <div className="mb-6">
                <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  id="folder-name"
                  type="text"
                  autoFocus
                  placeholder="Enter folder name..."
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  style={{ width: '300px'  }}
                  required
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary disabled:opacity-50"
                  disabled={loading || !name.trim()}

                >
                  {loading ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
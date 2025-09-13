import { findFolder } from '@/lib/data';
import { CreateFolderButton } from '@/components/CreateFolderButton';
import { CreateFileButton } from '@/components/CreateFileButton';
import { FolderList } from '@/components/FolderList';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  params: { id: string };
}
async function getFolderData(folderId: string) {
  try {
    // Use full URL with your domain
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/folders/${folderId}`, {
      method: 'GET', // Remove from headers, it goes here
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch folder');
    }
    
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
export default async function FolderPage({ params }: Props) {
  const folder = findFolder(params.id);
  const folderData = await getFolderData(params.id);
  if (!folder) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Folder not found</h1>
          <p className="text-gray-600">The folder you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Breadcrumb folderId={params.id} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{folder.name}</h1>
          <p className="text-gray-600 mt-1">
            {folder.children.length} items
          </p>
        </div>
        <div className="flex gap-3">
          <CreateFileButton folderId={params.id} />
          <CreateFolderButton folderId={params.id} />
        </div>
      </div>

      <FolderList nodes={folder.children} />
    </div>
  );
}
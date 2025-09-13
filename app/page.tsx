import { findFolder, getAllFolders } from '@/lib/data';
import { CreateFolderButton } from '@/components/CreateFolderButton';
import { CreateFileButton } from '@/components/CreateFileButton';
import { FolderList } from '@/components/FolderList';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function Home() {
  const folder = findFolder('root');
  const folders = getAllFolders()
  if (!folder) {
    return <div>Error: Root folder not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Breadcrumb folderId="root" />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{folder.name}</h1>
          <p className="text-gray-600 mt-1">
            {folder.children.length} items
          </p>
        </div>
        <div className="flex gap-3">
          <CreateFileButton folderId="root" folders = {folders} />
          <CreateFolderButton folderId="root" />
        </div>
      </div>
      
      <FolderList nodes={folder.children}  />
    </div>
  );
}
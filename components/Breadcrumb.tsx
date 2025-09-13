'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBreadcrumbPath, findParentFolder, findFolder } from '@/lib/data';

interface BreadcrumbProps {
    folderId: string;
}

export function Breadcrumb({ folderId }: BreadcrumbProps) {
    const router = useRouter();
    
    // Get the complete path from root to current folder
    const buildPath = (currentFolderId: string): Array<{id: string, name: string}> => {
        const path: Array<{id: string, name: string}> = [];
        let current = findFolder(currentFolderId);
        
        // Build path from current folder up to root
        while (current) {
            path.unshift({ id: current.id, name: current.name });
            
            if (current.id === 'root') break;
            
            // Find parent folder
            const parent = findParentFolder(current.id);
            current = parent;
        }
        
        return path;
    };

    const path = buildPath(folderId);

    const handleGoBack = () => {
        if (folderId === 'root') {
            return; // Already at root
        }
        
        // Find parent folder and navigate to it
        const parentFolder = findParentFolder(folderId);
        if (parentFolder) {
            const parentRoute = parentFolder.id === 'root' ? '/' : `/folder/${parentFolder.id}`;
            router.push(parentRoute);
        } else {
            // Fallback to root if parent not found
            router.push('/');
        }
    };

    return (
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            {/* Back Button */}
            {folderId !== 'root' && (
                <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    title="Go back to parent folder"
                >
                    <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 19l-7-7 7-7" 
                        />
                    </svg>
                    Back
                </button>
            )}
            
            {/* Breadcrumb Path */}
            <nav className="flex items-center gap-2 flex-1">
                {path.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                        {index > 0 && (
                            <svg 
                                className="w-3 h-3 text-gray-400" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                            >
                                <path 
                                    fillRule="evenodd" 
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                                    clipRule="evenodd" 
                                />
                            </svg>
                        )}
                        {index === path.length - 1 ? (
                            <span className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="text-lg">
                                    {item.id === 'root' ? '🏠' : '📁'}
                                </span>
                                {item.name}
                            </span>
                        ) : (
                            <Link
                                href={item.id === 'root' ? '/' : `/folder/${item.id}`}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 font-medium"
                            >
                                <span className="text-sm">
                                    {item.id === 'root' ? '🏠' : '📁'}
                                </span>
                                {item.name}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
}
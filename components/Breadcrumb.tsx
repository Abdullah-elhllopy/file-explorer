'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseBreadcrumbPath } from '@/lib/data';

interface BreadcrumbProps {
    folderId: string;
}

export function Breadcrumb({ folderId }: BreadcrumbProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathQuery = searchParams.get('path');
    
    // Parse the breadcrumb path from query parameters
    const path = parseBreadcrumbPath(pathQuery);

    const handleGoBack = () => {
        if (folderId === 'root' || path.length <= 1) {
            router.push('/');
            return;
        }
        
        // Navigate to the parent folder (second to last item in path)
        const parentFolder = path[path.length - 2];
        if (parentFolder) {
            if (parentFolder.id === 'root') {
                router.push('/');
            } else {
                // Build new path without the current folder
                const newPath = path.slice(0, -2); // Remove current and parent
                const pathWithoutRoot = newPath.filter(item => item.id !== 'root');
                const queryString = pathWithoutRoot.length > 0 
                    ? `?path=${encodeURIComponent(pathWithoutRoot.map(item => `${item.id}|${item.name}`).join('/'))}`
                    : '';
                router.push(`/folder/${parentFolder.id}${queryString}`);
            }
        } else {
            router.push('/');
        }
    };

    return (
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            {/* Back Button */}
            {folderId !== 'root' && path.length > 1 && (
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
                    <div key={`${item.id}-${index}`} className="flex items-center gap-2">
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
                                href={item.id === 'root' ? '/' : (() => {
                                    // Build path query for this breadcrumb link
                                    const pathUpToThisItem = path.slice(0, index + 1);
                                    const pathWithoutRoot = pathUpToThisItem.filter(p => p.id !== 'root').slice(0, -1); // Exclude current item
                                    const queryString = pathWithoutRoot.length > 0 
                                        ? `?path=${encodeURIComponent(pathWithoutRoot.map(p => `${p.id}|${p.name}`).join('/'))}`
                                        : '';
                                    return `/folder/${item.id}${queryString}`;
                                })()}
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
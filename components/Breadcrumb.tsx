'use client';

import Link from 'next/link';
import { getBreadcrumbPath } from '@/lib/data';

interface BreadcrumbProps {
    folderId: string;
}

export function Breadcrumb({ folderId }: BreadcrumbProps) {
    const path = getBreadcrumbPath(folderId);

    return (
        <nav className="breadcrumb">
            {path.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                    {index > 0 && <span className="text-gray-400">/</span>}
                    {index === path.length - 1 ? (
                        <span className="font-medium text-gray-900">{item.name}</span>
                    ) : (
                        <Link
                            href={item.id === 'root' ? '/' : `/folder/${item.id}`}
                            className="breadcrumb-item"
                        >
                            {item.name}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}
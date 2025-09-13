import type { ReactNode } from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import './globals.css';
// import { GlobalUploadButton } from '@/components/GlobalUploadButton';

export const metadata = {
  title: 'File Explorer - Modern File Management',
  description: 'A modern file explorer built with Next.js',
};

function SidebarContent() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">File Explorer</h2>
        {/* <GlobalUploadButton /> */}
      </div>
      
      <nav className="space-y-2">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <span className="text-xl">📁</span>
          <span className="font-medium">My Files</span>
        </Link>
        
        <Link 
          href="/recent" 
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <span className="text-xl">🕒</span>
          <span className="font-medium">Recent</span>
        </Link>
      </nav>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full bg-gray-50">
        <div className="h-full flex">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex md:w-64 md:flex-col">
            <div className="flex-1 bg-white border-r border-gray-200 px-4 py-6">
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile Sidebar (could be enhanced with a toggle) */}
          <div className="md:hidden fixed inset-0 z-50 flex" style={{ display: 'none' }}>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="flex-1 px-4 py-6">
                <SidebarContent />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 px-4 py-6 md:px-8">
              <Suspense fallback={<LoadingFallback />}>
                {children}
              </Suspense>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
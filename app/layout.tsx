'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import './globals.css';

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  
  const navItems = [
    {
      href: '/',
      label: 'My Files',
      icon: '🏠',
      isActive: pathname === '/'
    },
    {
      href: '/recent',
      label: 'Recent',
      icon: '🕒',
      isActive: pathname === '/recent'
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">File Explorer</h2>
        <p className="text-sm text-gray-600">Organize and manage your files</p>
      </div>
      
      <nav className="flex-1 sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`nav-item ${item.isActive ? 'active' : ''}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="loading-spinner mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="h-full bg-gray-50">
        <div className="h-full flex">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-64 lg:flex-col">
            <div className="flex-1 bg-white border-r border-gray-200 px-6 py-8 shadow-sm">
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div 
                className="fixed inset-0 bg-gray-600 bg-opacity-75" 
                onClick={() => setSidebarOpen(false)}
              ></div>
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  >
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 px-6 py-8">
                  <SidebarContent onNavigate={() => setSidebarOpen(false)} />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="font-medium">Menu</span>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">File Explorer</h1>
              <div className="w-16"></div> {/* Spacer for balance */}
            </div>

            {/* Content Area */}
            <div className="flex-1 px-4 py-6 lg:px-8 custom-scrollbar overflow-auto">
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
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Search, Menu, Play, Hash, Download, Box, FileText, Terminal as TerminalIcon, X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SIDEBAR_ITEMS = [
  { label: 'Introduction', path: '/', icon: Hash },
  { label: 'Installation', path: '/installation', icon: Download },
  { type: 'header', label: 'Usage & Providers' },
  { label: 'File Manager & Pickers', path: '/usage', icon: Box },
  { label: 'API & Storage Providers', path: '/providers', icon: TerminalIcon },
  { type: 'header', label: 'Advanced' },
  { label: 'Router Integration', path: '/router', icon: Box },
  { label: 'Database Schema', path: '/schema', icon: FileText },
  { label: 'File Type Utility', path: '/utilities', icon: FileText },
];

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex flex-col h-screen text-xs md:text-sm selection:bg-[#0c8ce9] selection:text-white bg-[#0f0f0f] text-white font-sans">
      {/* Header */}
      <header className="h-12 bg-[#0f0f0f] flex items-center justify-between px-4 hairline-b shrink-0 z-50 relative">
        <div className="flex items-center gap-4">
          <div 
            className="p-1 hover:bg-[#2c2c2c] rounded cursor-pointer lg:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </div>
          <div className="hidden lg:flex p-1 hover:bg-[#2c2c2c] rounded cursor-pointer">
            <Menu size={14} />
          </div>
          <div className="flex items-center gap-2 text-[#a0a0a0] truncate">
            <span className="hover:text-white cursor-pointer transition-colors hidden sm:inline">uncia-tech</span>
            <span className="text-[#444] hidden sm:inline">/</span>
            <Link to="/" className="text-white font-medium hover:text-[#22d3ee] transition-colors">file-manager</Link>
            <span className="text-[#444] hidden sm:inline">/</span>
            <div className="hidden sm:flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border border-yellow-500/20">
              Beta v0.9.2
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex -space-x-1">
            <div className="w-6 h-6 rounded-full bg-purple-500 border border-[#0f0f0f] flex items-center justify-center text-[9px] font-bold">JD</div>
            <div className="w-6 h-6 rounded-full bg-blue-500 border border-[#0f0f0f] flex items-center justify-center text-[9px] font-bold">AK</div>
          </div>
          <button className="bg-[#0c8ce9] hover:bg-[#0b7bc9] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors">
            Share
          </button>
          <div className="p-1 hover:bg-[#2c2c2c] rounded cursor-pointer">
            <Play size={14} fill="currentColor" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 bg-[#0f0f0f] hairline-r flex-col shrink-0">
          <SidebarContent currentPath={location.pathname} />
        </aside>

        {/* Left Sidebar - Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-40 flex lg:hidden">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="w-64 bg-[#0f0f0f] hairline-r flex flex-col shrink-0 relative h-full">
              <SidebarContent 
                currentPath={location.pathname} 
                onItemClick={() => setIsMobileMenuOpen(false)} 
              />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 bg-[#0f0f0f] relative overflow-y-auto flex flex-col scroll-smooth">
          <div className="h-4 sm:h-6 w-full hairline-b bg-[#0f0f0f] flex items-end sticky top-0 z-10">
            <div className="w-full h-1 sm:h-2 flex justify-between px-2 opacity-20">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="w-px h-full bg-[#666]"></div>
              ))}
            </div>
          </div>
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-60 bg-[#0f0f0f] hairline-l flex-col shrink-0 hidden xl:flex">
          <div className="h-10 flex items-center px-4 hairline-b text-[10px] font-bold text-[#666] uppercase tracking-widest bg-[#0f0f0f]">
            Package Info
          </div>
          <div className="p-4 flex flex-col gap-6">
            <div>
              <div className="text-[10px] text-[#666] font-bold mb-2">VERSION</div>
              <div className="flex items-center justify-between text-xs text-white">
                <span>Current</span>
                <span className="font-mono text-[#a0a0a0]">0.9.2</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#666] font-bold mb-2">BUNDLE SIZE</div>
              <div className="flex items-center justify-between text-xs text-white">
                <span>Gzipped</span>
                <span className="font-mono text-[#34d399]">12.4kb</span>
              </div>
            </div>
            <div className="h-px bg-[#2c2c2c]"></div>
            <div>
              <div className="text-[10px] text-[#666] font-bold mb-2">PEER DEPENDENCIES</div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs text-[#a0a0a0]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div>
                  react {'>'}= 18
                </li>
                <li className="flex items-center gap-2 text-xs text-[#a0a0a0]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div>
                  tailwindcss
                </li>
              </ul>
            </div>
            <div className="mt-auto bg-[#1a1a1a] border border-[#2c2c2c] p-3 rounded">
              <div className="text-[10px] font-bold text-white mb-1">Need Cloud Storage?</div>
              <p className="text-[10px] text-[#666] leading-snug mb-2">
                Use our managed S3 bucket for instant setup.
              </p>
              <button className="w-full bg-[#2c2c2c] hover:bg-[#333] border border-[#444] text-white text-[10px] py-1.5 rounded transition-colors">
                View Pricing
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SidebarContent({ 
  currentPath, 
  onItemClick 
}: { 
  currentPath: string;
  onItemClick?: () => void;
}) {
  return (
    <>
      <div className="p-3 hairline-b z-10 bg-[#0f0f0f]">
        <div className="flex items-center gap-2 text-[#666] px-2 py-1.5 rounded border border-transparent hover:border-[#333] hover:bg-[#1a1a1a] transition-all cursor-text group">
          <Search size={12} className="group-hover:text-white transition-colors" />
          <span className="text-xs">Search docs...</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {SIDEBAR_ITEMS.map((item, idx) => {
          if (item.type === 'header') {
            return (
              <div key={idx} className="mt-6 mb-2 px-4 py-1.5 text-[10px] font-bold text-[#666] uppercase tracking-widest flex justify-between group cursor-pointer">
                <span>{item.label}</span>
              </div>
            );
          }

          const isActive = currentPath === item.path;
          const Icon = item.icon!;

          return (
            <Link 
              key={idx} 
              to={item.path!}
              onClick={onItemClick}
              className={cn(
                "layer-item flex items-center gap-2 px-4 py-1.5 cursor-pointer",
                isActive && "active"
              )}
            >
              <Icon size={10} className={cn(!isActive && "text-[#a0a0a0]", isActive && "text-white")} />
              <span className={cn("text-[11px]", isActive ? "font-medium" : "text-[#a0a0a0]")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="p-4 hairline-t text-[10px] text-[#444] leading-relaxed z-10 bg-[#0f0f0f]">
        Open Source.<br />MIT License.<br />Maintained by Uncia.
      </div>
    </>
  );
}

import React from 'react';
import { Check, Github, Disc, MessagesSquare, Twitter, Box } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-12 pb-12 w-full">
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
            <Check size={16} strokeWidth={3} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">File Manager</h1>
        </div>
        <p className="text-sm sm:text-[15px] sm:leading-7 text-[#a0a0a0] max-w-2xl mb-8">
          A provider-agnostic, headless-first file management system for React & Next.js.<br className="hidden sm:block" />
          Supports nested folders, bulk actions, and optimistic UI updates out of the box.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button className="bg-white text-black px-4 py-1.5 rounded text-[13px] font-semibold hover:bg-gray-200 transition-colors">
            Get Started
          </button>
          <a href="https://github.com/unciatech/file-manager" target="_blank" rel="noreferrer" className="px-4 py-1.5 rounded text-[13px] font-medium text-[#a0a0a0] border border-[#333] hover:border-[#666] hover:text-white transition-all flex items-center gap-2 bg-[#1a1a1a]">
            <Github size={14} fill="currentColor" />
            Star on GitHub
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <div className="group">
          <div className="aspect-1.5/1 bg-[#000] border border-[#2c2c2c] rounded-md mb-4 overflow-hidden relative group-hover:border-[#444] transition-colors">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border border-[#34d399] rounded-full opacity-20 group-hover:opacity-50 transition-opacity glow-effect shadow-[0_0_30px_rgba(52,211,153,0.3)]"></div>
              <div className="absolute w-6 h-6 border border-[#22d3ee] rounded-full opacity-40 blur-[1px]"></div>
            </div>
            <div className="absolute bottom-3 left-3 flex gap-2 w-full max-w-[calc(100%-24px)] flex-wrap">
              <div className="bg-[#1e1e1e] border border-[#333] px-2 py-1 rounded text-[10px] text-[#a0a0a0]">Full Page</div>
              <div className="bg-[#1e1e1e] border border-[#333] px-2 py-1 rounded text-[10px] text-[#a0a0a0]">Modal</div>
            </div>
          </div>
          <h3 className="text-[13px] font-bold text-white mb-1.5">Dual Operating Modes</h3>
          <p className="text-[11px] leading-relaxed text-[#666]">Switch seamlessly between a dashboard view and a picker overlay without changing props.</p>
        </div>
        <div className="group">
          <div className="aspect-1.5/1 bg-[#000] border border-[#2c2c2c] rounded-md mb-4 overflow-hidden relative group-hover:border-[#444] transition-colors">
            <div className="absolute inset-0 flex items-center justify-center gap-1.5">
              <div className="w-[10px] h-10 bg-[#2c2c2c] rounded-sm"></div>
              <div className="w-[10px] h-10 bg-[#2c2c2c] rounded-sm"></div>
              <div className="w-[10px] h-10 bg-[#2c2c2c] rounded-sm"></div>
              <div className="absolute w-full h-px bg-linear-to-r from-transparent via-[#22d3ee]/50 to-transparent top-1/2"></div>
            </div>
          </div>
          <h3 className="text-[13px] font-bold text-white mb-1.5">Optimistic Updates</h3>
          <p className="text-[11px] leading-relaxed text-[#666]">UI updates instantly. Failed requests rollback gracefully with toast notifications via Sonner.</p>
        </div>
        <div className="group">
          <div className="aspect-1.5/1 bg-[#000] border border-[#2c2c2c] rounded-md mb-4 overflow-hidden relative group-hover:border-[#444] transition-colors">
            <div className="absolute inset-0 flex items-center justify-center">
              <Box size={24} strokeWidth={1} className="text-[#666]" />
            </div>
          </div>
          <h3 className="text-[13px] font-bold text-white mb-1.5">Provider Agnostic</h3>
          <p className="text-[11px] leading-relaxed text-[#666]">Bring your own backend. Adapters for S3, Cloudinary, and local storage included.</p>
        </div>
      </div>

      {/* Terminal Block */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px bg-[#333] flex-1"></div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#666]">Quick Start</h2>
          <div className="h-px bg-[#333] flex-1"></div>
        </div>
        <div className="bg-[#000] border border-[#2c2c2c] rounded-lg p-0 overflow-hidden w-full overflow-x-auto">
          <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#2c2c2c] flex items-center justify-between min-w-[300px]">
            <span className="text-[10px] font-mono text-[#666]">TERMINAL</span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#333]"></div>
              <div className="w-2 h-2 rounded-full bg-[#333]"></div>
            </div>
          </div>
          <div className="p-4 sm:p-6 font-mono text-xs overflow-x-auto">
            <div className="flex gap-2 mb-2 whitespace-nowrap">
              <span className="text-[#444] shrink-0">$</span>
              <span className="text-white">npm install @unciatech/file-manager sonner</span>
            </div>
            <div className="flex gap-2 whitespace-nowrap">
              <span className="text-[#444] shrink-0">$</span>
              <span className="text-white">npx uncia init</span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Section */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-px bg-[#333] flex-1"></div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#666]">Community & Support</h2>
          <div className="h-px bg-[#333] flex-1"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <a href="#" className="flex items-center gap-3 p-4 rounded-lg bg-[#000] border border-[#2c2c2c] hover:border-[#444] group transition-all">
            <div className="w-8 h-8 rounded bg-[#5865F2]/10 flex items-center justify-center text-[#5865F2] shrink-0">
              <Disc size={16} fill="currentColor" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">Discord</span>
              <span className="text-[10px] text-[#666] truncate">Chat with developers</span>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-lg bg-[#000] border border-[#2c2c2c] hover:border-[#444] group transition-all">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white shrink-0">
              <MessagesSquare size={16} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">Discussions</span>
              <span className="text-[10px] text-[#666] truncate">Help & Feature requests</span>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-lg bg-[#000] border border-[#2c2c2c] hover:border-[#444] group transition-all">
            <div className="w-8 h-8 rounded bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2] shrink-0">
              <Twitter size={14} fill="currentColor" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">Twitter</span>
              <span className="text-[10px] text-[#666] truncate">Follow for updates</span>
            </div>
          </a>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg border border-[#2c2c2c] p-4 flex sm:items-center justify-between flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
            <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest shrink-0">Contributors</span>
            <div className="flex -space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <div className="w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#22d3ee] flex items-center justify-center text-[8px] font-bold text-black shrink-0">TR</div>
              <div className="w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#c678dd] flex items-center justify-center text-[8px] font-bold shrink-0">ME</div>
              <div className="w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#34d399] flex items-center justify-center text-[8px] font-bold text-black shrink-0">SW</div>
              <div className="w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#d19a66] flex items-center justify-center text-[8px] font-bold shrink-0">BK</div>
              <div className="w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#333] flex items-center justify-center text-[8px] text-[#666] shrink-0">+18</div>
            </div>
          </div>
          <span className="text-xs text-[#666] font-mono shrink-0">22 contributors total</span>
        </div>
      </div>
    </div>
  );
}

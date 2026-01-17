'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Database, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Sources', href: '/sources', icon: Database },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-100 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 relative">
            <img src="/logo.png" alt="Trend Pulse Logo" className="object-contain" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Trend Pulse
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                    ? 'bg-zinc-800 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-blue-400' : ''} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
        })}
      </nav>
      
      <div className="p-4 border-t border-zinc-800 space-y-4">
        <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-2 w-full text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
        >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
        </button>

        <div className="flex items-center gap-3 px-4 py-2 text-zinc-500 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Status: Active
        </div>
      </div>
    </aside>
  );
}

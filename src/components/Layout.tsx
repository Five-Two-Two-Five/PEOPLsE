import { ReactNode } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { 
  BarChart3, 
  History, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Zap,
  Globe,
  Wallet,
  ShieldAlert
} from 'lucide-react';
import { Button } from './Button';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
  user: User | null;
  profile: UserProfile | null;
  onLogout: () => void;
  activeView: string;
  onViewChange: (view: any) => void;
  isAdminMode?: boolean;
}

export function Layout({ children, user, profile, onLogout, activeView, onViewChange, isAdminMode = false }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const contributorNav = [
    { id: 'dashboard', label: 'Platform', icon: BarChart3 },
    { id: 'pledges', label: 'Manifesto', icon: History },
    { id: 'profile', label: 'Intelligence', icon: UserIcon },
  ];

  const adminNav = [
    { id: 'admin', label: 'System Command', icon: ShieldAlert },
    { id: 'dashboard', label: 'Public Analytics', icon: BarChart3 },
  ];

  const navItems = isAdminMode ? adminNav : contributorNav;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row font-sans selection:bg-brand selection:text-black">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0A0A0A] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isAdminMode ? "bg-white" : "bg-brand")}>
            <Zap className="text-black w-5 h-5 fill-black" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">PEOPLsE</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-white">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-0 z-50 md:relative md:flex md:flex-col w-72 bg-[#0A0A0A] border-r border-white/10 text-white transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full relative">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 rotate-180 pointer-events-none opacity-10 hidden md:block" style={{ writingMode: 'vertical-rl' }}>
            <span className="text-[10px] tracking-[1em] uppercase font-black whitespace-nowrap">ESTABLISHED MMXXIV — GLOBAL SCALE</span>
          </div>

          <div className="p-8 hidden md:flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isAdminMode ? "bg-white" : "bg-brand")}>
              <Zap className={cn("text-black w-6 h-6 fill-black", isAdminMode && "animate-pulse")} />
            </div>
            <span className={cn("font-black text-2xl tracking-tighter uppercase italic", isAdminMode ? "text-white" : "text-brand")}>PEOPLsE</span>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2">
            <div className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
              {isAdminMode ? 'System.Authority' : 'System.Controllers'}
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-none text-xs font-black uppercase tracking-widest transition-all border-l-2",
                  activeView === item.id 
                    ? `border-brand bg-white/5 ${isAdminMode ? 'text-white' : 'text-brand'}` 
                    : "border-transparent text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-8 border-t border-white/10">
            {isAdminMode ? (
              <div className="bg-white/5 p-6 mb-8 border border-white/10 border-brand/30">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className="w-4 h-4 text-brand" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand italic underline">Admin Server</span>
                </div>
                <div className="text-[10px] font-bold text-white/40 uppercase leading-relaxed">
                  ZETDC.Command.v4<br/>Auth: Bypassed_Session
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden bg-white/5">
                    {user ? (
                      <img src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} alt="User" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-black uppercase tracking-tighter">?</div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">{user?.displayName || 'Unknown'}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="w-1.5 h-1.5 bg-brand rounded-full"></div>
                       <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter truncate">Live Connection</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 p-6 mb-8 border border-white/10">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                    <span className="text-white/40">Credits.Pool</span>
                    <span className="text-brand font-mono italic">+{profile?.credits.toFixed(2) || '0.00'} Units</span>
                  </div>
                  <div className="h-1 bg-white/10 w-full">
                    <div className="h-full bg-brand w-2/3 shadow-[0_0_10px_#CCFF00]"></div>
                  </div>
                </div>
              </>
            )}

            <Button 
              className="w-full justify-start py-4 h-auto"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Terminate
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen custom-scrollbar">
        <div className="max-w-7xl mx-auto p-6 md:p-12 relative">
          {/* Background Ambient Circle */}
          <div className="fixed top-[10%] right-[5%] w-[600px] h-[600px] rounded-full border border-white/5 pointer-events-none opacity-20 -z-10" />
          {children}
        </div>
      </main>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

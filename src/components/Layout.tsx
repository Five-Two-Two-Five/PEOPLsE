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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-brand">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">PEOPLsE</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-0 z-50 md:relative md:flex md:flex-col w-64 bg-slate-50 border-r border-slate-200 transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full bg-white md:bg-transparent">
          <div className="p-8 hidden md:flex items-center gap-4">
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-brand">
              <Zap className="text-white w-6 h-6 fill-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight">PEOPLsE</span>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-1">
            <div className="px-4 mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isAdminMode ? 'Administration' : 'Menu'}
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all",
                  activeView === item.id 
                    ? "bg-brand/10 text-brand"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-200 bg-white md:bg-transparent">
            {isAdminMode ? (
              <div className="bg-brand/5 p-4 mb-6 border border-brand/20 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-brand" />
                  <span className="text-xs font-bold text-brand">Admin Mode</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  ZETDC Command v4<br/>Secure Session
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100">
                    {user ? (
                      <img src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} alt="User" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold">?</div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user?.displayName || 'Unknown'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Connected</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-100/50 p-4 mb-6 border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-slate-400">Balance</span>
                    <span className="text-brand">+{profile?.credits.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-brand w-2/3" style={{ width: `${Math.min(((profile?.credits || 0) / 100) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </>
            )}

            <Button 
              className="w-full justify-start py-2.5"
              variant="outline"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          {children}
        </div>
      </main>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

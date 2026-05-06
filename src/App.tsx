/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signIn, logout, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from './types';
import { seedInitialData } from './lib/mockData';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { PledgesView } from './views/PledgesView';
import { ProfileView } from './views/ProfileView';
import { AdminDashboard } from './views/AdminDashboard';
import { Zap, LogIn, ShieldAlert } from 'lucide-react';
import { Button } from './components/Button';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'pledges' | 'profile' | 'admin'>('dashboard');
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    seedInitialData();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = doc(db, 'users', u.uid);
        const snap = await getDoc(userDoc);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          // Initialize profile
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            name: u.displayName || 'Contributor',
            neighborhoodId: 'zone-01',
            meterId: 'MTR-' + Math.random().toString(36).substring(7).toUpperCase(),
            credits: 0,
            isSocialTariff: false,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDoc, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAdminAccess = () => {
    setIsAdminMode(true);
    setView('admin');
  };

  const handleLogout = async () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      setView('dashboard');
    } else {
      await logout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A]">
        <Zap className="w-12 h-12 text-brand animate-pulse mb-4" />
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand/60 animate-pulse">Initializing.Core...</div>
      </div>
    );
  }

  if (!user && !isAdminMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] px-4 font-sans selection:bg-brand selection:text-black relative overflow-hidden">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        
        {/* Decorative Floating Circle */}
        <div className="absolute right-[10%] top-[20%] w-[300px] h-[300px] rounded-full border border-white/5 flex items-center justify-center pointer-events-none">
          <div className="w-[180px] h-[180px] rounded-full border border-brand/20 flex items-center justify-center">
             <div className="w-[100px] h-[100px] bg-brand rounded-full opacity-10 blur-xl"></div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl z-10"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center shadow-[0_0_20px_#CCFF0050]">
              <Zap className="text-black w-6 h-6 fill-black" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.4em] text-white/60">System.Architects — Protocol 2.0</span>
          </div>

          <h1 className="text-[120px] leading-[0.8] font-black tracking-[-0.04em] uppercase m-0 mb-12">
            OPTIMIZE<br/>
            <span className="text-brand italic">FUTURE</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <div className="max-w-md">
              <p className="text-xl text-white/50 leading-relaxed font-medium">
                PEOPLsE is the participative energy management platform that empowers households to voluntarily stabilize the national grid.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={signIn} 
                className="w-full justify-between py-8 text-xl font-black italic rounded-none border border-brand/50 group"
                variant="primary"
              >
                Join Protocol
                <LogIn className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </Button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-white/10"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">or</span>
                <div className="h-[1px] flex-1 bg-white/10"></div>
              </div>

              <Button 
                onClick={handleAdminAccess} 
                className="w-full justify-between py-6 text-sm font-black italic rounded-none border border-white/10 bg-white/5 hover:bg-white/10 group"
                variant="secondary"
              >
                System Admin Console
                <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform text-brand" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Vertical Rail Text */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-180 opacity-20 hidden md:block" style={{ writingMode: 'vertical-rl' }}>
          <span className="text-[8px] tracking-[0.8em] uppercase font-black">STABILIZING THE GRID ONE HOUSEHOLD AT A TIME — MMXXIV</span>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      profile={profile} 
      onLogout={handleLogout} 
      activeView={isAdminMode ? 'admin' : view} 
      onViewChange={setView}
      isAdminMode={isAdminMode}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={view + (isAdminMode ? '-admin' : '')}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isAdminMode ? (
            <AdminDashboard />
          ) : (
            <>
              {view === 'dashboard' && <Dashboard profile={profile} />}
              {view === 'pledges' && <PledgesView profile={profile} />}
              {view === 'profile' && <ProfileView profile={profile} onUpdate={setProfile} />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}


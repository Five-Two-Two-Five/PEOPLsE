import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Pledge, PledgeStatus, RewardTier } from '../types';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/UI';
import { cn } from '../lib/utils';
import { 
  Plus, 
  Calendar, 
  Clock, 
  History, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  TrendingDown,
  Wallet,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export function PledgesView({ profile }: { profile: UserProfile | null }) {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [startTime, setStartTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [duration, setDuration] = useState(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'pledges'), 
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setPledges(snap.docs.map(d => ({ ...d.data(), id: d.id } as Pledge)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pledges');
    });
    return unsub;
  }, [profile]);

  const handleSubmitPledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    
    try {
      const start = new Date(startTime);
      const isPeak = start.getHours() >= 17 && start.getHours() <= 21;
      const tier: RewardTier = isPeak ? 'peak' : 'standard';
      const credit = duration * (isPeak ? 1.5 : 0.5);

      await addDoc(collection(db, 'pledges'), {
        userId: profile.uid,
        neighborhoodId: profile.neighborhoodId,
        startTime: Timestamp.fromDate(start),
        durationHours: duration,
        status: 'pending',
        rewardTier: tier,
        expectedCredit: credit,
        verified: false,
        createdAt: Timestamp.now()
      });
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'pledges');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-12 gap-8">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4">Registry.Archives</div>
          <h1 className="text-6xl font-black uppercase tracking-tighter m-0 italic">Active<br/>Manifesto</h1>
        </div>
        <Button onClick={() => setIsAdding(true)} className="py-6 px-12 text-lg italic">
          <Plus className="w-5 h-5 mr-3" />
          Initialize Pledge
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-12"
          >
            <Card className="bg-brand text-black border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="w-40 h-40 fill-black" />
              </div>
              <CardContent className="p-12 relative z-10">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 italic">New Operational Commitment</h2>
                <form onSubmit={handleSubmitPledge} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Temporal Start</label>
                    <input 
                      type="datetime-local" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-black/10 px-6 py-4 rounded-none border border-black/10 text-black font-black uppercase tracking-widest outline-none focus:bg-white/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Load Duration (H)</label>
                    <select 
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-black/10 px-6 py-4 rounded-none border border-black/10 text-black font-black uppercase tracking-widest outline-none appearance-none"
                    >
                      <option value={1}>01 Hour</option>
                      <option value={2}>02 Hours</option>
                      <option value={3}>03 Hours</option>
                      <option value={4}>04 Hours</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-3">
                    <Button type="submit" className="flex-1 py-4 bg-black text-brand hover:bg-black/80" disabled={loading}>
                      {loading ? 'Transmitting...' : 'Confirm'}
                    </Button>
                    <Button variant="outline" type="button" onClick={() => setIsAdding(false)} className="py-4 border-black/20 text-black hover:bg-black/5">
                      Abort
                    </Button>
                  </div>
                </form>
                <div className="mt-8 pt-8 border-t border-black/10 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-black rounded-full animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest">Projected Return: ${ (duration * (new Date(startTime).getHours() >= 17 ? 1.5 : 0.5)).toFixed(2) } Unit Credits</span>
                   </div>
                   <span className="text-[10px] font-bold uppercase opacity-60">Verified Grid Contribution</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Card className="bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between bg-transparent py-8">
              <h2 className="text-xl font-black uppercase tracking-tight italic">Registry History</h2>
              <History className="w-5 h-5 text-white/30" />
            </CardHeader>
            <div className="grid grid-cols-1 gap-px bg-white/10 bg-opacity-10">
              {pledges.length === 0 ? (
                <div className="p-24 text-center bg-[#0A0A0A]">
                  <TrendingDown className="w-16 h-16 text-white/10 mx-auto mb-6" />
                  <p className="text-white/40 uppercase font-black tracking-widest text-[10px]">Zero records found in local segment</p>
                </div>
              ) : (
                pledges.map((pledge) => (
                  <div key={pledge.id} className="p-8 bg-[#0A0A0A] hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-8">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center border-2 uppercase font-black text-xs italic",
                        (pledge.status === 'completed' || pledge.status === 'approved') ? "border-brand text-brand" :
                        pledge.status === 'pending' ? "border-white/20 text-white/40" :
                        "border-red-500/50 text-red-500"
                      )}>
                        {pledge.status === 'completed' ? 'CP' : pledge.status === 'approved' ? 'AP' : pledge.status === 'pending' ? 'PD' : 'FL'}
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-lg font-black uppercase tracking-tighter">
                            {format(pledge.startTime.toDate(), 'MMM dd')}
                          </span>
                          <StatusBadge 
                            status={pledge.status.toUpperCase()} 
                            variant={
                              pledge.status === 'completed' ? 'success' : 
                              pledge.status === 'pending' ? 'info' : 
                              pledge.status === 'approved' ? 'success' : 'neutral'
                            } 
                          />
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                          <span className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                             {format(pledge.startTime.toDate(), 'HH:mm')} — {pledge.durationHours}H Sync
                          </span>
                          <span className="text-brand">Tier: {pledge.rewardTier}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black italic tracking-tighter text-white group-hover:text-brand transition-colors">+${pledge.expectedCredit.toFixed(2)}</p>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-tighter mt-1">Grid Incentive</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-12">
          <Card className="bg-brand border-none text-black relative overflow-hidden h-64">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CheckCircle2 className="w-40 h-40 fill-black" />
            </div>
            <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Compliance Ratio</h3>
              <div className="text-7xl font-black tracking-[-0.06em]">100%</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-4">Zero Deviations Detected</p>
                <div className="h-1 bg-black/10 w-full">
                  <div className="h-full bg-black w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Protocol Guidelines</h3>
            {[
              { id: 'ST', title: 'Standard Sync', desc: 'Base off-peak reduction. $0.50/Hr credit applied.' },
              { id: 'PK', title: 'Peak Pressure', desc: '17:00—21:00 Windows. $1.50/Hr + Restoration Priority.' },
              { id: 'ER', title: 'Emergency State', desc: 'Critical grid events. 20% total account subsidy.' }
            ].map(item => (
              <div key={item.id} className="flex gap-6 items-start p-6 border border-white/5 bg-white/5">
                <div className="text-xl font-black italic text-brand shrink-0">{item.id}</div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">{item.title}</h4>
                  <p className="text-[10px] font-medium leading-relaxed text-white/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

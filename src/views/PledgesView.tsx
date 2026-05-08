import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Pledge, RewardTier } from '../types';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/UI';
import { cn } from '../lib/utils';
import { 
  Plus, 
  History, 
  CheckCircle2, 
  TrendingDown,
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
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-12 gap-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Registry Archives</div>
          <h1 className="text-6xl font-bold tracking-tight text-slate-900 m-0">Active<br/>Manifesto</h1>
        </div>
        <Button onClick={() => setIsAdding(true)} size="lg" className="px-8">
          <Plus className="w-5 h-5 mr-2" />
          Initialize Pledge
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12"
          >
            <Card className="bg-brand text-white border-none relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="w-40 h-40 fill-white" />
              </div>
              <CardContent className="p-12 relative z-10">
                <h2 className="text-4xl font-bold tracking-tight mb-8">New Operational Commitment</h2>
                <form onSubmit={handleSubmitPledge} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80">Start Time</label>
                    <input 
                      type="datetime-local" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-white/20 px-6 py-4 rounded-md border border-white/20 text-white font-bold outline-none focus:bg-white/30 transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80">Duration (Hours)</label>
                    <select 
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-white/20 px-6 py-4 rounded-md border border-white/20 text-white font-bold outline-none appearance-none cursor-pointer focus:bg-white/30 transition-colors"
                    >
                      <option value={1} className="text-slate-900">01 Hour</option>
                      <option value={2} className="text-slate-900">02 Hours</option>
                      <option value={3} className="text-slate-900">03 Hours</option>
                      <option value={4} className="text-slate-900">04 Hours</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-3">
                    <Button type="submit" className="flex-1 py-4 bg-white text-brand hover:bg-slate-100" disabled={loading}>
                      {loading ? 'Transmitting...' : 'Confirm'}
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => setIsAdding(false)} className="py-4 text-white hover:bg-white/10">
                      Abort
                    </Button>
                  </div>
                </form>
                <div className="mt-8 pt-8 border-t border-white/20 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      <span className="text-sm font-semibold">Projected Return: ${ (duration * (new Date(startTime).getHours() >= 17 ? 1.5 : 0.5)).toFixed(2) } Unit Credits</span>
                   </div>
                   <span className="text-xs font-medium opacity-80 italic">Verified Grid Contribution</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-6">
              <h2 className="text-xl font-bold text-slate-900">Registry History</h2>
              <History className="w-5 h-5 text-slate-400" />
            </CardHeader>
            <div className="divide-y divide-slate-100">
              {pledges.length === 0 ? (
                <div className="p-24 text-center bg-white">
                  <TrendingDown className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                  <p className="text-sm font-medium text-slate-400">Zero records found in local segment</p>
                </div>
              ) : (
                pledges.map((pledge) => (
                  <div key={pledge.id} className="p-8 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center border-2 rounded-md font-bold text-sm",
                        pledge.status === 'completed' ? "border-green-200 text-green-600 bg-green-50" :
                        pledge.status === 'pending' ? "border-slate-200 text-slate-400 bg-slate-50" :
                        "border-red-200 text-red-600 bg-red-50"
                      )}>
                        {pledge.status === 'completed' ? 'CP' : pledge.status === 'pending' ? 'PD' : 'FL'}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-bold text-slate-900">
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
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-2">
                             {format(pledge.startTime.toDate(), 'HH:mm')} — {pledge.durationHours}H Sync
                          </span>
                          <span className="text-brand font-semibold">Tier: {pledge.rewardTier}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-brand transition-colors">+${pledge.expectedCredit.toFixed(2)}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Grid Incentive</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-12">
          <Card className="bg-brand border-none text-white relative overflow-hidden h-64 shadow-lg">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CheckCircle2 className="w-40 h-40 fill-white" />
            </div>
            <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-80">Compliance Ratio</h3>
              <div className="text-7xl font-bold tracking-tight">100%</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3">Zero Deviations Detected</p>
                <div className="h-1.5 bg-white/20 w-full rounded-full">
                  <div className="h-full bg-white w-full rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Protocol Guidelines</h3>
            {[
              { id: 'ST', title: 'Standard Sync', desc: 'Base off-peak reduction. $0.50/Hr credit applied.' },
              { id: 'PK', title: 'Peak Pressure', desc: '17:00—21:00 Windows. $1.50/Hr + Restoration Priority.' },
              { id: 'ER', title: 'Emergency State', desc: 'Critical grid events. 20% total account subsidy.' }
            ].map(item => (
              <div key={item.id} className="flex gap-4 items-start p-6 border border-slate-200 bg-white rounded-lg shadow-sm">
                <div className="text-lg font-bold text-brand shrink-0">{item.id}</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

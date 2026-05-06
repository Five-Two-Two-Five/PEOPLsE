import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Pledge, Neighborhood } from '../types';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { 
  ShieldAlert, 
  Server, 
  Activity, 
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function AdminDashboard() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qPledges = query(collection(db, 'pledges'), orderBy('createdAt', 'desc'), limit(50));
    const unsubPledges = onSnapshot(qPledges, (snap) => {
      setPledges(snap.docs.map(d => ({ ...d.data(), id: d.id } as Pledge)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pledges');
    });

    const unsubN = onSnapshot(collection(db, 'neighborhoods'), (snap) => {
      setNeighborhoods(snap.docs.map(d => ({ ...d.data(), id: d.id } as Neighborhood)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'neighborhoods');
    });

    return () => {
      unsubPledges();
      unsubN();
    };
  }, []);

  const handleAction = async (pledgeId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'pledges', pledgeId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `pledges/${pledgeId}`);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-12 gap-8">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-4 flex items-center gap-2">
            <ShieldAlert className="w-3 h-3" />
            System Authority — Level 01
          </div>
          <h1 className="text-8xl leading-none font-black tracking-[-0.04em] uppercase m-0">
            Grid<br/>
            <span className="text-brand italic">Command</span>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-4xl font-black italic tracking-tighter uppercase">Total.Sync</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40">ZETDC Coordination Layer</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-transparent">
            <CardHeader className="py-8 bg-transparent border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-widest italic border-none">Pending Pledges</h2>
              <Server className="w-5 h-5 text-white/20" />
            </CardHeader>
            <div className="grid grid-cols-1 gap-px bg-white/10">
              {pledges.filter(p => p.status === 'pending').length === 0 ? (
                <div className="p-24 text-center bg-[#0A0A0A]">
                  <CheckCircle className="w-12 h-12 text-brand mx-auto mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Buffer Empty — Queue Cleared</p>
                </div>
              ) : (
                pledges.filter(p => p.status === 'pending').map((p) => (
                  <div key={p.id} className="p-8 bg-[#0A0A0A] flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-8">
                      <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center font-black italic text-xs">
                        {p.rewardTier === 'peak' ? 'PK' : 'ST'}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-white">{p.userId.substring(0, 12)}...</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                          {format(p.startTime.toDate(), 'HH:mm')} ({p.durationHours}H) — {p.neighborhoodId}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button 
                        size="sm" 
                        variant="primary" 
                        className="py-3 px-6 h-auto"
                        onClick={() => handleAction(p.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="py-3 px-6 h-auto border-red-500/50 text-red-500 hover:bg-red-500/10"
                        onClick={() => handleAction(p.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-12">
          <Card className="bg-brand text-black border-none h-64 flex flex-col justify-between">
            <CardContent className="p-8 h-full flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Node Status</span>
              <div className="text-5xl font-black italic leading-none">ONLINE</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-relaxed">
                Decision layer operational.<br/>Relay commands: Active.
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Grid Segments</h3>
            {neighborhoods.map(n => (
              <div key={n.id} className="p-6 border border-white/5 bg-white/5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest italic">{n.name}</span>
                  <Activity className={cn("w-4 h-4", n.currentLoadKw / n.transformerCapacityKw > 0.8 ? "text-red-500" : "text-brand")} />
                </div>
                <div className="h-1.5 bg-white/5 w-full">
                  <div 
                    className={cn("h-full transition-all duration-1000", n.currentLoadKw / n.transformerCapacityKw > 0.8 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-brand shadow-[0_0_10px_#CCFF0050]")}
                    style={{ width: `${(n.currentLoadKw / n.transformerCapacityKw) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-white/40">
                  <span>Usage: {n.currentLoadKw}KW</span>
                  <span>Limit: {n.transformerCapacityKw}KW</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

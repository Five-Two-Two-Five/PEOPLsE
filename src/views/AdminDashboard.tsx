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
  const [, setLoading] = useState(true);

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
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-12 gap-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-brand mb-4 flex items-center gap-2">
            <ShieldAlert className="w-3 h-3" />
            System Authority — Level 01
          </div>
          <h1 className="text-6xl font-bold tracking-tight text-slate-900 m-0">
            Grid<br/>
            <span className="text-brand">Command</span>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-4xl font-bold text-slate-900">Total Sync</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">ZETDC Coordination Layer</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="py-6 flex justify-between items-center bg-slate-50 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Pending Pledges</h2>
              <Server className="w-5 h-5 text-slate-400" />
            </CardHeader>
            <div className="divide-y divide-slate-100">
              {pledges.filter(p => p.status === 'pending').length === 0 ? (
                <div className="p-24 text-center bg-white">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium text-slate-400">Buffer Empty — Queue Cleared</p>
                </div>
              ) : (
                pledges.filter(p => p.status === 'pending').map((p) => (
                  <div key={p.id} className="p-8 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center font-bold text-slate-600 text-xs">
                        {p.rewardTier === 'peak' ? 'PK' : 'ST'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{p.userId.substring(0, 12)}...</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          {format(p.startTime.toDate(), 'HH:mm')} ({p.durationHours}H) — {p.neighborhoodId}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={() => handleAction(p.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
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
          <Card className="bg-brand text-white border-none h-64 flex flex-col justify-between">
            <CardContent className="p-8 h-full flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Node Status</span>
              <div className="text-5xl font-bold leading-none">ONLINE</div>
              <div className="text-xs font-medium opacity-90 leading-relaxed">
                Decision layer operational.<br/>Relay commands: Active.
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Grid Segments</h3>
            {neighborhoods.map(n => (
              <div key={n.id} className="p-6 border border-slate-200 bg-white rounded-lg flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">{n.name}</span>
                  <Activity className={cn("w-4 h-4", n.currentLoadKw / n.transformerCapacityKw > 0.8 ? "text-red-600" : "text-green-600")} />
                </div>
                <div className="h-2 bg-slate-100 w-full rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", n.currentLoadKw / n.transformerCapacityKw > 0.8 ? "bg-red-600" : "bg-green-600")}
                    style={{ width: `${(n.currentLoadKw / n.transformerCapacityKw) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
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

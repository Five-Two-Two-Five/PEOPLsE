import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, getDocs, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { GridForecast, UserProfile, Neighborhood, Pledge } from '../types';
import { Card, CardHeader, CardContent } from '../components/Card';
import { ProgressBar, StatusBadge } from '../components/UI';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  AlertTriangle, 
  ChevronRight, 
  Zap, 
  Users, 
  Leaf, 
  Trophy,
  Activity,
  Droplets,
  CloudLightning
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export function Dashboard({ profile, onViewChange }: { profile: UserProfile | null, onViewChange: (view: 'pledges') => void }) {
  const [forecasts, setForecasts] = useState<GridForecast[]>([]);
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Forecasts
    const qForecasts = query(collection(db, 'forecasts'), orderBy('forecastTime', 'asc'), limit(12));
    const unsubForecasts = onSnapshot(qForecasts, (snap) => {
      setForecasts(snap.docs.map(d => ({ ...d.data(), id: d.id } as GridForecast)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'forecasts');
    });

    // Neighborhood
    if (profile?.neighborhoodId) {
      const unsubN = onSnapshot(doc(db, 'neighborhoods', profile.neighborhoodId), (doc) => {
        setNeighborhood(doc.data() as Neighborhood);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `neighborhoods/${profile.neighborhoodId}`);
      });
      return () => {
        unsubForecasts();
        unsubN();
      };
    }

    return () => unsubForecasts();
  }, [profile]);

  const currentStress = forecasts.length > 0 ? forecasts[0].stressLevel : 0;
  const stressColor = currentStress > 80 ? 'text-red-500' : currentStress > 50 ? 'text-amber-400' : 'text-brand';
  const stressBg = currentStress > 80 ? 'bg-red-500' : currentStress > 50 ? 'bg-amber-400' : 'bg-brand';

  return (
    <div className="space-y-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/10">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-brand rounded-full animate-pulse shadow-[0_0_10px_#CCFF00]" />
            Local Node Tracking — Live
          </div>
          <h1 className="text-8xl leading-none font-black tracking-[-0.04em] uppercase m-0">
            System<br/>
            <span className="text-brand italic">Optimized</span>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-4xl font-black italic tracking-tighter">0.42ms</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Latency Buffer</div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10 overflow-hidden">
        <div className="p-8 bg-[#0A0A0A] flex flex-col justify-between h-40">
           <span className="text-[10px] text-white/40 uppercase font-black tracking-widest italic">01 / Stress Index</span>
           <div className="flex items-end gap-2">
             <span className={cn("text-5xl font-black", stressColor)}>{currentStress}%</span>
           </div>
        </div>
        <div className="p-8 bg-[#0A0A0A] flex flex-col justify-between h-40">
           <span className="text-[10px] text-white/40 uppercase font-black tracking-widest italic">02 / Participants</span>
           <span className="text-5xl font-black">1.2K</span>
        </div>
        <div className="p-8 bg-[#0A0A0A] flex flex-col justify-between h-40">
           <span className="text-[10px] text-white/40 uppercase font-black tracking-widest italic">03 / Generation</span>
           <span className="text-5xl font-black text-brand italic uppercase tracking-tighter">Peak</span>
        </div>
        <div
          onClick={() => onViewChange('pledges')}
          className="p-8 bg-brand text-black flex flex-col justify-between h-40 group cursor-pointer hover:bg-white transition-colors duration-500"
        >
           <span className="text-[10px] opacity-60 uppercase font-black tracking-widest italic">04 / Action</span>
           <div className="flex items-center justify-between">
              <span className="text-xl font-black uppercase tracking-tighter">Execute Pledge</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Forecast Chart */}
        <Card className="lg:col-span-2 border-white/5">
          <CardHeader className="bg-transparent border-white/5 py-8">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-black uppercase tracking-tight">Temporal Grid Analytics</h2>
               <div className="flex gap-4">
                 <div className="w-3 h-3 bg-brand/20 border border-brand/50 rounded-none shadow-[0_0_10px_#CCFF0020]" />
                 <div className="w-3 h-3 bg-brand rounded-none" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] pt-8 px-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecasts.map(f => ({
                time: format(f.forecastTime.toDate(), 'HH:mm'),
                stress: f.stressLevel
              }))}>
                <defs>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#ffffff10" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#ffffff40', fontWeight: 900 }} 
                  interval={2}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#ffffff40', fontWeight: 900 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  cursor={{ stroke: '#CCFF00', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff10', borderRadius: '0px' }}
                  itemStyle={{ color: '#CCFF00', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="stepAfter" 
                  dataKey="stress" 
                  stroke="#CCFF00" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorStress)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Neighborhood Status */}
        <div className="space-y-8">
           <Card className="bg-transparent border-white/10">
              <CardContent className="p-8 space-y-8">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-4 italic">Grid.Segment — Alpha</span>
                   <h3 className="text-3xl font-black uppercase mb-6 leading-none italic">{neighborhood?.name || 'Local Transformer'}</h3>
                   
                   <div className="space-y-2 mb-8">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                        <span>Current.Load</span>
                        <span>{neighborhood?.currentLoadKw} / {neighborhood?.transformerCapacityKw} KW</span>
                      </div>
                      <div className="h-6 bg-white/5 p-1">
                         <div 
                           className="h-full bg-brand shadow-[0_0_15px_#CCFF0040]" 
                           style={{ width: `${(neighborhood?.currentLoadKw || 0) / (neighborhood?.transformerCapacityKw || 1) * 100}%` }}
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 border border-white/5">
                         <span className="text-[8px] font-black uppercase tracking-widest text-white/30 block mb-1">Stability</span>
                         <span className="text-lg font-black text-brand italic">92%</span>
                      </div>
                      <div className="bg-white/5 p-4 border border-white/5">
                         <span className="text-[8px] font-black uppercase tracking-widest text-white/30 block mb-1">Temperature</span>
                         <span className="text-lg font-black italic">42°C</span>
                      </div>
                   </div>
                </div>
              </CardContent>
           </Card>

           <div className="p-8 border border-brand/20 bg-brand/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex gap-4 items-start relative z-10">
                <AlertTriangle className="w-6 h-6 text-brand shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand mb-2">Demand Warning</h4>
                  <p className="text-[11px] font-medium leading-relaxed text-white/70">
                    System threshold approaching 85% capacity in <span className="text-white font-black italic">120 Minutes</span>. Voluntary offline pledges required for neighborhood stabilization.
                  </p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

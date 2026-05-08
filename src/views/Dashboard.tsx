import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { GridForecast, UserProfile, Neighborhood } from '../types';
import { Card, CardHeader, CardContent } from '../components/Card';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  AlertTriangle, 
  ChevronRight, 
} from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard({ profile }: { profile: UserProfile | null }) {
  const [forecasts, setForecasts] = useState<GridForecast[]>([]);
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [, setLoading] = useState(true);

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
  const stressColor = currentStress > 80 ? 'text-red-600' : currentStress > 50 ? 'text-orange-500' : 'text-green-600';

  return (
    <div className="space-y-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Local Node Tracking — Live
          </div>
          <h1 className="text-6xl font-bold tracking-tight text-slate-900 m-0">
            System Status:<br/>
            <span className="text-brand">Optimized</span>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-4xl font-bold text-slate-900">0.42ms</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Latency Buffer</div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-8 bg-white flex flex-col justify-between h-40">
           <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">01 / Stress Index</span>
           <div className="flex items-end gap-2">
             <span className={cn("text-5xl font-bold", stressColor)}>{currentStress}%</span>
           </div>
        </div>
        <div className="p-8 bg-white flex flex-col justify-between h-40">
           <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">02 / Participants</span>
           <span className="text-5xl font-bold text-slate-900">1.2K</span>
        </div>
        <div className="p-8 bg-white flex flex-col justify-between h-40">
           <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">03 / Generation</span>
           <span className="text-5xl font-bold text-green-600 italic tracking-tight">Peak</span>
        </div>
        <div className="p-8 bg-brand text-white flex flex-col justify-between h-40 group cursor-pointer hover:bg-brand/90 transition-colors">
           <span className="text-xs opacity-80 uppercase font-bold tracking-wider">04 / Action</span>
           <div className="flex items-center justify-between">
              <span className="text-xl font-bold tracking-tight">Execute Pledge</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Forecast Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="py-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900">Temporal Grid Analytics</h2>
               <div className="flex gap-2">
                 <div className="w-3 h-3 bg-brand/20 rounded-sm" />
                 <div className="w-3 h-3 bg-brand rounded-sm" />
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
                    <stop offset="5%" stopColor="#E24329" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#E24329" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                  interval={2}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  cursor={{ stroke: '#E24329', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#E24329', fontWeight: 600, fontSize: '12px' }}
                />
                <Area 
                  type="monotone"
                  dataKey="stress" 
                  stroke="#E24329"
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorStress)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Neighborhood Status */}
        <div className="space-y-8">
           <Card>
              <CardContent className="p-8 space-y-8">
                <div>
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">Grid Segment — Alpha</span>
                   <h3 className="text-3xl font-bold text-slate-900 mb-6 leading-none">{neighborhood?.name || 'Local Transformer'}</h3>
                   
                   <div className="space-y-3 mb-8">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>Current Load</span>
                        <span>{neighborhood?.currentLoadKw} / {neighborhood?.transformerCapacityKw} KW</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-brand transition-all duration-1000"
                           style={{ width: `${(neighborhood?.currentLoadKw || 0) / (neighborhood?.transformerCapacityKw || 1) * 100}%` }}
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-lg">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Stability</span>
                         <span className="text-xl font-bold text-green-600">92%</span>
                      </div>
                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-lg">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Temperature</span>
                         <span className="text-xl font-bold text-slate-900">42°C</span>
                      </div>
                   </div>
                </div>
              </CardContent>
           </Card>

           <div className="p-8 border border-orange-200 bg-orange-50 rounded-lg relative overflow-hidden">
              <div className="flex gap-4 items-start relative z-10">
                <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-orange-800 mb-1">Demand Warning</h4>
                  <p className="text-sm font-medium leading-relaxed text-orange-700/80">
                    System threshold approaching 85% capacity in <span className="text-orange-900 font-bold">120 Minutes</span>. Voluntary offline pledges required for stabilization.
                  </p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

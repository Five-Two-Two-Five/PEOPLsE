import { useState } from 'react';
import { UserProfile } from '../types';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Zap,
  Settings, 
  ExternalLink, 
  ShieldCheck, 
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile | null;
  onUpdate: (profile: UserProfile) => void;
}

export function ProfileView({ profile, onUpdate }: ProfileViewProps) {
  const [name, setName] = useState(profile?.name || '');
  const [loading, setLoading] = useState(false);

  const neighborhoods = [
    { id: 'zone-01', name: 'Mount Pleasant' },
    { id: 'zone-02', name: 'Avondale' },
    { id: 'zone-03', name: 'Borrowdale' },
    { id: 'zone-04', name: 'Mbare' }
  ];

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), { name });
      onUpdate({ ...profile, name });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-12 gap-8">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 rounded-lg bg-brand flex items-center justify-center shadow-lg">
            <Zap className="w-12 h-12 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-6xl font-bold tracking-tight text-slate-900 m-0">Contributor<br/>{profile?.name}</h1>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Account — Node Authority Root</span>
              <div className="h-[1px] w-12 bg-slate-200"></div>
              <span className="font-mono text-sm text-brand font-semibold tracking-tight">{profile?.meterId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-slate-900">Node Configuration</h2>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Identifier</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white px-4 py-3 rounded-md border border-slate-200 text-slate-900 font-medium outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Grid Segment</label>
              <div className="w-full bg-slate-50 px-4 py-3 rounded-md border border-slate-200 text-slate-500 font-medium flex items-center justify-between">
                <span>{neighborhoods.find(n => n.id === profile?.neighborhoodId)?.name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded font-bold">LOCKED</span>
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full py-4 text-base">
              {loading ? 'Processing...' : 'Update Sync'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-12">
          <Card className="border-brand/20 shadow-lg">
            <CardHeader className="bg-brand/5">
              <h2 className="text-lg font-bold text-brand">Telemetry Health</h2>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="flex items-start gap-4 p-6 bg-slate-50 border border-slate-100 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-brand shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900 mb-1">Decision Layer: active</p>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    Bi-directional communication tunnel established with ZETDC coordination mesh. Real-time override capability: <span className="text-brand font-bold">READY</span>.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                <div className="bg-white p-4 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 uppercase tracking-wider">Protocol</span>
                  <span className="text-slate-900">Direct/Relay.v4</span>
                </div>
                <div className="bg-white p-4 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 uppercase tracking-wider">Encryption</span>
                  <span className="text-brand font-mono">AES-256-GCM</span>
                </div>
                <div className="bg-white p-4 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 uppercase tracking-wider">Status</span>
                  <span className="text-green-600 font-bold italic">Synchronized</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
             <Button variant="outline" className="justify-between p-4 h-auto">
                <span className="text-xs font-bold uppercase tracking-wider">Archives</span>
                <ExternalLink className="w-4 h-4" />
             </Button>
             <Button variant="outline" className="justify-between p-4 h-auto">
                <span className="text-xs font-bold uppercase tracking-wider">Protocols</span>
                <Settings className="w-4 h-4" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

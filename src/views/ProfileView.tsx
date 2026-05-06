import { useState } from 'react';
import { UserProfile } from '../types';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Home, 
  Zap,
  MapPin, 
  Settings, 
  ExternalLink, 
  ShieldCheck, 
  FileText,
  BadgeCheck
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
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-12 gap-8">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 rounded-none bg-brand flex items-center justify-center shadow-[0_0_30px_#CCFF0030]">
            <Zap className="w-12 h-12 text-black fill-black" />
          </div>
          <div>
            <h1 className="text-7xl font-black uppercase tracking-tighter italic m-0">Contributor<br/>{profile?.name}</h1>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Account — Node.Authority.Root</span>
              <div className="h-[1px] w-12 bg-white/10"></div>
              <span className="font-mono text-xs text-brand tracking-tighter">{profile?.meterId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="bg-transparent">
          <CardHeader>
            <h2 className="text-lg font-black uppercase tracking-widest italic border-none">Node Configuration</h2>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Identifier</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 px-6 py-4 rounded-none border border-white/10 text-white font-black uppercase tracking-widest outline-none focus:border-brand transition-colors"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Assigned Grid Segment</label>
              <div className="w-full bg-white/5 opacity-50 px-6 py-4 rounded-none border border-white/10 text-white font-black uppercase tracking-widest flex items-center justify-between">
                <span>{neighborhoods.find(n => n.id === profile?.neighborhoodId)?.name}</span>
                <span className="text-[8px] px-2 py-0.5 border border-white/20">LOCKED</span>
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full py-6 text-lg italic">
              {loading ? 'Processing...' : 'Update Sync'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-12">
          <Card className="bg-[#1A1A1A] border-brand/20 shadow-[0_0_40px_rgba(204,255,0,0.05)]">
            <CardHeader className="bg-brand/5 border-brand/10">
              <h2 className="text-lg font-black uppercase tracking-widest italic text-brand">Telemetry Health</h2>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/10">
                <ShieldCheck className="w-6 h-6 text-brand shrink-0" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-white mb-2">Decision Layer: active</p>
                  <p className="text-[11px] font-medium text-white/60 leading-relaxed">
                    Bi-directional communication tunnel established with ZETDC coordination mesh. Real-time override capability: **READY**.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-px bg-white/10 border border-white/10 overflow-hidden">
                <div className="bg-[#1A1A1A] p-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/40">Protocol</span>
                  <span>Direct/Relay.v4</span>
                </div>
                <div className="bg-[#1A1A1A] p-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest font-mono">
                  <span className="text-white/40">Encryption</span>
                  <span className="text-brand">AES-256-GCM</span>
                </div>
                <div className="bg-[#1A1A1A] p-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/40">Status</span>
                  <span className="italic">Synchronized</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
             <Button variant="ghost" className="justify-between p-6 bg-white/5 border border-white/5 hover:border-white/20">
                <span className="text-[10px] font-black uppercase tracking-widest">Archives</span>
                <ExternalLink className="w-3 h-3" />
             </Button>
             <Button variant="ghost" className="justify-between p-6 bg-white/5 border border-white/5 hover:border-white/20">
                <span className="text-[10px] font-black uppercase tracking-widest">Protocols</span>
                <Settings className="w-3 h-3" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowLeft, ArrowRight, Building2, MapPin, HardHat, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';
import ProjectTimeline from './ProjectTimeline';

interface TrackProjectViewProps {
  initialSelectedId?: string | null;
  onClearSelection?: () => void;
}

const TrackProjectView: React.FC<TrackProjectViewProps> = ({ initialSelectedId, onClearSelection }) => {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedItems();
  }, []);

  useEffect(() => {
    if (initialSelectedId && items.length > 0) {
      const item = items.find(i => i.id === initialSelectedId);
      if (item) {
        handleSelectItem(item);
      }
    }
  }, [initialSelectedId, items]);

  const fetchApprovedItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [pRes, cRes] = await Promise.all([
        axios.get(import.meta.env.VITE_API_URL + '/api/petitions/my', { headers: { Authorization: `Bearer ${token}` } }),
        // We assume citizens only track their own complaints or approved ones
        axios.get(import.meta.env.VITE_API_URL + '/api/complaints', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const approvedPetitions = pRes.data.filter((p: any) => p.status === 'APPROVED' || p.status === 'RESOLVED' || p.status === 'REVIEWING').map((p: any) => ({ ...p, type: 'petition' }));
      // For complaints, show user's own approved ones
      const approvedComplaints = cRes.data.filter((c: any) => (c.status === 'APPROVED' || c.status === 'RESOLVED')).map((c: any) => ({ ...c, type: 'complaint' }));
      
      setItems([...approvedPetitions, ...approvedComplaints]);
    } catch (error) {
      console.error('Failed to fetch tracking items');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (type: string, id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpdates(res.data);
    } catch (e) {
      setUpdates([]);
    }
  };
  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    fetchTimeline(item.type, item.id);
  };

  const highlightText = (text: string) => {
    if (!text) return text;
    const keywords = [
      'Urgent', 'Formal', 'Petition', 'Critical', 'deficit', 'insufficient', 
      'educational facilities', 'healthcare units', 'Required Action', 
      'Construction', 'Deployment', 'expansion'
    ];
    let parts = [text];
    keywords.forEach(kw => {
      const newParts: any[] = [];
      parts.forEach(part => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }
        const regex = new RegExp(`(${kw})`, 'gi');
        const split = part.split(regex);
        split.forEach((s, i) => {
          if (regex.test(s)) {
            newParts.push(<span key={i} className="text-[var(--accent)] font-black italic">{s}</span>);
          } else {
            newParts.push(s);
          }
        });
      });
      parts = newParts;
    });
    return parts;
  };

  if (selectedItem) {
    const populationNum = selectedItem.population || 0;
    const severityPct = (selectedItem.severityScore || selectedItem.severity || 0) * 100;

    return (
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <button 
          onClick={() => { setSelectedItem(null); onClearSelection && onClearSelection(); }}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 hover:text-[var(--accent)] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Project List
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-0 border-white/5 bg-[#050b16] overflow-hidden group">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-[10px] text-[var(--accent)] font-black uppercase tracking-[0.4em]">Project Brief</h3>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              </div>
              <div className="p-8 space-y-8">
                <div className="p-5 bg-white/5 rounded-3xl border border-white/10 relative group-hover:border-[var(--accent)]/30 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Building2 size={40} />
                  </div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter mb-2 leading-none">{selectedItem.title || selectedItem.category}</h2>
                  <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                    <MapPin size={12} className="text-[var(--accent)]" /> {selectedItem.locationName}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-[var(--accent)]/20 rounded-full" />
                  <p className="text-xs text-white/60 leading-relaxed font-medium">
                    {highlightText(selectedItem.description || selectedItem.content)}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[8px] uppercase font-black text-white/20 block mb-1">Impact Radius</span>
                    <p className="text-lg font-black italic text-white">{populationNum.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[8px] uppercase font-black text-white/20 block mb-1">Gap Index</span>
                    <p className="text-lg font-black italic text-red-500">{severityPct.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[var(--accent)]/10 to-transparent border border-[var(--accent)]/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Live Pipeline Status</h4>
              <div className="text-3xl font-black italic text-[var(--accent)] uppercase tracking-tighter mb-4">
                {selectedItem.status}
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                  <HardHat size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Registry Auth</p>
                  <p className="text-[10px] font-bold text-white/30">BMC GOV-OS v2.4.1</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
               Governance Lifecycle <div className="flex-1 h-px bg-white/5" />
            </h3>
            <ProjectTimeline 
              currentStage={updates.length > 0 ? Math.max(...updates.map(u => u.stage)) : 1} 
              updates={updates} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <header className="mb-10">
        <h3 className="text-[10px] text-[var(--accent)] font-black uppercase tracking-[0.4em] mb-1">Civilian Oversight</h3>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Project <span className="text-[var(--accent)]">Monitor</span></h2>
        <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em] mt-2">Tracking the implementation lifecycle of approved civic reforms</p>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="p-12 text-center border-dashed border-white/10 opacity-60">
          <Building2 size={48} className="mx-auto mb-4 text-white/20" />
          <h4 className="text-sm font-black uppercase tracking-widest text-white/40">No Approved Projects</h4>
          <p className="text-xs text-white/20 mt-2">Approved petitions and reports will appear here for lifecycle tracking.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard 
                onClick={() => handleSelectItem(item)}
                className={`p-6 transition-all cursor-pointer group relative overflow-hidden ${
                  item.status === 'RESOLVED' 
                    ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                    : 'border-white/5 bg-white/5 hover:border-[var(--accent)]/40'
                }`}
              >
                {item.status === 'RESOLVED' && (
                  <div className="absolute top-0 right-0 p-1 bg-emerald-500 text-black text-[7px] font-black uppercase tracking-widest px-3 rounded-bl-lg">
                    Completed
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    item.type === 'petition' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.type}
                  </div>
                  <span className="text-[10px] font-black text-[var(--accent)] tracking-tighter">#{item.id.slice(-4)}</span>
                </div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter mb-2 group-hover:text-[var(--accent)] transition-colors">{item.title || item.category}</h3>
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-medium mb-6">
                  <MapPin size={12} /> {item.locationName?.split(',')[0]}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className={item.status === 'RESOLVED' ? 'text-emerald-400' : 'text-green-500'} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'RESOLVED' ? 'text-emerald-400' : 'text-green-500/80'}`}>
                      {item.status === 'RESOLVED' ? 'Mission Delivered' : 'Approved'}
                    </span>
                  </div>
                  {item.status === 'RESOLVED' && (
                    <span className="text-[10px] font-black italic text-emerald-400/60 animate-pulse">
                      Thanks for making the impact!
                    </span>
                  )}
                  <ArrowRight size={16} className="text-white/20 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackProjectView;

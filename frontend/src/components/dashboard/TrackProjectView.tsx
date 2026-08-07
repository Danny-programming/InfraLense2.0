import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, HardHat, ChevronRight, Activity, Users, Shield, Clock, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        axios.get(import.meta.env.VITE_API_URL + '/api/complaints', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const approvedPetitions = pRes.data.filter((p: any) => p.status === 'APPROVED' || p.status === 'RESOLVED' || p.status === 'REVIEWING').map((p: any) => ({ ...p, type: 'petition' }));
      const approvedComplaints = cRes.data.filter((c: any) => (c.status === 'APPROVED' || c.status === 'RESOLVED')).map((c: any) => ({ ...c, type: 'complaint' }));
      
      const combined = [...approvedPetitions, ...approvedComplaints];
      setItems(combined);
      
      // Auto-select first item if exists and no initialSelectedId is provided
      if (combined.length > 0 && !initialSelectedId) {
        handleSelectItem(combined[0]);
      }
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

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden bg-[#020812]">
      {/* Left List Pane (40% width) */}
      {isSidebarOpen && (
        <div className="w-[360px] xl:w-[400px] border-r border-white/5 flex flex-col h-full bg-[#050b16]/30 shrink-0">
          <div className="p-6 border-b border-white/5">
            <span className="text-[9px] text-[var(--accent)] font-black uppercase tracking-[0.4em] block mb-1">Civilian Oversight</span>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Project Monitor</h2>
            <p className="text-white/40 text-[9px] uppercase font-bold tracking-widest mt-1.5">Implementation Lifecycles</p>
          </div>
          
          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-xs">No approved projects found.</div>
            ) : (
              items.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-2.5 ${
                      isSelected
                        ? 'bg-[var(--accent)]/5 border-[var(--accent)]/30 shadow-[0_0_15px_rgba(0,245,255,0.02)]'
                        : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10'
                    }`}
                  >
                    {/* Left accent strip for selected */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 w-1 h-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                    )}

                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                        item.type === 'petition' ? 'bg-purple-500/10 text-purple-400 border-purple-500/10' : 'bg-amber-500/10 text-amber-400 border-amber-500/10'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[9px] font-mono text-white/20">#{item.id.slice(-4).toUpperCase()}</span>
                    </div>

                    <div>
                      <h3 className="font-black text-sm text-white group-hover:text-[var(--accent)] transition-colors truncate">{item.title || item.category}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-white/30 font-semibold mt-1">
                        <MapPin size={10} className="text-[var(--accent)] shrink-0" />
                        <span className="truncate">{item.locationName?.split(',')[0]}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${
                        item.status === 'RESOLVED' ? 'text-emerald-400' : 'text-[var(--accent)]'
                      }`}>
                        {item.status === 'RESOLVED' ? 'Delivered' : 'In Progress'}
                      </span>
                      <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.status === 'RESOLVED' ? 'bg-emerald-400' : 'bg-[var(--accent)]'}`}
                          style={{ width: item.status === 'RESOLVED' ? '100%' : '28%' }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Right Detail Pane (60% width) */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar h-full bg-[#020812] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,245,255,0.02),transparent_50%)] pointer-events-none" />
        
        {/* Toggle options bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider"
          >
            {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            {isSidebarOpen ? 'Hide Case List' : 'Show Case List'}
          </button>
          
          {selectedItem && (
            <span className="text-[9px] font-mono text-white/20">LOG PARITY: SECURED</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedItem ? (
            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Header Details */}
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                      selectedItem.type === 'petition' ? 'bg-purple-500/10 text-purple-400 border-purple-500/10' : 'bg-amber-500/10 text-amber-400 border-amber-500/10'
                    }`}>
                      {selectedItem.type}
                    </span>
                    <span className="text-[10px] font-mono text-white/30">ID: CASE_{selectedItem.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-tight">{selectedItem.title || selectedItem.category}</h2>
                  <div className="flex items-center gap-2 text-white/40 text-xs font-semibold mt-1">
                    <MapPin size={12} className="text-[var(--accent)] shrink-0" /> {selectedItem.locationName}
                  </div>
                </div>

                <div className="p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-2xl flex items-center gap-3 shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                    <HardHat size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">State Status</p>
                    <p className="text-xs font-black text-white uppercase tracking-wider">{selectedItem.status}</p>
                  </div>
                </div>
              </div>

              {/* Grid split description and timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Description column */}
                <div className="lg:col-span-1 space-y-6">
                  <GlassCard className="!p-6 border-white/5 bg-[#050b16]/20">
                    <h4 className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest mb-3 block">📌 Project Objective</h4>
                    <p className="text-xs text-white/65 leading-relaxed font-semibold">
                      {highlightText(selectedItem.description || selectedItem.content)}
                    </p>
                  </GlassCard>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                      <span className="text-[8px] uppercase font-black text-white/20 block mb-1">Impact Scope</span>
                      <p className="text-base font-black italic text-white">{(selectedItem.population || 0).toLocaleString()} <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider block">citizens</span></p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                      <span className="text-[8px] uppercase font-black text-white/20 block mb-1">Severity Rating</span>
                      <p className="text-base font-black italic text-red-500">{((selectedItem.severityScore || selectedItem.severity || 0) * 10).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                {/* Timeline column */}
                <div className="lg:col-span-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-6 flex items-center gap-3">
                    Governance Lifecycle Timeline <div className="flex-1 h-[1px] bg-white/5" />
                  </h3>
                  <ProjectTimeline 
                    currentStage={updates.length > 0 ? Math.max(...updates.map(u => u.stage)) : 1} 
                    updates={updates} 
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-45">
              <Building2 size={64} className="text-white/10 mb-4 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/30">Select a Project</h3>
              <p className="text-xs text-white/20 mt-2 max-w-[280px]">Choose a case from the list on the left to track its administrative approvals and implementation milestones.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackProjectView;

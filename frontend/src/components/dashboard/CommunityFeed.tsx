import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Clock, MapPin, ThumbsUp, ChevronDown, ChevronUp, AlertCircle, Users, Activity, Shield } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';

const CommunityFeed: React.FC = () => {
  const [petitions, setPetitions] = useState<any[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(import.meta.env.VITE_API_URL + '/api/petitions/community', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPetitions(res.data);
      } catch { }
    };
    fetch();
  }, []);

  const handleVote = (id: string) => {
    setVotes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getTeaser = (text: string) => {
    if (!text) return '';
    // Look for Executive Summary or key mandate lines
    const summaryIndex = text.indexOf('Executive Summary:');
    if (summaryIndex !== -1) {
      const summary = text.substring(summaryIndex + 18).trim();
      return summary.split('.')[0] + '.';
    }
    const subjectIndex = text.indexOf('Subject:');
    if (subjectIndex !== -1) {
      const subject = text.substring(subjectIndex).trim();
      return subject.split('.')[0] + '.';
    }
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const getPriority = (score: number) => {
    if (score > 80) return { label: 'CRITICAL PRIORITY', style: 'text-red-400 bg-red-500/10 border-red-500/10' };
    if (score > 50) return { label: 'HIGH PRIORITY', style: 'text-amber-400 bg-amber-500/10 border-amber-500/10' };
    return { label: 'STANDARD PRIORITY', style: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/10' };
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <header className="mb-10">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
          <Globe className="text-[var(--accent)]" size={28} /> Community Feed
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">See what citizens across the nation are reporting</p>
      </header>

      <div className="space-y-6 max-w-6xl w-full">
        {petitions.length === 0 ? (
          <div className="h-[40vh] flex items-center justify-center text-[10px] uppercase tracking-[0.4em] font-black text-white/10">No community posts yet</div>
        ) : petitions.map((p, i) => {
          const isExpanded = !!expandedIds[p.id];
          const priority = getPriority(p.severityScore);

          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="!p-8 border-white/5 hover:border-[var(--accent)]/30 hover:shadow-[0_15px_40px_rgba(0,245,255,0.03)] transition-all duration-300 rounded-[2rem] bg-gradient-to-br from-white/[0.01] to-transparent relative overflow-hidden">
                
                {/* Top bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-dim)] to-transparent border border-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-black text-sm">
                      #{i + 1}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-white/45 uppercase tracking-widest block mb-0.5">Anonymous Citizen</span>
                      <div className="flex items-center gap-2 text-[10px] text-white/20 font-medium">
                        <Clock size={10} /> {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${priority.style}`}>
                      {priority.label}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                        p.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/10' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/10'
                      }`}>{p.status}</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="mb-6">
                  <h3 className="font-black text-xl md:text-2xl mb-2 text-white group-hover:text-[var(--accent)] transition-colors tracking-tight leading-tight">{p.title}</h3>
                  <div className="flex items-center gap-2 text-white/40 text-xs font-semibold">
                    <MapPin size={12} className="text-[var(--accent)]" /> {p.locationName}
                  </div>
                </div>

                {/* Telemetry Dashboard Grid (Small Insights) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Insight 1: Severity Progress Bar */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-center gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity size={10} className="text-[var(--accent)]" /> Severity Rating
                      </span>
                      <span className={`text-xs font-black ${p.severityScore > 80 ? 'text-red-400' : 'text-[var(--accent)]'}`}>{p.severityScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full ${p.severityScore > 80 ? 'bg-red-500' : 'bg-[var(--accent)]'}`}
                        style={{ width: `${p.severityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Insight 2: Target Demographics */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4.5">
                    <Users size={18} className="text-purple-400" />
                    <div>
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-0.5">Impact Scope</span>
                      <span className="text-sm font-black text-white">{p.population?.toLocaleString()} <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider ml-1">Citizens</span></span>
                    </div>
                  </div>

                  {/* Insight 3: Core Hazard classification */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4.5">
                    <Shield size={18} className="text-emerald-400" />
                    <div>
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-0.5">Classification</span>
                      <span className="text-sm font-black text-white uppercase tracking-wider">{p.category || 'General'}</span>
                    </div>
                  </div>
                </div>

                {/* Briefing summary (No long raw paragraph) */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl mb-6">
                  <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest block mb-2">📌 Case Mandate Summary</span>
                  <p className="text-sm text-white/60 leading-relaxed font-semibold italic">
                    "{getTeaser(p.content)}"
                  </p>

                  {/* Expandable Document details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-white/5"
                      >
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">📄 Full Petition Document</span>
                        <p className="text-xs text-white/40 leading-relaxed font-medium whitespace-pre-line font-mono">
                          {p.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => toggleExpand(p.id)}
                    className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase text-[var(--accent)] hover:opacity-80 transition-opacity"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={12} /> Collapse Full Document
                      </>
                    ) : (
                      <>
                        <ChevronDown size={12} /> Expand Full Document
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Row Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="text-[9px] font-mono text-white/25">ID: CASE_{p.id.slice(-6).toUpperCase()}</span>
                  <button onClick={() => handleVote(p.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/20 transition-all text-white/40 hover:text-[var(--accent)]"
                  >
                    <ThumbsUp size={12} /> Support Proposal ({votes[p.id] || 0})
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityFeed;

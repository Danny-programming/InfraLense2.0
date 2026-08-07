import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Clock, MapPin, ThumbsUp, ChevronDown, ChevronUp, Users, Activity, Shield, TrendingUp } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';

const CommunityFeed: React.FC = () => {
  const [petitions, setPetitions] = useState<any[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [innerExpandedIds, setInnerExpandedIds] = useState<Record<string, boolean>>({});

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

  const handleVote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent toggling the card accordion
    setVotes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleInnerExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setInnerExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getTeaser = (text: string) => {
    if (!text) return '';
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
    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  };

  const getPriority = (score: number) => {
    if (score > 80) return { label: 'CRITICAL', style: 'text-red-400 bg-red-500/10 border-red-500/10' };
    if (score > 50) return { label: 'HIGH', style: 'text-amber-400 bg-amber-500/10 border-amber-500/10' };
    return { label: 'STANDARD', style: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/10' };
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <header className="mb-10">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
          <Globe className="text-[var(--accent)]" size={28} /> Community Feed
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">See what citizens across the nation are reporting</p>
      </header>

      <div className="space-y-4 max-w-6xl w-full">
        {petitions.length === 0 ? (
          <div className="h-[40vh] flex items-center justify-center text-[10px] uppercase tracking-[0.4em] font-black text-white/10">No community posts yet</div>
        ) : petitions.map((p, i) => {
          const isExpanded = !!expandedIds[p.id];
          const isInnerExpanded = !!innerExpandedIds[p.id];
          const priority = getPriority(p.severityScore);

          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlassCard className={`!p-5 border-white/5 hover:border-[var(--accent)]/30 hover:shadow-[0_10px_30px_rgba(0,245,255,0.02)] transition-all duration-300 rounded-[1.5rem] bg-gradient-to-br from-white/[0.01] to-transparent relative overflow-hidden group ${isExpanded ? '!p-8 border-[var(--accent)]/20 bg-white/[0.02]' : ''}`}>
                
                {/* Visual side highlights */}
                <div className={`absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[var(--accent)] to-transparent transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-20 group-hover:opacity-60'}`} />

                {/* Collapsed Header view (Clickable Row) */}
                <div 
                  onClick={() => toggleExpand(p.id)} 
                  className="flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-dim)] to-transparent border border-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)] font-black text-xs shrink-0 shadow-[0_0_10px_rgba(0,245,255,0.05)]">
                      #{i + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-base text-white group-hover:text-[var(--accent)] transition-colors truncate tracking-tight pr-4 leading-tight">{p.title}</h3>
                      <div className="flex items-center gap-2 text-white/35 text-[10px] font-semibold mt-0.5">
                        <MapPin size={10} className="text-[var(--accent)] shrink-0" />
                        <span className="truncate">{p.locationName?.split(',')[0]}</span>
                        <span className="text-white/10">•</span>
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${priority.style}`}>
                        {priority.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                          p.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/10' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/10'
                        }`}>{p.status}</span>
                    </div>
                    <div className="text-white/20 group-hover:text-white/60 transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-6 pt-6 border-t border-white/5 space-y-6"
                    >
                      {/* Telemetry Dashboard Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Severity */}
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-center gap-2 hover:bg-white/[0.04] transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-white/25 uppercase tracking-widest flex items-center gap-1.5">
                              <Activity size={10} className="text-[var(--accent)]" /> Severity
                            </span>
                            <span className={`text-xs font-black ${p.severityScore > 80 ? 'text-red-400' : 'text-[var(--accent)]'}`}>{p.severityScore}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full ${p.severityScore > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                              style={{ width: `${p.severityScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Impact Scope */}
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                            <Users size={16} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-white/25 uppercase tracking-widest block mb-0.5">Impact Scope</span>
                            <span className="text-sm font-black text-white">{p.population?.toLocaleString()} <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider ml-0.5">Citizens</span></span>
                          </div>
                        </div>

                        {/* Classification */}
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                            <Shield size={16} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-white/25 uppercase tracking-widest block mb-0.5">Classification</span>
                            <span className="text-sm font-black text-white uppercase tracking-wider">{p.category || 'General'}</span>
                          </div>
                        </div>

                        {/* Support Velocity graph */}
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between gap-1.5 hover:bg-white/[0.04] transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-white/25 uppercase tracking-widest flex items-center gap-1.5">
                              <TrendingUp size={10} className="text-pink-400" /> Support Velocity
                            </span>
                            <span className="text-[9px] font-mono text-pink-400 font-bold">+{(p.severityScore * 0.12).toFixed(1)}/hr</span>
                          </div>
                          <div className="h-6 w-full opacity-60">
                            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id={`sparkline-grad-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#f472b6" stopOpacity="0.25"/>
                                  <stop offset="100%" stopColor="#f472b6" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                              <path
                                d={`M0,${25 - (p.severityScore * 0.1)} Q20,5 40,20 T70,3 T90,22 T100,10`}
                                fill="none"
                                stroke="#f472b6"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d={`M0,${25 - (p.severityScore * 0.1)} Q20,5 40,20 T70,3 T90,22 T100,10 L100,30 L0,30 Z`}
                                fill={`url(#sparkline-grad-${p.id})`}
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Briefing summary & System Checklist */}
                      <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl relative">
                        
                        {/* System Health Audit */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full text-[8px] font-black uppercase text-emerald-400 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> GPS Lock Verified
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-full text-[8px] font-black uppercase text-[var(--accent)] tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" /> AI Triage OK
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/5 border border-purple-500/10 rounded-full text-[8px] font-black uppercase text-purple-400 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Notary Secured
                          </div>
                        </div>

                        <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest block mb-2">📌 Case Mandate Summary</span>
                        <p className="text-sm text-white/70 leading-relaxed font-semibold italic">
                          "{getTeaser(p.content)}"
                        </p>

                        {/* Expandable Document details */}
                        <AnimatePresence>
                          {isInnerExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-4 pt-4 border-t border-white/5"
                            >
                              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">📄 Full Petition Document</span>
                              <p className="text-xs text-white/40 leading-relaxed font-medium whitespace-pre-line font-mono bg-black/30 p-4 rounded-xl border border-white/5">
                                {p.content}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          onClick={(e) => toggleInnerExpand(e, p.id)}
                          className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase text-[var(--accent)] hover:opacity-80 transition-opacity"
                        >
                          {isInnerExpanded ? (
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
                        <button 
                          onClick={(e) => handleVote(e, p.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/20 transition-all text-white/40 hover:text-[var(--accent)] shadow-sm hover:shadow-[0_0_15px_rgba(0,245,255,0.1)]"
                        >
                          <ThumbsUp size={12} /> Support Proposal ({votes[p.id] || 0})
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityFeed;

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, Clock, MapPin, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';

const CommunityFeed: React.FC = () => {
  const [petitions, setPetitions] = useState<any[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});

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
        ) : petitions.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="!p-8 border-white/5 hover:border-[var(--accent)]/30 hover:shadow-[0_15px_40px_rgba(0,245,255,0.03)] transition-all duration-300 group rounded-[2rem] bg-gradient-to-br from-white/[0.01] to-transparent relative overflow-hidden">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-white/5 flex items-center justify-center text-[var(--accent)] font-black text-sm">
                    C{(i % 9) + 1}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-0.5">Anonymous Citizen</span>
                    <div className="flex items-center gap-2 text-[10px] text-white/20 font-medium">
                      <Clock size={10} /> {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                    p.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                  }`}>{p.status}</span>
              </div>

              <h3 className="font-black text-xl md:text-2xl mb-3 text-white group-hover:text-[var(--accent)] transition-colors tracking-tight leading-tight">{p.title}</h3>

              <div className="flex items-center gap-2 text-white/40 text-xs mb-5 font-semibold">
                <MapPin size={12} className="text-[var(--accent)]" /> {p.locationName}
              </div>

              <p className="text-sm md:text-base text-white/60 leading-relaxed mb-6 font-medium italic border-l-2 border-white/10 pl-4 py-1">"{p.content}"</p>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex gap-6 text-[10px] text-white/30 uppercase font-black tracking-widest">
                  <span>Severity Score: <span className={`font-black ${p.severityScore > 70 ? 'text-red-400' : 'text-[var(--accent)]'}`}>{p.severityScore}%</span></span>
                  <span>Impact Index: <span className="text-white/60">{p.population?.toLocaleString()} citizens</span></span>
                </div>
                <button onClick={() => handleVote(p.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/20 transition-all text-white/40 hover:text-[var(--accent)]"
                >
                  <ThumbsUp size={12} /> Upvote Case ({votes[p.id] || 0})
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommunityFeed;

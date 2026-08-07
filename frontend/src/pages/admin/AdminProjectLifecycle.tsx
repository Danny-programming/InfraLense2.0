import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/ui/GlassCard';
import { 
  CheckCircle2, 
  Map as MapIcon, 
  Clock, 
  FileSearch, 
  LogOut, 
  BarChart3, 
  Users, 
  Globe, 
  ShieldCheck, 
  ArrowRight,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminProjectLifecycle: React.FC = () => {
  const navigate = useNavigate();
  const [activeQueue, setActiveQueue] = useState<'petitions' | 'complaints'>('petitions');
  const [petitions, setPetitions] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Session terminated.');
    navigate('/');
  };

  const fetchPetitions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/petitions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPetitions(res.data.filter((p: any) => p.status === 'APPROVED'));
    } catch (err) {
      toast.error('Failed to fetch global petitions');
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data.filter((c: any) => c.status === 'APPROVED'));
    } catch (err) {
      toast.error('Failed to fetch infrastructure complaints');
    }
  };

  useEffect(() => {
    fetchPetitions();
    fetchComplaints();
  }, []);

  const currentData = activeQueue === 'petitions' ? petitions : complaints;

  const handleAdvanceStage = async (stageIndex: number) => {
    if (!selectedCase) return;
    
    const isPetition = activeQueue === 'petitions';
    const token = localStorage.getItem('token');
    
    let stageData;
    if (isPetition) {
      stageData = [
        { title: 'Project Verified', desc: 'Case validated by Admin.' },
        { title: 'AA Granted', desc: 'Administrative Approval received.' },
        { title: 'TS Received', desc: 'Technical Sanction confirmed.' },
        { title: 'Tendering Active', desc: 'Contractor bidding initiated.' },
        { title: 'Work Order Issued', desc: 'Execution team assigned.' },
        { title: 'Site Execution', desc: 'Project under construction.' },
        { title: 'Audit & Completion', desc: 'Final audit completed.' },
      ][stageIndex - 1];
    } else {
      stageData = [
        { title: 'Incident Verified', desc: 'On-site verification complete.' },
        { title: 'Work Approved', desc: 'Repair budget approved.' },
        { title: 'Teams Formed', desc: 'Maintenance crews assigned.' },
        { title: 'Deployment', desc: 'Materials dispatched to site.' },
        { title: 'Active Repair', desc: 'Fixing infrastructure in progress.' },
        { title: 'Post-Inspection', desc: 'Quality check of the repair.' },
        { title: 'Resolved', desc: 'Service restored successfully.' },
      ][stageIndex - 1];
    }

    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/projects/advance', {
        caseId: selectedCase.id,
        type: isPetition ? 'petition' : 'complaint',
        stage: stageIndex,
        title: stageData.title,
        description: stageData.desc
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success(`Stage ${stageIndex} Advanced`, {
        icon: '🚀',
        style: { background: '#064e3b', color: '#fff', border: '1px solid rgba(16,185,129,0.2)' }
      });
      
      if (isPetition) fetchPetitions();
      else fetchComplaints();
      
      // Update local state to reflect change instantly without full re-render jump
      setSelectedCase(prev => ({
        ...prev,
        updates: [...(prev.updates || []), { stage: stageIndex }]
      }));
      
    } catch (err) {
      toast.error('Failed to update stage.');
    }
  };

  const getStageNames = () => {
    return activeQueue === 'petitions' 
      ? ['Verified', 'AA Granted', 'Tech Sanction', 'Tendering', 'Work Order', 'Execution', 'Audit']
      : ['Analysis', 'AA Budget', 'Mobilization', 'Dispatch', 'Repair Active', 'QC Inspection', 'Resolution'];
  };

  return (
    <div className="min-h-screen bg-[#020812] text-white p-8 font-sans selection:bg-[var(--accent)] selection:text-black flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img
              src="/logo.png"
              alt="Infralense Logo"
              className="h-14 w-14 rounded-full aspect-square object-cover filter brightness-125 border-2 border-[var(--accent)]/20 shadow-[0_0_20px_rgba(0,245,255,0.2)]"
            />
          </Link>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[var(--accent)] flex items-center gap-4">
              Project Lifecycle 
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full not-italic tracking-widest border border-emerald-500/30 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE TRACKING
              </span>
            </h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-bold">National Infrastructure Execution Pipeline</p>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Link to="/admin" className="px-4 py-2.5 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)] hover:text-black transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} /> Command Center
          </Link>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <Link to="/dashboard" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--accent)] transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
            <MapIcon size={12} /> Intel Map
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-black transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2 text-red-400 hover:border-red-500"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>
      </header>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Left Panel: Active Projects List */}
        <GlassCard className="w-1/3 !p-0 flex flex-col overflow-hidden border-white/5">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-lg font-black italic tracking-tighter uppercase mb-4">Active Pipelines</h2>
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => { setActiveQueue('petitions'); setSelectedCase(null); }}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeQueue === 'petitions' ? 'bg-[var(--accent)] text-black' : 'text-white/40 hover:text-white'}`}
              >
                Petitions
              </button>
              <button
                onClick={() => { setActiveQueue('complaints'); setSelectedCase(null); }}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeQueue === 'complaints' ? 'bg-[var(--accent)] text-black' : 'text-white/40 hover:text-white'}`}
              >
                Complaints
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            <AnimatePresence>
              {currentData.length === 0 ? (
                <div className="p-10 text-center text-white/20 font-black uppercase tracking-widest text-[10px]">No active cases in pipeline.</div>
              ) : currentData.map(item => {
                const isSelected = selectedCase?.id === item.id;
                const stagesCompleted = item.updates ? item.updates.length : 0;
                const progressPct = (stagesCompleted / 7) * 100;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedCase(item)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected 
                        ? 'bg-[var(--accent)]/10 border-[var(--accent)]/50 shadow-[0_0_20px_rgba(0,245,255,0.1)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white uppercase text-xs truncate pr-2">
                        {activeQueue === 'petitions' ? item.locationName : item.category}
                      </span>
                      <span className="text-[8px] text-white/40 font-mono">ID: {item.id.slice(-6)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="text-[9px] font-black text-[var(--accent)]">{stagesCompleted}/7</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Right Panel: Pipeline Command Center */}
        <GlassCard className="flex-1 !p-10 flex flex-col border-white/5 overflow-y-auto custom-scrollbar relative">
          {selectedCase ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCase.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                {/* Dashboard Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
                      {activeQueue === 'petitions' ? selectedCase.title : selectedCase.category}
                    </h2>
                    <div className="flex items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><MapIcon size={12} className="text-[var(--accent)]" /> {activeQueue === 'petitions' ? selectedCase.locationName : 'Location Logged'}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span>Reporter: {selectedCase.creator?.name || 'Citizen-Anon'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] block mb-1">Total Pipeline Progress</span>
                    <span className="text-4xl font-black italic">
                      {Math.round(((selectedCase.updates?.length || 0) / 7) * 100)}%
                    </span>
                  </div>
                </div>

                {/* The Timeline */}
                <div>
                  <h3 className="text-xs text-white/30 font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                    <ArrowRight size={14} /> Execution Protocol Stages
                  </h3>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((stageNumber) => {
                      const stageNames = getStageNames();
                      const isCompleted = selectedCase.updates?.some((u: any) => u.stage === stageNumber);
                      const isNext = !isCompleted && (stageNumber === 1 || selectedCase.updates?.some((u: any) => u.stage === stageNumber - 1));
                      
                      return (
                        <div
                          key={stageNumber}
                          onClick={() => {
                            if (isNext) handleAdvanceStage(stageNumber);
                            else if (!isCompleted) toast('Complete previous stages first.', { icon: '🔒', style: { background: '#0a1120', color: '#fff' }});
                          }}
                          className={`p-6 rounded-3xl border transition-all flex items-center gap-6 ${
                            isCompleted 
                              ? 'bg-emerald-500/10 border-emerald-500/30 cursor-default' 
                              : isNext
                                ? 'bg-[var(--accent)]/10 border-[var(--accent)]/50 cursor-pointer shadow-[0_0_20px_rgba(0,245,255,0.15)] hover:bg-[var(--accent)]/20'
                                : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {/* Stage Circle */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${
                            isCompleted ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                            : isNext ? 'border-[var(--accent)] text-[var(--accent)]'
                            : 'border-white/10 text-white/20'
                          }`}>
                            {isCompleted ? <CheckCircle2 size={24} /> : <span className="font-black italic text-lg">{stageNumber}</span>}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h4 className={`text-sm font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-400' : isNext ? 'text-[var(--accent)]' : 'text-white/40'}`}>
                              {stageNames[stageNumber - 1]}
                            </h4>
                            <p className="text-[10px] text-white/40 font-bold uppercase mt-1">
                              {isCompleted ? 'Clearance Granted & Logged' : isNext ? 'Awaiting Executive Action' : 'Locked Pipeline Stage'}
                            </p>
                          </div>
                          
                          {/* Action Button */}
                          {isNext && (
                            <button className="shrink-0 px-4 py-2 bg-[var(--accent)] text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-colors">
                              Authorize
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 opacity-50">
              <Activity size={48} className="text-[var(--accent)] mb-6 animate-pulse" />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-2">Awaiting Selection</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 max-w-sm">Select an active pipeline from the left panel to manage execution protocol stages.</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminProjectLifecycle;

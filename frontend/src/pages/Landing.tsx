import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Globe2,
  Cpu,
  Activity,
  Shield,
  Database,
  Fingerprint,
  Map as MapIcon,
  ChevronRight,
  Radio,
  Navigation,
  MapPin,
  RotateCw,
  Terminal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Waves } from '../components/ui/wave-background';

const SECTORS = [
  { name: "MUMBAI SECTOR-9", coords: "19.0760° N, 72.8777° E", stability: 84.2, code: "676-U", color: "#00f5ff" },
  { name: "BANGALORE SECTOR-4", coords: "12.9716° N, 77.5946° E", stability: 91.8, code: "402-X", color: "#10b981" },
  { name: "DELHI SECTOR-12", coords: "28.7041° N, 77.1025° E", stability: 73.5, code: "911-W", color: "#f59e0b" },
  { name: "HYDERABAD SECTOR-7", coords: "17.3850° N, 78.4867° E", stability: 88.0, code: "108-Z", color: "#8b5cf6" }
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const [displayedStability, setDisplayedStability] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    '[NEURAL PARITY: OPTIMIZED]',
    '[NEURAL PARITY: OPTIMIZED]',
    '[GAP DETECTED: 16%]',
    '[SCANNING SECTOR: 676-U]',
    '[NEURAL PARITY: OPTIMIZED]',
  ]);
  const [clearanceId, setClearanceId] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    setDisplayedStability(0);
    const target = SECTORS[activeSectorIndex].stability;
    const duration = 1200; 
    const stepTime = 16; 
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayedStability(target);
        clearInterval(timer);
      } else {
        setDisplayedStability(Number(current.toFixed(1)));
      }
    }, stepTime);

    const sector = SECTORS[activeSectorIndex];
    setLogs([
      '[NEURAL PARITY: OPTIMIZED]',
      `[SAT LINK STABILITY: ${(100 - (100 - sector.stability) * 0.4).toFixed(1)}%]`,
      `[GAP DETECTED: ${Math.round(100 - sector.stability)}%]`,
      `[SCANNING SECTOR: ${sector.code}]`,
      '[NEURAL PARITY: OPTIMIZED]',
    ]);

    return () => clearInterval(timer);
  }, [activeSectorIndex]);

  useEffect(() => {
    const logInterval = setInterval(() => {
      const messages = [
        `[SCANNING SUB-GRID: ${Math.floor(Math.random() * 800 + 100)}]`,
        `[PACKETS DEQUEUED: <${(Math.random() * 5 + 1).toFixed(1)}MS]`,
        '[NEURAL PARITY: OPTIMIZED]',
        `[SAT LINK STABILITY: ${(100 - (100 - SECTORS[activeSectorIndex].stability) * 0.4 + (Math.random() * 2 - 1)).toFixed(1)}%]`,
        `[GEOSPATIAL DRIFT: <0.00${Math.floor(Math.random() * 9 + 1)}°]`
      ];
      const indexToReplace = Math.floor(Math.random() * 5);
      setLogs(prev => {
        const next = [...prev];
        next[indexToReplace] = messages[Math.floor(Math.random() * messages.length)];
        return next;
      });
    }, 4000);
    return () => clearInterval(logInterval);
  }, [activeSectorIndex]);

  const handleClearance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clearanceId) return;
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      toast.success('Clearance Authorized. Establishing Link.');
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020812] text-white relative overflow-hidden landing-font selection:bg-[var(--accent)] selection:text-black font-sans">
      {/* Background FX - Cyan Grid Overlay + Interactive Waves */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.08),transparent_70%)]" />
        <div className="absolute inset-0 grid-cyan opacity-40" />
        <Waves className="opacity-30" strokeColor="rgba(0, 245, 255, 0.2)" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-10 py-8 flex justify-between items-center bg-transparent">
        <Link to="/" className="flex items-center gap-4 group cursor-pointer">
          <img
            src="/logo.png"
            alt="Infralense Logo"
            className="h-12 w-12 rounded-full aspect-square object-cover filter brightness-125 group-hover:scale-105 transition-all duration-300 border-2 border-[var(--accent)]/20 shadow-[0_0_20px_rgba(0,245,255,0.2)]"
          />
        </Link>
        <div className="flex gap-10 items-center">
          <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-[var(--accent)] transition-colors">Neural Login</Link>
          <Link to="/admin/login">
            <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-all">Admin System</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-20 px-10 flex flex-col items-center">
        <div className="max-w-7xl w-full flex flex-col items-center relative z-10">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--accent)] text-[9px] font-black uppercase tracking-[0.4em]"
          >
            <Activity size={12} className="animate-pulse" /> Intelligence Platform Live: Sector Tier-1
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--accent)] text-[12px] font-black uppercase tracking-[1.2em] mb-4 opacity-100 ml-[1.2em]"
          >
            Infralense
          </motion.div>

          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl lg:text-[11rem] font-black italic tracking-tighter leading-[0.85] text-white uppercase"
            >
              Data-Driven <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--accent)] to-white animate-shimmer bg-size-200">Governance.</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-white/40 mb-16 max-w-3xl mx-auto text-center font-medium uppercase tracking-tight landing-font-body"
          >
            Transforming regionals through <span className="text-white font-black italic">Neural Scanning</span> and <span className="text-[var(--accent)] font-black italic">Macro Intelligence</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-32"
          >
            <Link to="/login">
              <button className="h-14 px-10 bg-white text-black font-black uppercase text-[10px] tracking-[0.4em] rounded-2xl hover:bg-[var(--accent)] hover:shadow-[0_0_40px_rgba(0,245,255,0.4)] transition-all">
                Access Intelligence Hub
              </button>
            </Link>
            <button className="h-14 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all text-white/40 hover:text-white flex items-center gap-3">
              <Play size={14} className="text-[var(--accent)]" /> Watch System Demo
            </button>
          </motion.div>

          {/* Macro System Telemetry Card - Enhanced Image 2 Integration */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full max-w-5xl group"
          >
            {/* Sector Tabs Bar */}
            <div className="flex justify-between items-center mb-6 px-6">
              <div className="flex items-center gap-3">
                <Terminal size={14} style={{ color: SECTORS[activeSectorIndex].color }} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">OVERSIGHT LINK SELECTOR</span>
              </div>
              <div className="flex gap-2">
                {SECTORS.map((sector, idx) => (
                  <button
                    key={sector.name}
                    onClick={() => setActiveSectorIndex(idx)}
                    style={{
                      borderColor: activeSectorIndex === idx ? sector.color + '50' : 'rgba(255,255,255,0.05)',
                      backgroundColor: activeSectorIndex === idx ? sector.color + '15' : 'rgba(255,255,255,0.05)',
                      color: activeSectorIndex === idx ? sector.color : 'rgba(255,255,255,0.3)',
                      boxShadow: activeSectorIndex === idx ? `0 0 20px ${sector.color}20` : 'none'
                    }}
                    className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border hover:text-white"
                  >
                    {sector.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0a1120]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.6)] flex flex-col md:flex-row min-h-[480px] relative">
              {/* Corner tech accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/10 rounded-tl-3xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/10 rounded-tr-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/10 rounded-bl-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/10 rounded-br-3xl pointer-events-none" />

              {/* Left Panel: Logs & Stats */}
              <div className="w-full md:w-[45%] p-10 border-r border-white/5 flex flex-col justify-between bg-gradient-to-b from-white/[0.01] to-transparent">
                <div className="space-y-8">
                  <div className="flex items-center justify-between text-white/40">
                    <div className="flex items-center gap-3">
                      <ChevronRight size={16} style={{ color: SECTORS[activeSectorIndex].color }} className="animate-pulse" />
                      <h4 className="text-[9px] font-black uppercase tracking-[0.4em]">Macro System Telemetry</h4>
                    </div>
                    <span 
                      style={{
                        color: SECTORS[activeSectorIndex].color,
                        backgroundColor: SECTORS[activeSectorIndex].color + '15',
                        borderColor: SECTORS[activeSectorIndex].color + '30'
                      }}
                      className="text-[8px] font-mono font-bold px-2.5 py-0.5 rounded border animate-pulse"
                    >
                      LIVE FEED
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-[10px]">
                    <AnimatePresence mode="popLayout">
                      {logs.map((log, i) => {
                        let textColor = "text-white/80";
                        let dotColor = "bg-[var(--accent)]";
                        let dotStyle = {};
                        if (log.includes("OPTIMIZED")) {
                          textColor = "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.3)]";
                          dotColor = "bg-emerald-500";
                        } else if (log.includes("GAP")) {
                          textColor = "text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]";
                          dotColor = "bg-amber-500";
                        } else if (log.includes("SCANNING") || log.includes("SAT LINK") || log.includes("DRIFT") || log.includes("PACKETS")) {
                          textColor = "font-semibold";
                          dotStyle = { backgroundColor: SECTORS[activeSectorIndex].color };
                          textColor = "drop-shadow-[0_0_6px_" + SECTORS[activeSectorIndex].color + "40]";
                        }
                        
                        return (
                          <motion.div
                            key={log + i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1 - i * 0.1, x: 0 }}
                            className="flex items-center gap-3 py-2 border-b border-white/[0.02] last:border-0"
                          >
                            <span className="text-white/20 font-bold w-4">{i + 1}</span>
                            <span 
                              style={dotStyle} 
                              className={`w-1.5 h-1.5 rounded-full ${dotStyle ? '' : dotColor} animate-pulse`} 
                            />
                            <span 
                              style={log.includes("OPTIMIZED") || log.includes("GAP") ? {} : { color: SECTORS[activeSectorIndex].color }} 
                              className={`font-bold uppercase tracking-widest ${textColor}`}
                            >
                              {log}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-8 mt-8 border-t border-white/5">
                  <div className="space-y-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:border-white/20 hover:bg-white/[0.04] transition-all">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Global Stability</p>
                    <p className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                      {displayedStability}%
                    </p>
                  </div>
                  <div className="space-y-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:border-white/20 hover:bg-white/[0.04] transition-all">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Neural Parity</p>
                    <p 
                      style={{ 
                        color: SECTORS[activeSectorIndex].color,
                        textShadow: `0 0 20px ${SECTORS[activeSectorIndex].color}80` 
                      }} 
                      className="text-4xl font-black italic tracking-tighter animate-pulse"
                    >
                      ACTIVE
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Panel: Holographic Globe & Radar */}
              <div className="flex-1 p-10 relative flex items-center justify-center bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
                {/* Background scanning lines */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_70%)]" />
                <div className="absolute inset-0 bg-grid-cyan opacity-10 pointer-events-none" />

                {/* Radar System rings & sweep */}
                <div className="relative z-10 flex items-center justify-center w-80 h-80">
                  {/* Sweep gradient radar cone */}
                  <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite] pointer-events-none" viewBox="0 0 200 200">
                    <defs>
                      <linearGradient id={`radarSweep-${activeSectorIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={SECTORS[activeSectorIndex].color} stopOpacity="0.25" />
                        <stop offset="50%" stopColor={SECTORS[activeSectorIndex].color} stopOpacity="0.05" />
                        <stop offset="100%" stopColor={SECTORS[activeSectorIndex].color} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 100 100 L 100 0 A 100 100 0 0 1 200 100 Z" fill={`url(#radarSweep-${activeSectorIndex})`} />
                  </svg>

                  {/* Concentric rings rotating differently */}
                  <div 
                    style={{ borderColor: SECTORS[activeSectorIndex].color + '15' }} 
                    className="absolute inset-0 border rounded-full animate-[spin_40s_linear_infinite_reverse]" 
                  />
                  <div 
                    style={{ borderColor: SECTORS[activeSectorIndex].color + '30' }} 
                    className="absolute inset-4 border border-dashed rounded-full animate-[spin_25s_linear_infinite]" 
                  />
                  <div 
                    style={{ borderColor: SECTORS[activeSectorIndex].color + '40' }} 
                    className="absolute inset-10 border border-dotted rounded-full animate-[spin_15s_linear_infinite_reverse]" 
                  />
                  <div 
                    style={{ borderColor: SECTORS[activeSectorIndex].color + '10' }} 
                    className="absolute inset-16 border-2 rounded-full" 
                  />

                  {/* Globe Core */}
                  <div 
                    style={{ 
                      borderColor: SECTORS[activeSectorIndex].color + '40',
                      backgroundColor: SECTORS[activeSectorIndex].color + '05',
                      boxShadow: `inset 0 0 30px ${SECTORS[activeSectorIndex].color}15`
                    }} 
                    className="w-48 h-48 rounded-full border flex items-center justify-center relative overflow-hidden group/globe"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)]" />
                    
                    {/* Globe wireframe vector path */}
                    <svg className="absolute w-full h-full" style={{ color: SECTORS[activeSectorIndex].color + '60' }} viewBox="0 0 100 100">
                      {/* Flowing animated wave pathways */}
                      <motion.path 
                        d="M -20,50 Q 15,30 50,50 T 120,50" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        animate={{ strokeDashoffset: [0, -100] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        style={{ strokeDasharray: "8 4" }}
                      />
                      <motion.path 
                        d="M -20,62 Q 15,42 50,62 T 120,62" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        animate={{ strokeDashoffset: [0, -100] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        style={{ strokeDasharray: "12 6" }}
                      />
                      <motion.path 
                        d="M -20,38 Q 15,18 50,38 T 120,38" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        animate={{ strokeDashoffset: [0, -100] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                        style={{ strokeDasharray: "6 3" }}
                      />

                      {/* Main globe circle contours */}
                      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: SECTORS[activeSectorIndex].color }} />
                      <path d="M 35 38 C 42 42, 42 58, 35 62" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M 65 38 C 58 42, 58 58, 65 62" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M 50 20 C 50 35, 50 65, 50 80" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M 20 50 C 35 50, 65 50, 80 50" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>

                    {/* Glowing coordinate blips */}
                    <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#34d399]" />
                    
                    <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#f87171]" />

                    <div 
                      style={{ backgroundColor: SECTORS[activeSectorIndex].color, boxShadow: `0 0 15px ${SECTORS[activeSectorIndex].color}` }}
                      className="absolute top-1/2 right-1/3 w-3.5 h-3.5 rounded-full animate-ping" 
                    />
                    <div 
                      style={{ backgroundColor: SECTORS[activeSectorIndex].color, boxShadow: `0 0 10px ${SECTORS[activeSectorIndex].color}` }}
                      className="absolute top-1/2 right-1/3 w-3.5 h-3.5 rounded-full" 
                    />
                  </div>
                </div>

                {/* Region Metadata from image */}
                <div 
                  style={{ borderColor: SECTORS[activeSectorIndex].color + '20' }}
                  className="absolute bottom-8 left-8 right-8 p-4 bg-white/[0.02] backdrop-blur-xl border rounded-2xl flex justify-between items-center group/meta hover:bg-white/[0.04] transition-all shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex items-center gap-3">
                    <Cpu size={14} style={{ color: SECTORS[activeSectorIndex].color }} className="animate-[spin_6s_linear_infinite]" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80">
                        Targeting {SECTORS[activeSectorIndex].name}
                      </span>
                      <span className="text-[7px] font-mono font-bold text-white/40 tracking-wider">
                        LOC: {SECTORS[activeSectorIndex].coords}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] font-mono font-bold text-emerald-400 animate-pulse uppercase">Synced</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="py-40 px-10 relative z-10 bg-gradient-to-b from-transparent via-[#020812] to-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard
            icon={<MapIcon />}
            title="Geospatial Mapping"
            desc="Deep infrastructure layers utilizing OSM and OpenData datasets for 100% regional visibility."
          />
          <FeatureCard
            icon={<Database />}
            title="Predictive Models"
            desc="Machine learning algorithms projecting 5-year growth and hospital-to-school gap ratios."
          />
          <FeatureCard
            icon={<Shield />}
            title="Civic Advocacy"
            desc="One-click AI generation of verifiable petitions to national and local authorities."
          />
        </div>
      </section>

      {/* Clearance Section */}
      <section className="py-60 px-10 relative text-center bg-black">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent)]/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <div className="w-20 h-20 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mx-auto mb-10 shadow-2xl group cursor-pointer hover:border-[var(--accent)]/40 transition-all">
            <Fingerprint size={40} className="text-white group-hover:text-[var(--accent)] transition-colors" />
          </div>

          <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white mb-10">
            Request <span className="text-[var(--accent)]">Clearance</span>
          </h2>

          <p className="text-white/40 text-lg md:text-xl font-medium uppercase tracking-tight mb-20 max-w-2xl mx-auto leading-relaxed landing-font-body">
            Establishing a regional oversight presence requires validated agency credentials. Complete your synchronization below.
          </p>

          <div className="max-w-xl mx-auto p-1 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
            <div className="bg-[#020812] rounded-[2.3rem] p-10">
              <AnimatePresence mode="wait">
                {!isAuthorizing ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleClearance}
                    className="flex flex-col gap-8"
                  >
                    <div className="space-y-4 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Agency Clearance ID</label>
                      <input
                        type="text"
                        value={clearanceId}
                        onChange={(e) => setClearanceId(e.target.value)}
                        required
                        placeholder="SEC-ALPHA-2026-N"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-sm text-white focus:border-[var(--accent)] focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/10 font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-6 bg-white text-black font-black uppercase text-xs tracking-[0.4em] rounded-2xl hover:bg-[var(--accent)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] transition-all flex items-center justify-center gap-4 group"
                    >
                      Initialize Oversight Link
                      <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 flex flex-col items-center gap-6"
                  >
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-2 border-[var(--accent)]/10 rounded-full" />
                      <div className="absolute inset-0 border-2 border-[var(--accent)] rounded-full border-t-transparent animate-spin" />
                      <Fingerprint size={32} className="absolute inset-0 m-auto text-[var(--accent)] animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-2">Authorizing Credentials</p>
                      <p className="text-xs text-white/40 font-medium tracking-tight">Establishing Satellite Link...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="py-20 px-10 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 opacity-30 group">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-[0.5em] font-black group-hover:text-white transition-colors">Infra Lense Intelligence © 2026</span>
            <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-[var(--accent)]">Project Neural-Alpha Deployment</span>
          </div>
          <div className="flex gap-12 text-[9px] font-black uppercase tracking-[0.4em]">
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Protocol</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Database</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Terminal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="p-12 bg-white/5 border border-white/5 rounded-[3rem] group hover:bg-white/10 hover:border-[var(--accent)]/20 transition-all duration-500 relative overflow-hidden">
    <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--accent)]/5 blur-3xl rounded-full group-hover:bg-[var(--accent)]/10 transition-colors" />
    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 text-white group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/40 transition-all shadow-xl">
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <h3 className="text-3xl font-black mb-6 text-white uppercase italic tracking-tighter group-hover:translate-x-2 transition-transform">{title}</h3>
    <p className="text-white/40 leading-relaxed text-[14px] font-medium uppercase tracking-tight landing-font-body">{desc}</p>
  </div>
);

export default Landing;

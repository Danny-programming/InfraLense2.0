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
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HolographicCityMap from '../components/ui/HolographicCityMap';
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
    '[SYSTEM PARITY: OPTIMIZED]',
    '[SYSTEM PARITY: OPTIMIZED]',
    '[GAP DETECTED: 16%]',
    '[SCANNING SECTOR: 676-U]',
    '[SYSTEM PARITY: OPTIMIZED]',
  ]);


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
      '[SYSTEM PARITY: OPTIMIZED]',
      `[SAT LINK STABILITY: ${(100 - (100 - sector.stability) * 0.4).toFixed(1)}%]`,
      `[GAP DETECTED: ${Math.round(100 - sector.stability)}%]`,
      `[SCANNING SECTOR: ${sector.code}]`,
      '[SYSTEM PARITY: OPTIMIZED]',
    ]);

    return () => clearInterval(timer);
  }, [activeSectorIndex]);

  useEffect(() => {
    const logInterval = setInterval(() => {
      const messages = [
        `[SCANNING SUB-GRID: ${Math.floor(Math.random() * 800 + 100)}]`,
        `[PACKETS DEQUEUED: <${(Math.random() * 5 + 1).toFixed(1)}MS]`,
        '[SYSTEM PARITY: OPTIMIZED]',
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
          <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-[var(--accent)] transition-colors">Portal Login</Link>
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
            Transforming regionals through <span className="text-white font-black italic">System Scanning</span> and <span className="text-[var(--accent)] font-black italic">Macro Intelligence</span>.
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

            <HolographicCityMap activeColor={SECTORS[activeSectorIndex].color} />
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
          className="max-w-6xl mx-auto relative z-10 text-center py-32"
        >
          {/* Intense Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />

          {/* Floating HUD Cards */}
          <div className="absolute top-10 left-10 hidden md:block">
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(0,245,255,0.1)]"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center border border-[var(--accent)]/30">
                <Activity size={16} className="text-[var(--accent)]" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-black uppercase tracking-widest text-white/50">Active Agents</div>
                <div className="text-lg font-black text-white font-mono">14,204</div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-40 right-10 hidden md:block">
            <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="p-4 bg-black/40 backdrop-blur-xl border border-[var(--accent)]/30 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(0,245,255,0.2)]"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <ShieldCheck size={16} className="text-[var(--accent)]" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-black uppercase tracking-widest text-white/50">Threat Level</div>
                <div className="text-lg font-black text-[var(--accent)] font-mono">NOMINAL</div>
              </div>
            </motion.div>
          </div>

          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-[var(--accent)]/20 blur-2xl rounded-full" />
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white relative z-10 drop-shadow-[0_0_20px_rgba(0,245,255,0.5)]">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-white">Network</span>
            </h2>
          </div>
          
          <p className="text-white/60 text-lg md:text-xl font-medium uppercase tracking-widest mb-16 max-w-2xl mx-auto leading-relaxed landing-font-body relative z-10">
            Empower your community. Report issues instantly, track resolutions in real-time, and help build a smarter, safer city.
          </p>
          
          <div className="relative z-20">
            <Link to="/login" className="inline-block relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-white rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
               <button className="relative px-12 py-6 bg-black text-white font-black uppercase text-sm tracking-[0.4em] rounded-3xl border border-white/10 hover:border-[var(--accent)] transition-all flex items-center justify-center gap-4 mx-auto overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/20 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                 <span className="relative z-10 group-hover:text-[var(--accent)] transition-colors">Access Citizen Portal</span>
                 <ChevronRight size={20} className="text-[var(--accent)] group-hover:translate-x-2 transition-transform relative z-10" />
               </button>
            </Link>
          </div>

          {/* Live Activity Ticker */}
          <div className="mt-32 w-full overflow-hidden relative opacity-70 hover:opacity-100 transition-opacity duration-500 bg-black/20 py-4 border-y border-white/5 backdrop-blur-md">
            <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#020812] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#020812] to-transparent z-10 pointer-events-none" />
            
            <motion.div
              animate={{ x: [0, -1500] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
              className="flex gap-8 whitespace-nowrap w-max"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-8">
                  {[
                    'STREETLIGHT OUTAGE REPORTED IN SECTOR 7', 
                    'WATER MAIN LEAK RESOLVED IN SECTOR 2', 
                    'NEW CITIZEN REGISTRATION: SEC-99', 
                    'POTHOLE LOGGED BY USER_492', 
                    'TRAFFIC SIGNAL FAILURE: INVESTIGATING', 
                    'COMMUNITY PETITION REACHED 1000 SIGNATURES'
                  ].map((event, j) => (
                    <div key={j} className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                      <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                      {event}
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      <footer className="py-20 px-10 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 opacity-30 group">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-[0.5em] font-black group-hover:text-white transition-colors">Infra Lense Intelligence © 2026</span>
            <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-[var(--accent)]">Project System-Alpha Deployment</span>
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

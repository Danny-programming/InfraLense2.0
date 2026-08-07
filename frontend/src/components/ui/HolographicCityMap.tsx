import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HolographicCityMap = ({ activeColor }: { activeColor: string }) => {
  const [anomalies, setAnomalies] = useState<{ id: number; x: number; y: number; status: 'pending' | 'resolved', type: string }[]>([]);
  const [scanLineY, setScanLineY] = useState(-20);

  useEffect(() => {
    // Scanner animation
    const scanInterval = setInterval(() => {
      setScanLineY((prev) => {
        if (prev > 120) return -20;
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(scanInterval);
  }, []);

  useEffect(() => {
    // Generate anomalies
    const anomalyInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        setAnomalies(prev => {
          if (prev.length > 5) return prev;
          const types = ["Pothole", "Water Leak", "Streetlight", "Road Damage"];
          return [...prev, {
            id: Date.now(),
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            status: 'pending',
            type: types[Math.floor(Math.random() * types.length)]
          }];
        });
      }
    }, 2000);
    return () => clearInterval(anomalyInterval);
  }, []);

  useEffect(() => {
    // Resolve anomalies when scanner hits them
    setAnomalies(prev => prev.map(a => {
      if (a.status === 'pending' && Math.abs(a.y - scanLineY) < 5) {
        return { ...a, status: 'resolved' };
      }
      return a;
    }));
  }, [scanLineY]);

  useEffect(() => {
    // Clean up resolved anomalies after a few seconds
    const cleanupInterval = setInterval(() => {
      setAnomalies(prev => prev.filter(a => !(a.status === 'resolved' && Date.now() - a.id > 6000)));
    }, 1000);
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div className="bg-[#0a1120]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.6)] flex items-center justify-center min-h-[480px] relative w-full perspective-1000">
      
      {/* HUD Info */}
      <div className="absolute top-8 left-8 z-20">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-2">Live Urban Grid</h4>
        <div className="flex gap-4 font-mono text-[8px] uppercase tracking-widest text-white/30">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Pending Anomalies</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Verified by AI</span>
        </div>
      </div>

      <div className="absolute top-8 right-8 z-20 text-right">
         <span style={{ color: activeColor }} className="text-[8px] font-mono font-bold px-2.5 py-0.5 rounded border border-white/10 bg-white/5">
            AI OVERSIGHT ACTIVE
         </span>
      </div>

      {/* Isometric Map Container */}
      <div 
        className="relative w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] transform-gpu transition-all duration-1000"
        style={{
          transform: 'rotateX(60deg) rotateZ(-45deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Base Grid */}
        <div 
          className="absolute inset-0 border border-white/5 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"
          style={{
            backgroundSize: '40px 40px',
            boxShadow: `0 0 50px ${activeColor}10, inset 0 0 50px ${activeColor}10`
          }}
        />
        
        {/* Decorative City Blocks */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={`block-${i}`}
            className="absolute border border-white/5 bg-white/[0.01]"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              transform: `translateZ(0px)`
            }}
          >
            <div 
               className="absolute inset-0 bg-white/[0.03] origin-bottom transition-all duration-[3000ms]"
               style={{ transform: `rotateX(-90deg) scaleY(${Math.random() * 2 + 0.5}) translateZ(${Math.random() * 20}px)`, transformOrigin: 'top' }}
            />
          </div>
        ))}

        {/* Scanner Line */}
        <div 
          className="absolute left-0 right-0 h-1 z-10 transition-colors duration-500"
          style={{
            top: `${scanLineY}%`,
            backgroundColor: activeColor,
            boxShadow: `0 0 20px ${activeColor}, 0 0 40px ${activeColor}`,
            opacity: scanLineY > 0 && scanLineY < 100 ? 0.6 : 0
          }}
        >
           <div className="absolute top-0 bottom-0 left-0 right-0 h-20 -translate-y-20 bg-gradient-to-t from-current to-transparent opacity-20" />
        </div>

        {/* Anomalies */}
        <AnimatePresence>
          {anomalies.map(a => (
            <motion.div
              key={a.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute z-20 flex flex-col items-center justify-end"
              style={{
                left: `${a.x}%`,
                top: `${a.y}%`,
                transform: 'translate(-50%, -50%) rotateX(-60deg) rotateY(0deg) rotateZ(45deg)', // Counter-rotate to stand up
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Vertical Beam */}
              {a.status === 'resolved' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 60, opacity: 0.8 }}
                  className="w-0.5 bg-emerald-400 rounded-t-full shadow-[0_0_15px_#34d399]"
                />
              )}

              {/* Node */}
              <div 
                className={`w-3 h-3 rounded-full transition-all duration-300 relative ${
                  a.status === 'pending' ? 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'
                }`}
              >
                 {a.status === 'pending' && <div className="absolute inset-0 rounded-full border border-red-500 animate-ping" />}
              </div>

              {/* Tooltip */}
              {a.status === 'resolved' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -80 }}
                  className="absolute whitespace-nowrap bg-black/60 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-lg pointer-events-none"
                >
                  <span className="text-[7px] font-mono text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircleIcon /> AI VERIFIED: {a.type}
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default HolographicCityMap;

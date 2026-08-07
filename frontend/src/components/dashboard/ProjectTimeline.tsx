import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Building2, HardHat, FileCheck, ClipboardList, TrendingUp } from 'lucide-react';

export const BMC_STAGES = [
  { id: 1, label: 'Verified', icon: <CheckCircle2 size={18} />, desc: 'Report validated by InfraLense intelligence core.' },
  { id: 2, label: 'Admin Approval', icon: <FileCheck size={18} />, desc: 'Administrative Approval (AA) granted for project initiation.' },
  { id: 3, label: 'Tech Sanction', icon: <ClipboardList size={18} />, desc: 'Technical Sanction (TS) received from engineering department.' },
  { id: 4, label: 'Tendering', icon: <Building2 size={18} />, desc: 'E-Tendering process initiated for contractor selection.' },
  { id: 5, label: 'Work Order', icon: <TrendingUp size={18} />, desc: 'Work Order (WO) issued to selected execution agency.' },
  { id: 6, label: 'Site Execution', icon: <HardHat size={18} />, desc: 'Groundwork in progress. On-site infrastructure building.' },
  { id: 7, label: 'Final Audit', icon: <Clock size={18} />, desc: 'Quality audit in progress before final handover.' },
];

interface ProjectTimelineProps {
  currentStage: number;
  updates: any[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ currentStage, updates }) => {
  return (
    <div className="space-y-12 py-6">
      {BMC_STAGES.map((stage, index) => {
        const isCompleted = stage.id < currentStage || (currentStage === 7 && stage.id === 7);
        const isActive = stage.id === currentStage;
        const update = updates.find(u => u.stage === stage.id);

        return (
          <div key={stage.id} className="relative flex gap-8 group">
            {/* Connector Line */}
            {index !== BMC_STAGES.length - 1 && (
              <div className={`absolute left-[21px] top-12 w-0.5 h-16 transition-all duration-700 ${
                isCompleted ? 'bg-gradient-to-b from-[var(--accent)] to-[var(--accent)]/20' : 'bg-white/5'
              }`} />
            )}

            {/* Icon Node */}
            <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-700 z-10 ${
              isCompleted ? 'bg-[var(--accent)] border-[var(--accent)] text-black shadow-[0_0_20px_rgba(0,245,255,0.4)]' :
              isActive ? 'border-[var(--accent)] text-[var(--accent)] shadow-[0_0_30px_rgba(0,245,255,0.2)] bg-[var(--accent)]/5' :
              'border-white/10 text-white/10 bg-white/[0.02]'
            }`}>
              {isCompleted ? <CheckCircle2 size={24} /> : stage.icon}
            </div>

            {/* Content */}
            <div className={`flex-1 transition-all duration-500 ${isActive ? 'translate-x-1' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? 'text-[var(--accent)]' : isCompleted ? 'text-white/80' : 'text-white/10'}`}>
                    0{stage.id} // {stage.label}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className={`text-base font-black italic tracking-tighter uppercase ${isActive ? 'text-white' : isCompleted ? 'text-white/60' : 'text-white/20'}`}>
                      {stage.label}
                    </span>
                    {isCompleted && <div className="h-px w-8 bg-[var(--accent)]/30" />}
                  </div>
                </div>
                {update && (
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-[var(--accent)] mb-0.5 opacity-60">LOG_{update.id.slice(-4)}</p>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{new Date(update.timestamp).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              <p className={`text-[12px] leading-relaxed font-medium transition-colors ${isActive ? 'text-white/60' : 'text-white/20'}`}>
                {update?.description || stage.desc}
              </p>
              
              {isActive && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl inline-flex items-center gap-3 shadow-[0_10px_30px_rgba(0,245,255,0.05)]"
                >
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-ping absolute inset-0" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] relative" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                    {stage.id === 7 ? 'Mission Accomplished - Project Fully Handovered' : 'Regional Unit Under Site Processing'}
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectTimeline;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  caseData: { id: string, title: string, type: 'PETITION' | 'COMPLAINT' };
}

const RejectionModal: React.FC<RejectionModalProps> = ({ isOpen, onClose, onSubmit, caseData }) => {
  const [reason, setReason] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiSuggest = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/ai/suggest-rejection`, {
        id: caseData.id,
        type: caseData.type
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setReason(res.data.suggestion);
      toast.success('AI Briefing Generated', { icon: '🤖' });
    } catch (err) {
      toast.error('AI Link Unstable. Please enter manually.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a1120] border border-red-500/20 rounded-[2rem] shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 bg-gradient-to-r from-red-500/5 to-transparent">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="text-xl font-black italic tracking-tighter uppercase">Rejection Protocol</h3>
                </div>
                <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Case: {caseData.title}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="relative">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter the official reason for declining this infrastructure petition..."
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-red-500/50 transition-all resize-none custom-scrollbar italic"
                />
                <button
                  onClick={handleAiSuggest}
                  disabled={isGenerating}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg text-[var(--accent)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--accent)] hover:text-black transition-all disabled:opacity-50"
                >
                  <Sparkles size={12} className={isGenerating ? 'animate-spin' : ''} />
                  {isGenerating ? 'Analyzing...' : 'AI Suggest'}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onSubmit(reason)}
                  disabled={!reason.trim()}
                  className="w-full py-4 bg-red-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-lg hover:bg-red-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                  <Send size={14} /> Confirm Rejection
                </button>
                <p className="text-[9px] text-center text-white/20 uppercase tracking-widest font-bold font-mono">
                  This action will trigger a formal briefing for the citizen.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RejectionModal;

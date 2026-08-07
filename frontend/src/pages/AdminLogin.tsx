import React from 'react';
import { motion } from 'framer-motion';
import { scaleIn } from '../lib/animations';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any)[0].value;
    const password = (e.target as any)[1].value;

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/login', { email, password });
      if (res.data.user.role !== 'ADMIN') {
        toast.error('Access denied: Admin only');
        return;
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Admin access granted');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Access denied');
    }
  };

  return (
    <div className="min-h-screen bg-[#010608] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dark Grid Background */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,71,87,0.05)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,71,87,0.1)] border border-[rgba(255,71,87,0.2)] text-[var(--danger)] text-xs font-bold uppercase tracking-widest mb-8">
            <ShieldAlert size={14} /> Admin Secure Access
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 relative group"
          >
            <div className="absolute inset-0 bg-[var(--danger)]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src="/logo.png"
              alt="Infralense Logo"
              className="h-20 w-20 rounded-full aspect-square object-cover mx-auto filter grayscale brightness-75 hover:grayscale-0 hover:brightness-110 transition-all duration-700 relative z-10 border-2 border-[var(--danger)]/20 shadow-[0_0_30px_rgba(255,71,87,0.2)]"
            />
          </motion.div>
          <h2 className="text-3xl font-black italic uppercase tracking-[0.1em] text-white/90 flex items-center justify-center gap-3">
            System <span className="text-[var(--danger)]">Core</span>
          </h2>
        </div>

        <GlassCard className="!p-8 !border-[rgba(255,71,87,0.2)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Admin Identity</label>
              <input
                type="text"
                required
                placeholder="admin@infra.com"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border)] rounded-[var(--radius-md)] py-3 px-4 text-white focus:border-[var(--danger)] focus:outline-none transition-colors mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Access Token</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border)] rounded-[var(--radius-md)] py-3 pl-12 pr-4 text-white focus:border-[var(--danger)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <NeonButton variant="danger" className="w-full h-12 mt-2">
              Initialize Session
            </NeonButton>
          </form>
        </GlassCard>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-8 text-[var(--text-secondary)] text-sm hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} /> Return to Public Portal
        </button>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

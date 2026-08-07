import React from 'react';
import { motion } from 'framer-motion';
import { scaleIn } from '../lib/animations';
import GlassCard from '../components/ui/GlassCard';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, ShieldCheck, Activity, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use proper refs or e.target elements in a more robust way
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Secure Link Established');
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Authentication Failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#020812] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Floating HUD Elements */}
      <div className="absolute top-10 left-10 hidden lg:block opacity-40 pointer-events-none">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">System Status: SECURE</span>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="text-white/20" size={12} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Data Parity: 99.4%</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden lg:block opacity-40 pointer-events-none">
        <div className="text-right">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2 font-serif italic text-sm">"Intelligence is the ability to adapt to change."</h4>
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">— AL System v2.0</span>
        </div>
      </div>

      <Link to="/" className="absolute top-10 left-10 lg:left-1/2 lg:-translate-x-[500px] flex items-center gap-4 text-[var(--text-secondary)] hover:text-white transition-all group z-50">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <ArrowLeft size={18} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest leading-none">Return to Portal</span>
      </Link>

      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[400px] z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 mx-auto mb-8 relative"
          >
            <div className="absolute inset-0 bg-[var(--accent)]/10 rounded-full blur-2xl animate-pulse" />
            <img
              src="/logo.png"
              alt="Infralense Logo"
              className="relative z-10 w-full h-full rounded-full aspect-square object-cover filter brightness-125 hover:scale-105 transition-transform duration-500 border-2 border-[var(--accent)]/20 shadow-[0_0_30px_rgba(0,245,255,0.3)]"
            />
          </motion.div>

          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4 leading-none text-white">
            Establish <span className="text-[var(--accent)]">Secure Link</span>
          </h2>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.3em] max-w-[320px] mx-auto leading-relaxed">
            Access the high-fidelity infrastructure intelligence OS
          </p>
        </div>

        <GlassCard className="!p-8 sm:!p-10 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-black/40 backdrop-blur-3xl rounded-[3rem] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50 pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-8 relative z-20">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-1">Authentication ID</label>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-[var(--accent)]/10 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none" />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--accent)]/40 group-focus-within/input:text-[var(--accent)] transition-colors z-20" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="user@infra.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-sm text-white focus:border-[var(--accent)]/40 focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/10 font-bold tracking-tight relative z-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-1">Secure Passphrase</label>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-[var(--accent)]/10 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none" />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--accent)]/40 group-focus-within/input:text-[var(--accent)] transition-colors z-20" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-sm text-white focus:border-[var(--accent)]/40 focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/10 font-bold tracking-tight relative z-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white/40">
              <label className="flex items-center gap-3 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[var(--accent)]" />
                <span>Persistent Link</span>
              </label>
              <a href="#" className="hover:text-[var(--accent)] transition-colors">Lost Passphrase?</a>
            </div>

            <button
              type="submit"
              className="w-full py-6 bg-white text-black font-black uppercase text-xs tracking-[0.4em] rounded-3xl hover:bg-[var(--accent)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] transition-all flex items-center justify-center gap-4 group"
            >
              <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
              Synchronize
            </button>
          </form>
        </GlassCard>

        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
            <Cpu size={14} className="text-[var(--accent)]" />
            Hardware Key Required for Level 5 Access
          </div>

          <p className="text-center text-[var(--text-secondary)] text-sm font-medium tracking-tight">
            Unauthorized access will be logged. <a href="#" className="text-[var(--accent)] font-bold hover:underline ml-2">Request Agency Credential</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

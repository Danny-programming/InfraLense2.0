import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Key, Bell, Save, AlertCircle, Smartphone, Lock, Eye, EyeOff, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SettingsView: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [toggles, setToggles] = useState({
        emailAlerts: true,
        pushNotif: true,
        smsNotif: false,
        weeklyDigest: true,
        twoFactor: false
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    name: payload.name || 'Citizen User',
                    email: payload.email || 'user@infra.com',
                    role: payload.role || 'CITIZEN',
                    userId: payload.userId || 'usr_xyz123'
                });
            } catch (e) {
                setUser({ name: 'Citizen User', email: 'user@infra.com', role: 'CITIZEN', userId: 'N/A' });
            }
        } else {
            setUser({ name: 'Citizen User', email: 'user@infra.com', role: 'CITIZEN', userId: 'N/A' });
        }
    }, []);

    const toggleSetting = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Configuration saved successfully', {
            style: { background: '#0a192f', color: '#fff', border: '1px solid rgba(0,245,255,0.2)' }
        });
    };

    if (!user) return (
        <div className="flex-1 p-10 flex items-center justify-center text-white/50">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[#020812]">
            <div className="max-w-5xl mx-auto space-y-10">
                <header>
                    <h3 className="text-[10px] text-[var(--accent)] font-black uppercase tracking-[0.4em] mb-4">System Configuration</h3>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">User <span className="text-[var(--accent)]">Settings</span></h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar / Nav */}
                    <div className="md:col-span-1 space-y-3">
                        {[
                            { id: 'profile', label: 'Profile Information', icon: <User size={16} /> },
                            { id: 'security', label: 'Security & Access', icon: <Key size={16} /> },
                            { id: 'notifications', label: 'Notification Preferences', icon: <Bell size={16} /> }
                        ].map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 shadow-[0_0_15px_rgba(0,245,255,0.1)]' 
                                    : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/5'
                                }`}
                            >
                                <span className={activeTab === tab.id ? 'animate-pulse' : ''}>{tab.icon}</span> 
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="md:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <GlassCard className="p-8 border-white/5 bg-white/5 relative overflow-hidden">
                                    {/* Decorator */}
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                                        {activeTab === 'profile' && <User size={200} />}
                                        {activeTab === 'security' && <Shield size={200} />}
                                        {activeTab === 'notifications' && <Bell size={200} />}
                                    </div>

                                    {activeTab === 'profile' && (
                                        <div className="relative z-10 space-y-8">
                                            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-transparent border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-[0_0_20px_rgba(0,245,255,0.15)]">
                                                    <User size={40} />
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-black uppercase tracking-tight">{user.name}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/40 mt-2">
                                                        <Shield size={12} className={user.role === 'ADMIN' ? 'text-emerald-400' : 'text-blue-400'} />
                                                        {user.role} CLEARANCE
                                                    </div>
                                                </div>
                                            </div>

                                            <form className="space-y-6" onSubmit={handleSave}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-[var(--accent)] font-black uppercase tracking-widest">Full Name</label>
                                                        <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[var(--accent)] transition-colors"><User size={16} /></div>
                                                            <input type="text" defaultValue={user.name} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/50 transition-all font-medium" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-[var(--accent)] font-black uppercase tracking-widest">Email Address</label>
                                                        <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[var(--accent)] transition-colors"><Mail size={16} /></div>
                                                            <input type="email" defaultValue={user.email} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/50 transition-all font-medium" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-white/30 font-black uppercase tracking-widest">System User ID</label>
                                                        <div className="relative">
                                                            <input type="text" defaultValue={user.userId} disabled className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white/30 font-mono cursor-not-allowed" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl flex items-start gap-4 mt-8 backdrop-blur-sm">
                                                    <AlertCircle className="text-[var(--accent)] shrink-0 mt-0.5 animate-pulse" size={16} />
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] mb-1">Clearance Notice</h4>
                                                        <p className="text-xs text-white/60 font-medium">To modify your clearance level or authorization roles, please submit a formal request to the National Infrastructure Reform Commission.</p>
                                                    </div>
                                                </div>

                                                <div className="pt-8 border-t border-white/10 flex justify-end">
                                                    <button type="submit" className="flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-[0_10px_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]">
                                                        <Save size={14} /> Save Configuration
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {activeTab === 'security' && (
                                        <div className="relative z-10 space-y-8">
                                            <div className="mb-8">
                                                <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                                    <Shield className="text-[var(--accent)]" size={20} /> Authentication & Access
                                                </h3>
                                                <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">Manage your security credentials</p>
                                            </div>

                                            <form className="space-y-8" onSubmit={handleSave}>
                                                <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Change Password</h4>
                                                    
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <div className="relative group">
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Lock size={16} /></div>
                                                                <input type={showPassword ? 'text' : 'password'} placeholder="Current Password" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-all font-mono placeholder:font-sans" />
                                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[var(--accent)] transition-colors">
                                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="relative group">
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Key size={16} /></div>
                                                                <input type={showPassword ? 'text' : 'password'} placeholder="New Password" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-all font-mono placeholder:font-sans" />
                                                            </div>
                                                            <div className="relative group">
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Check size={16} /></div>
                                                                <input type={showPassword ? 'text' : 'password'} placeholder="Confirm New Password" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-all font-mono placeholder:font-sans" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-black uppercase tracking-tight text-white mb-1">Two-Factor Authentication</h4>
                                                        <p className="text-xs text-white/40">Secure your account with an additional verification step.</p>
                                                    </div>
                                                    <button type="button" onClick={() => toggleSetting('twoFactor')} className={`text-4xl transition-colors ${toggles.twoFactor ? 'text-[var(--accent)]' : 'text-white/20'}`}>
                                                        {toggles.twoFactor ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                                    </button>
                                                </div>

                                                <div className="pt-6 border-t border-white/10 flex justify-end">
                                                    <button type="submit" className="flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-[0_10px_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]">
                                                        <Shield size={14} /> Update Security
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {activeTab === 'notifications' && (
                                        <div className="relative z-10 space-y-8">
                                            <div className="mb-8">
                                                <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                                    <Bell className="text-[var(--accent)]" size={20} /> Alert Preferences
                                                </h3>
                                                <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">Configure how you receive system updates</p>
                                            </div>

                                            <div className="space-y-4">
                                                {[
                                                    { id: 'emailAlerts', title: 'Email Alerts', desc: 'Receive critical updates via email.', icon: <Mail size={18} /> },
                                                    { id: 'pushNotif', title: 'Push Notifications', desc: 'Real-time browser notifications.', icon: <Bell size={18} /> },
                                                    { id: 'smsNotif', title: 'SMS Updates', desc: 'Text messages for high-severity events.', icon: <Smartphone size={18} /> },
                                                    { id: 'weeklyDigest', title: 'Weekly Digest', desc: 'A summary report of regional infrastructure changes.', icon: <Check size={18} /> }
                                                ].map(item => (
                                                    <div key={item.id} className="bg-black/20 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3 rounded-xl border ${toggles[item.id as keyof typeof toggles] ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]' : 'bg-white/5 border-white/5 text-white/30'}`}>
                                                                {item.icon}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-bold text-white mb-0.5">{item.title}</h4>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => toggleSetting(item.id as keyof typeof toggles)} 
                                                            className={`transition-colors ${toggles[item.id as keyof typeof toggles] ? 'text-[var(--accent)] drop-shadow-[0_0_10px_rgba(0,245,255,0.4)]' : 'text-white/20 hover:text-white/40'}`}
                                                        >
                                                            {toggles[item.id as keyof typeof toggles] ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-8 border-t border-white/10 flex justify-end">
                                                <button onClick={handleSave} className="flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-[0_10px_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]">
                                                    <Save size={14} /> Save Preferences
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </GlassCard>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;

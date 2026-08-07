import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, XCircle, Megaphone, Clock, AlertTriangle, Zap } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io(import.meta.env.VITE_API_URL);

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(import.meta.env.VITE_API_URL + '/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch { }
    };
    
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(import.meta.env.VITE_API_URL + '/api/announcements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnnouncements(res.data);
      } catch { }
    };

    fetchNotifications();
    fetchAnnouncements();

    // Listen for real-time updates
    socket.on('project_notification', (data) => {
      setNotifications(prev => [{
        id: Math.random().toString(),
        type: 'PROJECT_UPDATE',
        title: data.title,
        message: data.message,
        createdAt: new Date().toISOString(),
        read: false
      }, ...prev]);
      
      toast(data.message, { icon: '🔔' });
    });

    return () => { socket.off('project_notification'); };
  }, []);

  const allItems = [
    ...announcements.map(a => ({ ...a, type: 'announcement', time: a.createdAt })),
    ...notifications.map(n => ({ ...n, type: 'notification', time: n.createdAt }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const getIcon = (item: any) => {
    if (item.type === 'announcement') {
      switch (item.priority) {
        case 'CRITICAL': return <AlertTriangle size={18} className="text-red-400" />;
        case 'WARNING': return <Zap size={18} className="text-amber-400" />;
        default: return <Megaphone size={18} className="text-[var(--accent)]" />;
      }
    }
    return item.type === 'SUCCESS' || item.status === 'APPROVED'
      ? <CheckCircle size={18} className="text-emerald-400" />
      : <XCircle size={18} className="text-red-400" />;
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <header className="mb-10">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
          <Bell className="text-amber-400 animate-pulse" size={28} /> Notifications
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Status updates and system announcements</p>
      </header>

      <div className="space-y-4 max-w-6xl w-full">
        {allItems.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center">
            <Bell size={48} className="text-white/10 mb-4" />
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/15">No notifications yet</p>
          </div>
        ) : allItems.map((item, i) => (
          <motion.div key={`${item.type}-${item.id}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <GlassCard className={`!p-6 border-white/5 hover:border-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-[1.5rem] bg-gradient-to-r ${
              item.type === 'announcement' && item.priority === 'CRITICAL' ? 'from-red-500/5 to-transparent !border-red-500/20' : 
              item.type === 'SUCCESS' || item.status === 'APPROVED' ? 'from-emerald-500/5 to-transparent' : 'from-white/[0.01] to-transparent'
            }`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  item.type === 'announcement' && item.priority === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' :
                  item.type === 'SUCCESS' || item.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20' :
                  'bg-white/5 border-white/5'
                }`}>
                  {getIcon(item)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      item.type === 'announcement' && item.priority === 'CRITICAL' ? 'text-red-400' :
                      item.type === 'announcement' && item.priority === 'WARNING' ? 'text-amber-400' :
                      item.type === 'SUCCESS' || item.status === 'APPROVED' ? 'text-emerald-400' : 'text-white/30'
                    }`}>
                      {item.type === 'announcement' ? `BROADCAST • ${item.priority}` : 'STATUS UPDATE'}
                    </span>
                    <span className="text-[10px] font-mono text-white/20 flex items-center gap-1.5 font-medium shrink-0">
                      <Clock size={10} /> {new Date(item.time).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-black text-base text-white mb-0.5 tracking-tight">{item.title}</h4>
                  <p className="text-sm text-white/50 font-medium italic leading-relaxed">{item.type === 'announcement' ? item.content : item.message}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;

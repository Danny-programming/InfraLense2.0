import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, XCircle, Megaphone, Clock, Info, AlertTriangle, Zap } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';
import { io } from 'socket.io-client';

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
    ...notifications
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const getIcon = (item: any) => {
    if (item.type === 'announcement') {
      switch (item.priority) {
        case 'CRITICAL': return <AlertTriangle size={16} className="text-red-400" />;
        case 'WARNING': return <Zap size={16} className="text-amber-400" />;
        default: return <Megaphone size={16} className="text-[var(--accent)]" />;
      }
    }
    return item.status === 'APPROVED'
      ? <CheckCircle size={16} className="text-emerald-400" />
      : <XCircle size={16} className="text-red-400" />;
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <header className="mb-10">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
          <Bell className="text-amber-400" size={28} /> Notifications
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Status updates and system announcements</p>
      </header>

      <div className="space-y-4 max-w-3xl">
        {allItems.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center">
            <Bell size={48} className="text-white/10 mb-4" />
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/15">No notifications yet</p>
          </div>
        ) : allItems.map((item, i) => (
          <motion.div key={`${item.type}-${item.id}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <GlassCard className={`!p-5 border-white/5 hover:border-white/10 transition-all ${item.type === 'announcement' && item.priority === 'CRITICAL' ? '!border-red-500/20' : ''
              }`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  {getIcon(item)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                      {item.type === 'announcement' ? `BROADCAST • ${item.priority}` : 'STATUS UPDATE'}
                    </span>
                    <span className="text-[9px] font-mono text-white/15 flex items-center gap-1">
                      <Clock size={9} /> {new Date(item.time).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-black text-sm mb-0.5">{item.title}</h4>
                  <p className="text-xs text-white/40 italic leading-relaxed">{item.type === 'announcement' ? item.content : item.message}</p>
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

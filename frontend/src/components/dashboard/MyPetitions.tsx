import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, MapPin, Download, FileCheck, ShieldCheck, XCircle, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io(import.meta.env.VITE_API_URL);

interface MyPetitionsProps {
  onTrack?: (id: string) => void;
}

const MyPetitions: React.FC<MyPetitionsProps> = ({ onTrack }) => {
  const [petitions, setPetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPetitions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/petitions/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPetitions(res.data);
    } catch (err) {
      console.error('Failed to fetch petitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetitions();

    socket.on('governance_update', (data) => {
      // Check if the update affects one of our petitions
      setPetitions(prev => {
        const index = prev.findIndex(p => p.id === data.id);
        if (index !== -1) {
          toast(`${data.status === 'APPROVED' ? '✅' : '❌'} YOUR PETITION HAS BEEN ${data.status}`, {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#0a192f',
              color: '#fff',
              border: '1px solid rgba(0,245,255,0.2)',
              fontSize: '10px',
              fontWeight: '900',
              letterSpacing: '0.1em'
            }
          });
          const updated = [...prev];
          updated[index] = { ...updated[index], status: data.status };
          return updated;
        }
        return prev;
      });
    });

    return () => {
      socket.off('governance_update');
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'APPROVED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'REJECTED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'RESOLVED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock size={14} />;
      case 'APPROVED': return <ShieldCheck size={14} />;
      case 'REJECTED': return <XCircle size={14} />;
      case 'RESOLVED': return <CheckCircle size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const handleExport = (petition: any) => {
    const isApproved = petition.status === 'APPROVED';
    const isRejected = petition.status === 'REJECTED';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Governance Certificate - ${petition.id}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; padding: 40px; color: #333; }
    .certificate { background: white; max-width: 800px; margin: 0 auto; border: 15px solid #1a2a44; padding: 60px; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px solid #1a2a44; padding-bottom: 20px; margin-bottom: 40px; }
    .header h1 { margin: 0; font-size: 32px; letter-spacing: 4px; color: #1a2a44; text-transform: uppercase; }
    .header p { margin: 5px 0 0; font-size: 12px; letter-spacing: 2px; color: #666; font-weight: bold; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(0,0,0,0.03); font-weight: 900; z-index: 0; pointer-events: none; width: 100%; text-align: center; }
    .content { position: relative; z-index: 1; }
    .row { display: flex; margin-bottom: 20px; border-bottom: 1px fill #eee; padding-bottom: 10px; }
    .label { width: 200px; font-weight: bold; color: #1a2a44; text-transform: uppercase; font-size: 12px; }
    .value { flex: 1; font-size: 14px; }
    .petition-body { background: #f9f9f9; padding: 25px; border-left: 5px solid #1a2a44; font-style: italic; line-height: 1.6; margin: 30px 0; }
    .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
    .seal-box { border: 2px solid #ccc; width: 150px; height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #ccc; font-size: 10px; text-transform: uppercase; }
    .official-seal { 
      border: 4px double ${isApproved ? '#059669' : isRejected ? '#dc2626' : '#1a2a44'}; 
      color: ${isApproved ? '#059669' : isRejected ? '#dc2626' : '#1a2a44'}; 
      padding: 10px 20px; 
      font-weight: 900; 
      transform: rotate(-15deg); 
      display: inline-block; 
      font-size: 24px;
      margin-top: 20px;
    }
    .meta { font-size: 10px; color: #999; margin-top: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="watermark">INFRALENSE</div>
    <div class="header">
      <h1>InfraLense Intelligence OS</h1>
      <p>NATIONAL INFRASTRUCTURE REFORM COMMISSION</p>
    </div>
    
    <div class="content">
      <div class="row"><div class="label">Certificate ID</div><div class="value">${petition.id}</div></div>
      <div class="row"><div class="label">Submission Date</div><div class="value">${new Date(petition.createdAt).toLocaleString()}</div></div>
      <div class="row"><div class="label">Priority Rating</div><div class="value">${petition.severityScore}% / 100%</div></div>
      <div class="row"><div class="label">Primary Location</div><div class="value">${petition.locationName}</div></div>
      
      <div style="margin-top: 40px;">
        <div class="label" style="margin-bottom: 10px;">Subject Title</div>
        <div class="value" style="font-size: 18px; font-weight: bold;">${petition.title}</div>
      </div>
      
      <div class="petition-body">
        "${petition.content}"
      </div>
      
      <div class="footer">
        <div>
          <div class="label">Status Authorization</div>
          <div class="official-seal">${petition.status}</div>
        </div>
        <div class="seal-box">
          DIGITAL AUTHENTICATION<br>ENCRYPTED VIA<br>SECURE PROTOCOL
        </div>
      </div>
      
      <div class="meta">
        This is an electronically generated governance document. No physical signature required.<br>
        Verified at ${new Date().toISOString()} via Secure System Link.
      </div>
    </div>
  </div>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InfraLense_Certificate_${petition.id.slice(0, 8)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRejectionReport = (petition: any) => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background: #020812; color: white; padding: 40px; text-align: left; }
    .report { border: 2px solid #ef4444; border-radius: 24px; padding: 40px; background: rgba(239, 68, 68, 0.05); }
    .header { border-bottom: 1px solid rgba(239, 68, 68, 0.2); margin-bottom: 30px; padding-bottom: 20px; }
    .title { font-size: 24px; font-weight: 900; color: #ef4444; text-transform: uppercase; letter-spacing: -1px; }
    .case-id { font-family: monospace; opacity: 0.5; font-size: 12px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 10px; font-weight: 900; color: #ef4444; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .reason { background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; font-style: italic; line-height: 1.6; }
    .path-to-approval { border-left: 2px solid #ef4444; padding-left: 20px; margin-top: 40px; }
    .footer { margin-top: 60px; font-size: 10px; opacity: 0.3; text-align: center; }
  </style>
</head>
<body>
  <div class="report">
    <div class="header">
      <div class="title">Official Rejection Briefing</div>
      <div class="case-id">CASE_REF: ${petition.id.toUpperCase()}</div>
    </div>
    
    <div class="section">
      <div class="section-title">Project Context</div>
      <p><strong>Title:</strong> ${petition.title}</p>
      <p><strong>Location:</strong> ${petition.locationName}</p>
      <p><strong>Impact Scope:</strong> ${petition.population} citizens</p>
    </div>

    <div class="section">
      <div class="section-title">Administrative Decision</div>
      <div class="reason">
        ${petition.rejectionReason || "The current proposal does not meet the necessary high-impact criteria for immediate infrastructure allocation. Resource priority has been shifted to higher-severity zones."}
      </div>
    </div>

    <div class="section path-to-approval">
      <div class="section-title">Path To Approval (Future Projection)</div>
      <p>To qualify for immediate reconsideration, the following metrics should be monitored:</p>
      <ul>
        <li>Affected Population threshold: Re-evaluate when region exceeds project growth targets.</li>
        <li>Severity Index: Monitor for infrastructure degradation beyond current levels.</li>
        <li>Community Support: Consolidate multiple similar reports to increase priority ranking.</li>
      </ul>
    </div>

    <div class="footer">
      THIS IS A GOVERNMENT GENERATED DOCUMENT (INFRA Lense INTELLIGENCE OS) - VERIFIED ON ${new Date().toLocaleDateString()}
    </div>
  </div>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InfraLense_Rejection_Briefing_${petition.id.slice(0, 8)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent-dim)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <header className="mb-10">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
          <FileText className="text-[var(--accent)]" size={28} /> My Governance Portfolio
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Track and manage your submitted infrastructure reform petitions</p>
      </header>

      {petitions.length === 0 ? (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-50">
          <FileText size={64} className="mb-4 text-[var(--accent)]" />
          <h3 className="text-xl font-bold">No Petitions Found</h3>
          <p>Start by analyzing a region on the map and generating a petition.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {petitions.map((petition, i) => (
            <motion.div
              key={petition.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-6 hover:border-[var(--accent)]/30 transition-all group relative overflow-hidden">

                {/* ═══ NOTARY SEAL OVERLAY ═══ */}
                {(petition.status === 'APPROVED' || petition.status === 'RESOLVED') && (
                  <div className="absolute top-6 right-6 z-10 pointer-events-none select-none" style={{ transform: 'rotate(-18deg)' }}>
                    <div className="w-[130px] h-[130px] rounded-full border-[4px] border-emerald-500/60 flex items-center justify-center relative">
                      <div className="absolute inset-[6px] rounded-full border-[2px] border-emerald-500/40 flex flex-col items-center justify-center text-center p-2">
                        <span className="text-[7px] font-black uppercase tracking-[0.25em] text-emerald-400/80 leading-none mb-1">InfraLense</span>
                        <ShieldCheck size={22} className="text-emerald-400/70 mb-0.5" />
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-400 leading-none">Approved</span>
                        <div className="w-12 h-[1px] bg-emerald-500/30 my-1" />
                        <span className="text-[6px] font-bold uppercase tracking-[0.2em] text-emerald-400/50 leading-none">Official Seal</span>
                      </div>
                    </div>
                  </div>
                )}
                {petition.status === 'REJECTED' && (
                  <div className="absolute top-6 right-6 z-10 pointer-events-none select-none" style={{ transform: 'rotate(12deg)' }}>
                    <div className="w-[130px] h-[130px] rounded-full border-[4px] border-red-500/50 flex items-center justify-center relative">
                      <div className="absolute inset-[6px] rounded-full border-[2px] border-red-500/30 flex flex-col items-center justify-center text-center p-2">
                        <span className="text-[7px] font-black uppercase tracking-[0.25em] text-red-400/80 leading-none mb-1">InfraLense</span>
                        <XCircle size={22} className="text-red-400/70 mb-0.5" />
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-red-400 leading-none">Rejected</span>
                        <div className="w-12 h-[1px] bg-red-500/30 my-1" />
                        <span className="text-[6px] font-bold uppercase tracking-[0.2em] text-red-400/50 leading-none">Not Approved</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${getStatusColor(petition.status)}`}>
                    {getStatusIcon(petition.status)}
                    {petition.status}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {new Date(petition.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--accent)] transition-colors">{petition.title}</h3>

                <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-4">
                  <MapPin size={14} />
                  <span>{petition.locationName}</span>
                </div>

                <div className="bg-black/20 rounded-lg p-4 mb-4 line-clamp-3 text-sm text-[var(--text-secondary)] italic">
                  "{petition.content}"
                </div>

                {petition.status === 'REJECTED' && petition.rejectionReason && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-red-400">
                      <ShieldAlert size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Administrative Feedback</span>
                    </div>
                    <p className="text-xs text-white/60 italic leading-relaxed">
                      "{petition.rejectionReason}"
                    </p>
                  </div>
                )}

                {/* ═══ 7-STAGE PROGRESS TRACKER ═══ */}
                <div className="flex items-center gap-3 py-4 border-y border-white/5 my-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                      <span className="text-white/40">Deployment Progress</span>
                      <span className={`${petition.status === 'RESOLVED' ? 'text-emerald-400' : 'text-[var(--accent)]'} animate-pulse`}>
                        {petition.status === 'RESOLVED' ? 'Finalized' : 'Phase ' + (petition.status === 'APPROVED' ? '2/7' : petition.status === 'REVIEWING' ? '3/7' : '1/7')}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                        <div 
                          key={s} 
                          className={`h-full flex-1 transition-all duration-700 ${
                            (petition.status === 'RESOLVED') || 
                            (petition.status === 'REVIEWING' && s <= 3) || 
                            (petition.status === 'APPROVED' && s <= 2) || 
                            (s === 1)
                            ? (petition.status === 'RESOLVED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-[var(--accent)] shadow-[0_0_10px_rgba(0,245,255,0.4)]') 
                            : 'bg-white/10'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-4 border-y border-white/5 my-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                      <span className="text-white/40">Deployment Progress</span>
                      <span className={`${petition.status === 'RESOLVED' ? 'text-emerald-400' : 'text-[var(--accent)]'} animate-pulse`}>
                        {petition.status === 'RESOLVED' ? 'Finalized' : 'Phase ' + (petition.status === 'APPROVED' ? '2/7' : petition.status === 'REVIEWING' ? '3/7' : '1/7')}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                        <div 
                          key={s} 
                          className={`h-full flex-1 transition-all duration-700 ${
                            (petition.status === 'RESOLVED') || 
                            (petition.status === 'REVIEWING' && s <= 3) || 
                            (petition.status === 'APPROVED' && s <= 2) || 
                            (s === 1)
                            ? (petition.status === 'RESOLVED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-[var(--accent)] shadow-[0_0_10px_rgba(0,245,255,0.4)]') 
                            : 'bg-white/10'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                  <div className="flex gap-4">
                    <div>
                      <div className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Severity</div>
                      <div className="text-sm font-bold">{(petition.severityScore * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Impact</div>
                      <div className="text-sm font-bold">{petition.population.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => petition.status === 'REJECTED' ? handleDownloadRejectionReport(petition) : handleExport(petition)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                        petition.status === 'REJECTED' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' 
                        : 'bg-white/5 border-white/5 hover:bg-[var(--accent)] hover:text-black'
                      }`}
                    >
                      <Download size={12} /> {petition.status === 'REJECTED' ? 'Download Briefing' : 'Download Case'}
                    </button>
                    <button 
                      onClick={() => onTrack && onTrack(petition.id)}
                      className="text-[var(--accent)] text-[9px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4 flex items-center gap-2"
                    >
                      <FileCheck size={12} /> View Details
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPetitions;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon,
  Globe,
  Bell,
  FileText,
  BarChart3,
  Cpu,
  MapPin,
  Layers as Split,
  Trophy,
  Wand2,
  Settings,
  LogOut,
  User,
  Download,
  ArrowLeft,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';
import { slideIn } from '../lib/animations';
import { useMapStore } from '../store/mapStore';
import InfraMap from '../components/map/InfraMap';
import GlassCard from '../components/ui/GlassCard';
import axios from 'axios';
import toast from 'react-hot-toast';
import MapSearch from '../components/map/MapSearch';
import MyPetitions from '../components/dashboard/MyPetitions';
import CommunityFeed from '../components/dashboard/CommunityFeed';
import ImpactDashboard from '../components/dashboard/ImpactDashboard';
import NotificationCenter from '../components/dashboard/NotificationCenter';
import PetitionWizard from '../components/dashboard/PetitionWizard';
import ReportIssueForm from '../components/dashboard/ReportIssueForm';
import TrackProjectView from '../components/dashboard/TrackProjectView';

const Dashboard: React.FC = () => {
  const { tileMode, setTileMode, primaryAnalysis, closeAnalysis, heatmap, activeFilters } = useMapStore();

  const [activeView, setActiveView] = React.useState('Map');
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [analysisView, setAnalysisView] = React.useState<'overview' | 'charts'>('overview');
  const [category, setCategory] = React.useState('all');
  const [petitionText, setPetitionText] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: '🌐' },
    { id: 'school', name: 'School', icon: '🎓' },
    { id: 'bank', name: 'Bank', icon: '🏦' },
    { id: 'finance', name: 'Finance', icon: '💰' },
  ];

  const handleDownload = () => {
    if (!petitionText || !primaryAnalysis.data) return;
    const content = `
REFORM PETITION: ${primaryAnalysis.data.location.name}
================================

Category: ${category.toUpperCase()}
Date: ${new Date().toLocaleDateString()}
Severity Index: ${(primaryAnalysis.data.severity * 100).toFixed(0)}%
Affected Population: ${primaryAnalysis.data.population.toLocaleString()}

--------------------------------
CASE BRIEFING:
${petitionText}

--------------------------------
Generated via InfraLense Platform
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InfraLense_Reform_${category}_${primaryAnalysis.data.location.name.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  React.useEffect(() => {
    // Force a fresh location sync on dashboard entry to ensure we take the user to their location
    // This resolves issues where redirects from login might prevent the auto-locate from firing reliably
    const store = useMapStore.getState();
    if (!store.focalLocation && !store.pingLocation) {
      console.log('[Dashboard] Initial entry: Triggering regional sync...');
      toast.loading('Synchronizing GPS location...', { id: 'locate-me' });
      store.triggerLocate();
    }
  }, []);

  const handleGeneratePetition = async () => {
    if (!primaryAnalysis.data) return;
    setIsGenerating(true);
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/analysis/generate-petition', {
        data: {
          locationName: primaryAnalysis.data.location.name,
          category: category,
          population: primaryAnalysis.data.population,
          schools: primaryAnalysis.data.gaps.schools,
          hospitals: primaryAnalysis.data.gaps.hospitals,
          banks: primaryAnalysis.data.gaps.banks
        }
      });
      setPetitionText(res.data.text);
      toast.success('Petition generated successfully!');
    } catch (e) {
      toast.error('AI Service is currently over capacity.');
    } finally {
      setIsGenerating(false);
    }
  };

  const [isPetitionsOpen, setIsPetitionsOpen] = React.useState(false);

  React.useEffect(() => {
    if (['Petitions', 'Monitor', 'Wizard'].includes(activeView)) {
      setIsPetitionsOpen(true);
    }
  }, [activeView]);

  const navItems: { 
    icon: React.ReactNode; 
    label: string; 
    view?: string; 
    onClick?: () => void;
    children?: { label: string; view: string; icon: React.ReactNode }[];
  }[] = [
    { icon: <MapIcon size={20} />, label: 'Explorer', view: 'Map' },
    { 
      icon: <FileText size={20} />, 
      label: 'Petitions', 
      children: [
        { label: 'My Petitions', view: 'Petitions', icon: <FileText size={16} /> },
        { label: 'Lifecycle Tracker', view: 'Monitor', icon: <Activity size={16} /> },
        { label: 'New Petition', view: 'Wizard', icon: <Wand2 size={16} /> },
      ]
    },
    { icon: <BarChart3 size={20} />, label: 'Analytics', view: 'Analytics' },
    { icon: <Globe size={20} />, label: 'Community', view: 'Community' },
    { icon: <AlertTriangle size={20} />, label: 'Report Issue', view: 'ReportIssue' },
    { icon: <Trophy size={20} />, label: 'My Impact', view: 'Impact' },
    { icon: <Bell size={20} />, label: 'Notifications', view: 'Notifications' },
  ];

  const secondaryNavItems: { icon: React.ReactNode, label: string, view?: string, onClick?: () => void }[] = [
    { icon: <Settings size={20} />, label: 'Settings', view: 'Settings' },
    { icon: <LogOut size={20} />, label: 'Sign Out', onClick: () => window.location.href = '/' },
  ];

  return (
    <div className="h-screen w-full bg-[#020812] text-white flex flex-col overflow-hidden selection:bg-[var(--accent)] selection:text-black font-sans">
      <header className="h-14 border-b border-white/5 bg-[#050b16] flex items-center justify-between px-6 z-[1001] relative">
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center rotate-3 shadow-[0_0_20px_rgba(0,245,255,0.4)]">
              <Activity className="text-black" size={20} />
            </div>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tighter uppercase italic flex items-center gap-2">
              Infra<span className="text-[var(--accent)]">Lense</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">System Online: Mumbai Sector</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <User className="text-white/40 hover:text-[var(--accent)] cursor-pointer transition-colors" size={20} />
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden bg-[#020812]">
        {/* Sidebar - Catchy Premium Design */}
        <aside className="w-64 border-r border-white/5 bg-gradient-to-b from-[#050b16] to-[#020812] flex flex-col shrink-0 z-50 relative group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.03),transparent_40%)] pointer-events-none" />

          <div className="flex-1 py-8 px-5 space-y-6 overflow-y-auto custom-scrollbar relative">
            <div>
              <h3 className="text-[9px] uppercase font-black text-white/20 tracking-[0.4em] px-2 mb-5">Core Modules</h3>
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const hasChildren = !!item.children;
                  const isChildActive = hasChildren && item.children?.some(sub => sub.view === activeView);
                  const isCurrentActive = activeView === item.view;

                  return (
                    <div key={item.label} className="w-full">
                      <button
                        onClick={() => {
                          if (hasChildren) {
                            setIsPetitionsOpen(!isPetitionsOpen);
                          } else {
                            if (item.onClick) item.onClick();
                            if (item.view) setActiveView(item.view);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 relative group/btn ${isCurrentActive
                          ? 'bg-white/[0.03] text-[var(--accent)]'
                          : isChildActive
                            ? 'text-white/80'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {/* Active vertical strip indicator */}
                        {isCurrentActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--accent)] rounded-r-md shadow-[0_0_10px_var(--accent)]" />
                        )}

                        <div className="flex items-center gap-4">
                          <div className={`${isCurrentActive || isChildActive ? 'text-[var(--accent)]' : 'text-white/20 group-hover/btn:text-white/60'} transition-colors`}>
                            {item.icon}
                          </div>
                          <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        </div>
                        {hasChildren && (
                          <div className="text-white/30 group-hover/btn:text-white/60 transition-colors">
                            {isPetitionsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                        )}
                      </button>

                      {/* Dropdown transition */}
                      <AnimatePresence>
                        {hasChildren && isPetitionsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-6 pl-4 border-l border-white/5 mt-1 space-y-1"
                          >
                            {item.children?.map((sub) => {
                              const isSubActive = activeView === sub.view;
                              return (
                                <button
                                  key={sub.label}
                                  onClick={() => setActiveView(sub.view)}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 relative group/subBtn ${isSubActive
                                    ? 'text-[var(--accent)] font-black'
                                    : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
                                    }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`${isSubActive ? 'text-[var(--accent)]' : 'text-white/20 group-hover/subBtn:text-white/60'} transition-colors`}>
                                      {sub.icon}
                                    </div>
                                    <span className="text-[12px] font-bold tracking-tight">{sub.label}</span>
                                  </div>
                                  
                                  {isSubActive && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)] animate-pulse" />
                                  )}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase font-black text-white/20 tracking-[0.4em] px-2 mb-6">System</h3>
              <div className="space-y-2">
                {secondaryNavItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      if (item.view) setActiveView(item.view);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                  >
                    <div className="opacity-50">{item.icon}</div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Removed Live System Status card as requested */}
        </aside>

        {/* View Content */}
        {activeView === 'Petitions' ? (
          <MyPetitions onTrack={(id) => { setSelectedProjectId(id); setActiveView('Monitor'); }} />
        ) : activeView === 'ReportIssue' ? (
          <ReportIssueForm />
        ) : activeView === 'Community' ? (
          <CommunityFeed />
        ) : activeView === 'Impact' ? (
          <ImpactDashboard />
        ) : activeView === 'Notifications' ? (
          <NotificationCenter />
        ) : activeView === 'Wizard' ? (
          <PetitionWizard />
        ) : activeView === 'Monitor' ? (
          <TrackProjectView initialSelectedId={selectedProjectId} onClearSelection={() => setSelectedProjectId(null)} />
        ) : activeView === 'Analytics' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[#020812]">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-[10px] text-[var(--accent)] font-black uppercase tracking-[0.4em] mb-4">Macro Intelligence</h3>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">Global <span className="text-[var(--accent)]">Analytics</span></h2>
                </div>
                <div className="px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Data Realtime: 2026-Q1</span>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Analyzed Nodes', value: '1.24M', trend: '+12%', sub: 'Regional density scan' },
                  { label: 'Critical Sectors', value: '142', trend: '-5%', sub: 'High deficit regions' },
                  { label: 'System Resilience', value: '68%', trend: '+2%', sub: 'Governance response factor' }
                ].map((m, i) => (
                  <GlassCard key={i} className="p-6 border-white/5 bg-white/5 hover:border-[var(--accent)]/30 transition-all group">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-4 group-hover:text-[var(--accent)] transition-colors">{m.label}</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black italic tracking-tighter text-white">{m.value}</span>
                      <span className={`text-[10px] font-black ${m.trend.startsWith('+') ? 'text-green-400' : 'text-[var(--danger)]'}`}>{m.trend}</span>
                    </div>
                    <p className="text-[11px] text-white/30 mt-4 font-medium uppercase tracking-tight">{m.sub}</p>
                  </GlassCard>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="p-8 border-white/5 bg-white/5 h-[400px] flex flex-col">
                  <div className="mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">Sector Deficit Inventory</h4>
                    <p className="text-sm font-bold text-white/60">Current Gap Index by category</p>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'School', gap: 72, stability: 40 },
                        { name: 'Hospital', gap: 58, stability: 55 },
                        { name: 'Bank', gap: 42, stability: 80 },
                        { name: 'Transport', gap: 88, stability: 20 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 900 }} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(5, 11, 22, 0.95)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '16px', fontSize: '10px' }}
                          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        />
                        <Bar dataKey="gap" fill="var(--accent)" radius={[8, 8, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard className="p-8 border-white/5 bg-white/5 h-[400px] flex flex-col">
                  <div className="mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">System Growth Projection</h4>
                    <p className="text-sm font-bold text-white/60">5-Year predictive resilience velocity</p>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { year: '2026', value: 30 }, { year: '2027', value: 45 }, { year: '2028', value: 40 }, { year: '2029', value: 65 }, { year: '2030', value: 82 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(5, 11, 22, 0.95)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '16px', fontSize: '10px' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={4} dot={{ r: 6, fill: 'var(--accent)', strokeWidth: 4, stroke: 'rgba(0,245,255,0.2)' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </div>

              <div className="p-10 rounded-[3rem] bg-gradient-to-r from-[var(--accent-dim)] to-transparent border border-[var(--accent)]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <BarChart3 size={120} />
                </div>
                <div className="max-w-2xl relative z-10">
                  <h4 className="text-xl font-black uppercase italic tracking-tighter mb-4 text-white">System Strategy Directive</h4>
                  <p className="text-sm text-white/60 leading-relaxed font-medium mb-8">
                    The current global analysis indicates a high consolidation of critical gaps in Tier-2 urban sectors. AI-driven predictive modeling suggests that the dispatch of formal petitions in these regions could accelerate resilience parity by 14% within the next fiscal transition.
                  </p>
                  <button
                    onClick={() => setActiveView('Map')}
                    className="px-8 py-3.5 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-[var(--accent)] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                  >
                    Initiate Sector Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative bg-[#020812]">
            {/* Search Bar - Catchy Floating Design */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-2xl px-6 pointer-events-none flex items-center gap-4">
              <MapSearch />
              <div className="flex gap-2 p-1 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
                {(['dark', 'satellite', 'street'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setTileMode(mode)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tileMode === mode ? 'bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20' : 'text-white/40 hover:text-white'
                      }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <InfraMap />
          </div>
        )}

        {/* AI Analytics Side Panel */}
        <AnimatePresence>
          {(primaryAnalysis.data || primaryAnalysis.loading) && activeView === 'Map' && (
            <motion.aside
              variants={slideIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute top-0 right-0 h-full w-full md:w-[460px] z-[1000] p-4 pointer-events-none"
            >
              <GlassCard className="h-full flex flex-col pointer-events-auto shadow-[0_32px_128px_rgba(0,0,0,0.8)] border-white/10 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                <div className="flex justify-between items-start p-6 pb-4">
                  <div>
                    <div className="text-[var(--accent)] font-black text-[10px] uppercase tracking-[0.4em] mb-2 opacity-80">Intelligence Terminal</div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Sector <span className="text-[var(--accent)]">Analysis</span></h2>
                  </div>
                  <button
                    onClick={() => closeAnalysis('primary')}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all text-white/30 hover:text-white border border-white/5"
                  >
                    ×
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 space-y-8 custom-scrollbar pb-10">
                  {primaryAnalysis.loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-2 border-[var(--accent)]/10 rounded-full" />
                        <div className="absolute inset-0 border-2 border-[var(--accent)] rounded-full border-t-transparent animate-spin" />
                        <div className="absolute inset-4 bg-[var(--accent)]/20 rounded-full animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-2">Analyzing Grid Data</p>
                        <p className="text-xs text-white/40 font-medium">Querying infrastructure density...</p>
                      </div>
                    </div>
                  ) : analysisView === 'overview' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                      {/* Sector Overview */}
                      <div className="space-y-3">
                        {/* Primary Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 text-center flex flex-col justify-center">
                            <label className="text-[9px] text-white/20 font-black uppercase tracking-widest block mb-1">Local Population</label>
                            <p className="text-xl font-black italic tracking-tighter text-[var(--accent)]">
                              {primaryAnalysis.data.population.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 text-center flex flex-col justify-center">
                            <label className="text-[9px] text-white/20 font-black uppercase tracking-widest block mb-1">Gap Index</label>
                            <span className={`text-xl font-black italic tracking-tighter ${(primaryAnalysis.data.severity * 100) > 60 ? 'text-[var(--danger)] animate-pulse' : 'text-[var(--warning)]'}`}>
                              {(primaryAnalysis.data.severity * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Location Details - Full Width to prevent truncation */}
                        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MapPin size={24} />
                          </div>
                          <label className="text-[9px] text-white/20 font-black uppercase tracking-widest block mb-2">Target Sector</label>
                          <p className="text-xl font-black leading-tight uppercase tracking-tighter text-white mb-1">
                            {primaryAnalysis.data.location.name.includes('Sector') && primaryAnalysis.data.location.city 
                              ? primaryAnalysis.data.location.city 
                              : primaryAnalysis.data.location.name.split(',')[0]}
                          </p>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                            {primaryAnalysis.data.location.name.includes('Sector') 
                              ? `Regional Sector ${primaryAnalysis.data.location.lat.toFixed(2)}, ${primaryAnalysis.data.location.lng.toFixed(2)}`
                              : primaryAnalysis.data.location.name.split(',').slice(1, 3).join(', ') || 'Regional Intelligence Scan'}
                          </p>
                        </div>
                      </div>

                      {/* Neural Overlays */}
                      <div className="space-y-4">
                        <button
                          onClick={() => useMapStore.getState().setHeatmap({ enabled: !heatmap.enabled })}
                          className={`w-full group relative overflow-hidden p-5 rounded-2xl border transition-all duration-500 ${heatmap.enabled
                            ? 'bg-[var(--accent-dim)] border-[var(--accent)]/50 text-[var(--accent)] shadow-[0_0_30px_rgba(0,245,255,0.1)]'
                            : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                            }`}
                        >
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${heatmap.enabled ? 'bg-[var(--accent)]/20' : 'bg-white/5'} transition-colors`}>
                                <Split size={20} />
                              </div>
                              <div className="text-left">
                                <span className="block text-xs font-black uppercase tracking-widest leading-none mb-1">Population Density</span>
                                <span className="text-[10px] opacity-60 font-medium lowercase">Population heatmap overlay active</span>
                              </div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${heatmap.enabled ? 'bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]' : 'bg-white/10'}`} />
                          </div>
                        </button>
                      </div>

                      {/* Infrastructure Layers */}
                      <div className="space-y-4">
                        <label className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em]">Grid Overlays</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(Object.keys(activeFilters) as Array<keyof typeof activeFilters>).map((key) => (
                            <button
                              key={key}
                              onClick={() => useMapStore.getState().toggleFilter(key)}
                              className={`py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${activeFilters[key]
                                ? 'bg-[var(--accent)]/10 border-[var(--accent)]/40 text-[var(--accent)] shadow-[0_0_15px_rgba(0,245,255,0.1)]'
                                : 'bg-white/5 border-white/5 text-white/20 hover:border-white/10'
                                }`}
                            >
                              {key}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* AI Scan Trigger */}
                      <button
                        onClick={() => setAnalysisView('charts')}
                        className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-[var(--accent)]/10 to-transparent border border-[var(--accent)]/20 hover:border-[var(--accent)]/40 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-[var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center justify-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shadow-[0_0_20px_rgba(0,245,255,0.2)]">
                            <Cpu className="animate-pulse" size={24} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-[var(--accent)] tracking-[0.3em]">AI Analytics</p>
                            <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">Initiate AL Deep Scan</h4>
                          </div>
                        </div>
                      </button>

                      {/* Address Module */}
                      <div className="bg-white/5 p-5 rounded-3xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]/40" />
                        <label className="text-[9px] text-[var(--accent)] font-black uppercase tracking-widest block mb-3 flex items-center gap-2">
                          <MapPin size={10} /> Validated Deployment Target
                        </label>
                        <p className="text-xs text-white/80 font-bold leading-relaxed">{primaryAnalysis.data.location.name}</p>
                      </div>

                      {/* Resilience Assessment */}
                      <div className="space-y-4">
                        <h3 className="text-[9px] uppercase font-black text-white/20 tracking-[0.4em]">Resilience Assessment</h3>
                        <div className="bg-gradient-to-br from-white/5 to-transparent p-6 rounded-3xl border border-white/5 relative group">
                          <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                            Analytical cross-correlation of <span className="text-white font-black italic">InfraXPopulation</span> reveals a density of
                            <span className="text-[var(--accent)] font-black mx-1">
                              {((primaryAnalysis.data.population / (primaryAnalysis.data.infraElements.length || 1)) / 100).toFixed(2)} units/100k
                            </span>
                            residents. Given the current gap index of {(primaryAnalysis.data.severity * 100).toFixed(0)}%, the region exhibits
                            <span className={`font-black uppercase tracking-tighter mx-1 ${primaryAnalysis.data.severity > 0.6 ? 'text-[var(--danger)]' : 'text-[var(--warning)]'}`}>
                              {primaryAnalysis.data.severity > 0.6 ? 'Critical Destabilization' : 'Moderate Inefficiency'}
                            </span>.
                          </p>

                          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Recommended Action</p>
                              <p className={`text-xs font-black uppercase tracking-tight ${primaryAnalysis.data.severity > 0.5 ? 'text-[var(--accent)] animate-pulse' : 'text-white/60'}`}>
                                {primaryAnalysis.data.severity > 0.5 ? 'Dispatch Urgent Petition' : 'Monitor Sector Stability'}
                              </p>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${primaryAnalysis.data.severity > 0.5 ? 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]' : 'bg-white/5 border-white/10 text-white/20'}`}>
                              {primaryAnalysis.data.severity > 0.5 ? 'Required' : 'Optional'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Infra Carousel */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Infrastructure Assets</h3>
                          <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-widest bg-[var(--accent)]/10 px-2 py-1 rounded">Swipe for more</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x cursor-grab active:cursor-grabbing">
                          {primaryAnalysis.data.infraElements
                            .sort((a: any, b: any) => {
                              const p = ['school', 'hospital', 'bank'];
                              const aIdx = p.indexOf(a?.tags?.amenity || '');
                              const bIdx = p.indexOf(b?.tags?.amenity || '');
                              if (aIdx !== -1 && bIdx === -1) return -1;
                              if (aIdx === -1 && bIdx !== -1) return 1;
                              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                              return 0;
                            })
                            .map((el: any, i: number) => (
                              <motion.div key={i} className="flex-shrink-0 w-56 snap-start p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-[var(--accent)]/40 transition-all group relative overflow-hidden">
                                <MapPin className="absolute top-0 right-0 p-4 opacity-5" size={40} />
                                <div className="flex flex-col gap-4 relative z-10">
                                  <div className="flex items-center justify-between">
                                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xl">
                                      {el.tags?.amenity === 'school' ? '🏫' : el.tags?.amenity === 'hospital' ? '🏥' : el.tags?.amenity === 'bank' ? '🏦' : '📍'}
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-[var(--accent)] tracking-widest">{el.tags?.amenity}</div>
                                  </div>
                                  <p className="text-sm font-black text-white line-clamp-2 uppercase">{el.tags?.name || `ID: ${el.id.toString().slice(-4)}`}</p>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </div>

                      {/* Category Selection for Map Panel */}
                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <label className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em]">Reform Focus</label>
                        <div className="grid grid-cols-4 gap-2">
                          {categories.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => { setCategory(c.id); setPetitionText(null); }}
                              className={`py-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1 ${category === c.id
                                ? 'bg-[var(--accent)]/10 border-[var(--accent)]/40 text-[var(--accent)]'
                                : 'bg-white/5 border-white/5 text-white/20 hover:border-white/10'
                                }`}
                            >
                              <span className="text-sm">{c.icon}</span>
                              <span className="text-[7px] font-black uppercase tracking-widest">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Petition Button */}
                      <div className="pt-8 border-t border-white/5">
                        {!petitionText ? (
                          <button
                            onClick={handleGeneratePetition}
                            disabled={isGenerating}
                            className={`w-full py-6 bg-white text-black font-black uppercase text-xs tracking-[0.3em] rounded-3xl transition-all flex items-center justify-center gap-4 group disabled:opacity-50 ${isGenerating ? 'cursor-wait' : 'hover:bg-[var(--accent)] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,245,255,0.2)]'}`}
                          >
                            {isGenerating ? (
                              <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Synchronizing...
                              </>
                            ) : (
                              <>
                                <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
                                Generate AI Reform Case
                              </>
                            )}
                          </button>
                        ) : (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-white/5 rounded-[2.5rem] border border-[var(--accent)]/30 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-[var(--accent)] font-black text-[10px] uppercase tracking-[0.4em]">Draft Briefing</h4>
                              <span className="px-3 py-1 bg-[var(--accent)]/10 rounded-full text-[var(--accent)] text-[8px] font-black uppercase tracking-widest">{category}</span>
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed italic line-clamp-6 mb-8 font-medium">"{petitionText}"</p>
                            <div className="flex gap-3">
                              <button
                                onClick={async () => {
                                  const token = localStorage.getItem('token');
                                  if (!token) return toast.error('Authentication required.');
                                  const loadingToast = toast.loading('Dispatching to governance portal...');
                                  try {
                                    await axios.post(import.meta.env.VITE_API_URL + '/api/petitions', {
                                      title: `${category.toUpperCase()} Reform: ${primaryAnalysis.data.location.name}`,
                                      content: petitionText,
                                      locationName: primaryAnalysis.data.location.name,
                                      latitude: primaryAnalysis.data.location.lat ?? useMapStore.getState().pingLocation?.lat ?? useMapStore.getState().focalLocation?.lat ?? 0,
                                      longitude: primaryAnalysis.data.location.lng ?? useMapStore.getState().pingLocation?.lng ?? useMapStore.getState().focalLocation?.lng ?? 0,
                                      severityScore: primaryAnalysis.data.severity,
                                      population: primaryAnalysis.data.population,
                                      targetAuthority: category === 'school' ? 'Education Board' : category === 'bank' ? 'RBI / Banking Div' : 'Municipal Corp'
                                    }, { headers: { Authorization: `Bearer ${token}` } });
                                    toast.success('Case uploaded successfully! check Petitions view.', { id: loadingToast });
                                    setPetitionText(null);
                                  } catch (e: any) {
                                    console.error('Dispatch failed:', e.response?.data || e.message);
                                    toast.error(e.response?.data?.error || 'System connection failed (Database offline).', { id: loadingToast });
                                  }
                                }}
                                className="flex-1 py-4 bg-[var(--accent)] text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_10px_30px_rgba(0,245,255,0.2)] hover:scale-[1.02] transition-transform"
                              >
                                Dispatch Case
                              </button>
                              <button
                                onClick={handleDownload}
                                className="p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 hover:text-[var(--accent)] transition-all"
                                title="Download formatted petition"
                              >
                                <Download size={18} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
                      <button
                        onClick={() => setAnalysisView('overview')}
                        className="flex items-center gap-3 text-[10px] font-black uppercase text-white/30 hover:text-[var(--accent)] transition-colors tracking-[0.3em]"
                      >
                        <ArrowLeft size={14} /> Back to Briefing
                      </button>

                      {/* Charts Section */}
                      <div className="space-y-12">
                        {/* Infrastructure Distribution */}
                        <div className="space-y-6">
                          <h3 className="text-[10px] uppercase font-black text-white/20 tracking-[0.4em]">Asset Distribution</h3>
                          <div className="h-64 relative bg-white/5 rounded-[2.5rem] p-6 border border-white/5">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    {
                                      name: 'Schools',
                                      value: primaryAnalysis.data.infraElements?.length > 0
                                        ? primaryAnalysis.data.infraElements.filter((e: any) => ['school', 'college', 'university'].includes(e.tags?.amenity)).length
                                        : primaryAnalysis.data.gaps.schools
                                    },
                                    {
                                      name: 'Hospitals',
                                      value: primaryAnalysis.data.infraElements?.length > 0
                                        ? primaryAnalysis.data.infraElements.filter((e: any) => ['hospital', 'clinic', 'doctors'].includes(e.tags?.amenity)).length
                                        : primaryAnalysis.data.gaps.hospitals
                                    },
                                    {
                                      name: 'Banks',
                                      value: primaryAnalysis.data.infraElements?.length > 0
                                        ? primaryAnalysis.data.infraElements.filter((e: any) => ['bank', 'atm'].includes(e.tags?.amenity)).length
                                        : primaryAnalysis.data.gaps.banks
                                    },
                                    {
                                      name: 'Others',
                                      value: primaryAnalysis.data.infraElements?.length > 0
                                        ? primaryAnalysis.data.infraElements.filter((e: any) => !['school', 'college', 'university', 'hospital', 'clinic', 'doctors', 'bank', 'atm'].includes(e.tags?.amenity)).length
                                        : 0
                                    },
                                  ].filter(d => d.value > 0)}
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={8}
                                  dataKey="value"
                                >
                                  {['#00f5ff', '#ff00ff', '#ffaa00', '#ffffff'].map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} stroke="none" />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{ backgroundColor: 'rgba(5, 11, 22, 0.95)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '16px', fontSize: '10px' }}
                                  itemStyle={{ color: '#fff', textTransform: 'uppercase', fontWeight: 900 }}
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  height={36}
                                  formatter={(value) => <span className="text-[9px] font-black uppercase tracking-wider text-white/40 ml-2">{value}</span>}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Gap Analysis */}
                        <div className="space-y-6">
                          <h3 className="text-[10px] uppercase font-black text-white/20 tracking-[0.4em]">Resilience vs Deficit</h3>
                          <div className="h-64 relative bg-white/5 rounded-[2.5rem] p-6 border border-white/5">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Deficit', value: primaryAnalysis.data.severity * 100 },
                                    { name: 'Resilience', value: 100 - (primaryAnalysis.data.severity * 100) },
                                  ]}
                                  startAngle={180}
                                  endAngle={0}
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={0}
                                  dataKey="value"
                                >
                                  {['#ff3b3b', '#00f5ff'].map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} stroke="none" />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ display: 'none' }} />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
                              <span className="text-3xl font-black italic text-white leading-none">{(primaryAnalysis.data.severity * 100).toFixed(0)}%</span>
                              <span className="text-[9px] font-black uppercase text-white/20 tracking-widest mt-2">Gap Index</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-[var(--accent-dim)] to-transparent rounded-[2.5rem] border border-[var(--accent)]/20 text-center space-y-4">
                          <p className="text-[11px] text-white/60 font-medium leading-relaxed italic">
                            "Spectral analysis confirms that infrastructure density is failing to track with regional population velocity."
                          </p>
                          <h5 className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest">— AL Intelligence Core</h5>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;

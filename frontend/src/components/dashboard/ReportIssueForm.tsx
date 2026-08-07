import React, { useState, useEffect } from 'react';
import { Camera, MapPin, UploadCloud, AlertCircle, Clock, CheckCircle, ChevronDown, ChevronUp, History, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import GlassCard from '../ui/GlassCard';

const ReportIssueForm: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [reports, setReports] = useState<any[]>([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const fetchReports = async () => {
        setLoadingReports(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(import.meta.env.VITE_API_URL + '/api/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            let userId = null;
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userId = payload.userId;
                } catch (e) {}
            }
            
            const userReports = userId ? res.data.filter((r: any) => r.creatorId === userId) : res.data;
            setReports(userReports);
        } catch (error) {
            console.error('Failed to fetch reports');
            toast.error('Failed to load history');
        } finally {
            setLoadingReports(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchReports();
        }
    }, [activeTab]);

    const handleToggleExpand = (id: string) => {
        setExpandedReportId(prev => prev === id ? null : id);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGetLocation = () => {
        setIsLocating(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                    setIsLocating(false);
                    toast.success('Location acquired');
                },
                (error) => {
                    console.error(error);
                    toast.error('Failed to get location. Please enable location services.');
                    setIsLocating(false);
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser');
            setIsLocating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) {
            toast.error('Please upload an image of the issue');
            return;
        }
        if (!location) {
            toast.error('Please provide your location');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('image', image);
        formData.append('description', description);
        formData.append('latitude', location.lat.toString());
        formData.append('longitude', location.lng.toString());

        try {
            const token = localStorage.getItem('token');
            await axios.post(import.meta.env.VITE_API_URL + '/api/complaints', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Issue reported successfully!');
            setImage(null);
            setImagePreview(null);
            setDescription('');
            setLocation(null);
            setActiveTab('history');
        } catch (error) {
            console.error(error);
            toast.error('Failed to report issue');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[#020812]">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
                    <div>
                        <h3 className="text-[10px] text-[var(--accent)] font-black uppercase tracking-[0.4em] mb-4">Citizen Incident Command</h3>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Issue <span className="text-[var(--accent)]">Reporting</span></h2>
                    </div>
                    
                    <div className="flex bg-white/5 border border-white/10 rounded-full p-1 shadow-lg">
                        <button 
                            onClick={() => setActiveTab('new')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-[var(--accent)] text-black shadow-[0_0_15px_rgba(0,245,255,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <Plus size={14} /> New Report
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-[var(--accent)] text-black shadow-[0_0_15px_rgba(0,245,255,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <History size={14} /> History
                        </button>
                    </div>
                </div>

                {activeTab === 'new' ? (
                    <GlassCard className="p-8 border-white/5 bg-white/5 relative overflow-hidden group animate-in fade-in zoom-in-95 duration-300">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <AlertCircle size={150} />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10 w-full">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Incident Image Evidence</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${imagePreview ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                                            }`}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[2rem]" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-white/40 group-hover:text-white/60 transition-colors">
                                                <Camera className="w-10 h-10 mb-3" />
                                                <p className="text-sm font-bold tracking-tight">Click to upload photo</p>
                                                <p className="text-[10px] uppercase font-black tracking-widest mt-2 text-white/20">Supported: JPG, PNG</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Geolocation Coordinates</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={isLocating}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all ${location
                                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 text-white/60'
                                            }`}
                                    >
                                        <MapPin className={isLocating ? 'animate-pulse' : ''} size={18} />
                                        <span className="text-sm font-bold uppercase tracking-widest">
                                            {isLocating ? 'Acquiring Signal...' : location ? 'Location Confirmed' : 'Get Current Location'}
                                        </span>
                                    </button>
                                </div>
                                {location && (
                                    <p className="text-[10px] font-mono text-white/30 mt-2 uppercase text-center">Lat: {location.lat.toFixed(6)} | Lng: {location.lng.toFixed(6)}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Optional Context</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the issue briefly..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-[var(--accent)] focus:ring-[var(--accent)] custom-scrollbar resize-none font-medium"
                                />
                            </div>

                            {/* Submit */}
                            <div className="pt-4 border-t border-white/5">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !image || !location}
                                    className="w-full py-5 bg-[var(--accent)] text-black font-black uppercase text-sm tracking-[0.3em] rounded-[2rem] hover:bg-white transition-all shadow-[0_10px_30px_rgba(0,245,255,0.2)] disabled:opacity-50 disabled:hover:bg-[var(--accent)] disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud size={20} />
                                            Dispatch Issue Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {loadingReports ? (
                            <div className="flex flex-col items-center justify-center py-20 text-white/40">
                                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Syncing Records...</span>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-white/30 bg-white/5 border border-white/5 rounded-[2rem]">
                                <History size={48} className="mb-4 opacity-20" />
                                <h3 className="text-xl font-bold italic mb-2">No Reports Found</h3>
                                <p className="text-[10px] uppercase tracking-widest">You have not dispatched any issues yet.</p>
                            </div>
                        ) : (
                            reports.map((report, idx) => (
                                <GlassCard 
                                    key={report.id} 
                                    className="border-white/10 bg-white/5 overflow-hidden transition-all hover:border-white/20"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div 
                                        className="p-5 flex items-center justify-between cursor-pointer group"
                                        onClick={() => handleToggleExpand(report.id)}
                                    >
                                        <div className="flex items-center gap-5 flex-1">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/40 shrink-0 border border-white/10 relative group-hover:border-[var(--accent)]/50 transition-colors">
                                                <img 
                                                    src={report.imageUrl.startsWith('http') ? report.imageUrl : import.meta.env.VITE_API_URL + report.imageUrl} 
                                                    alt="issue" 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/020812/00f5ff?text=IMG' }}
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                                                        report.status === 'PENDING' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 
                                                        report.status === 'APPROVED' ? 'text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10' : 
                                                        report.status === 'RESOLVED' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                                                        'text-white/40 border-white/10 bg-white/5'
                                                    }`}>
                                                        {report.status === 'PENDING' && <Clock size={10} />}
                                                        {report.status === 'APPROVED' && <CheckCircle size={10} />}
                                                        {report.status === 'RESOLVED' && <CheckCircle size={10} />}
                                                        {report.status}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-white/30 uppercase">
                                                        {new Date(report.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4 className="text-base font-bold truncate group-hover:text-white text-white/80 transition-colors">
                                                    {report.category || 'Uncategorized Infrastructure Issue'}
                                                </h4>
                                            </div>
                                            <div className="text-right px-6 hidden md:block border-l border-white/10 pl-6">
                                                <div className="text-[9px] uppercase font-black tracking-widest text-white/40 mb-1">AI Severity Assessment</div>
                                                <div className="text-xl font-black text-white flex items-center gap-1 justify-end">
                                                    {report.severity || '--'}<span className="text-[10px] text-white/30 uppercase tracking-widest">/10</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-white/30 group-hover:text-[var(--accent)] transition-colors pl-4">
                                            {expandedReportId === report.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                        </div>
                                    </div>
                                    
                                    {expandedReportId === report.id && (
                                        <div className="p-5 border-t border-white/5 bg-black/20 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] mb-2 flex items-center gap-2">
                                                    <AlertCircle size={12} /> User Context
                                                </div>
                                                <p className="text-xs text-white/70 italic leading-relaxed">
                                                    "{report.description || 'No additional context provided during dispatch.'}"
                                                </p>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] mb-2 flex items-center gap-2">
                                                    <MapPin size={12} /> Geolocation Data
                                                </div>
                                                <div className="bg-white/5 rounded-xl border border-white/10 p-3 flex flex-col gap-1">
                                                    <div className="flex justify-between items-center text-xs font-mono">
                                                        <span className="text-white/40">Latitude:</span>
                                                        <span className="text-white/80">{report.latitude.toFixed(6)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs font-mono">
                                                        <span className="text-white/40">Longitude:</span>
                                                        <span className="text-white/80">{report.longitude.toFixed(6)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {report.status === 'REJECTED' && report.rejectionReason && (
                                                <div className="md:col-span-2 mt-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                                    <div className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-2">Admin Rejection Note</div>
                                                    <p className="text-xs text-white/70">{report.rejectionReason}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </GlassCard>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportIssueForm;

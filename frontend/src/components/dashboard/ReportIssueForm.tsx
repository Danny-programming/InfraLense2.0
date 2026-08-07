import React, { useState } from 'react';
import { Camera, MapPin, UploadCloud, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import GlassCard from '../ui/GlassCard';

const ReportIssueForm: React.FC = () => {
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

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
                <div>
                    <h3 className="text-[10px] text-[var(--accent)] font-black uppercase tracking-[0.4em] mb-4">Citizen Incident Command</h3>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">Report <span className="text-[var(--accent)]">Issue</span></h2>
                </div>

                <GlassCard className="p-8 border-white/5 bg-white/5 relative overflow-hidden group">
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
                                <p className="text-[10px] font-mono text-white/30 mt-2 uppercase">Lat: {location.lat.toFixed(6)} | Lng: {location.lng.toFixed(6)}</p>
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
            </div>
        </div>
    );
};

export default ReportIssueForm;

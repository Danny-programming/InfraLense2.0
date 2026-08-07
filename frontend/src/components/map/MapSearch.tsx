import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { geocode } from '../../api/geo';
import { useMapStore } from '../../store/mapStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MapSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const setFocalLocation = useMapStore((state) => state.setFocalLocation);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ignoreNextQueryChange = useRef(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (ignoreNextQueryChange.current) {
        ignoreNextQueryChange.current = false;
        return;
      }
      if (query.length > 2) {
        setLoading(true);
        try {
          const map = (window as any).leafletMap;
          // @ts-ignore - geocode now accepts viewbox for biasing
          const results = await geocode(query, map ? `${map.getBounds().getWest()},${map.getBounds().getNorth()},${map.getBounds().getEast()},${map.getBounds().getSouth()}` : undefined);
          setSuggestions(results);
          setShowDropdown(true);
        } catch (error) {
          console.error('Geocoding error:', error);
        } finally {
          setLoading(false);
        }
      }
 else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (s: any) => {
    ignoreNextQueryChange.current = true;
    setQuery(s.display_name);
    setFocalLocation(s.lat, s.lon, s.boundingbox);
    toast.success(`Navigating to ${s.display_name.split(',')[0]}`, { id: 'search-nav' });
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else if (query.length > 2) {
        const loadingToast = toast.loading('Searching location...', { id: 'search-nav' });
        setLoading(true);
        try {
          const map = (window as any).leafletMap;
          const results = await geocode(query, map ? `${map.getBounds().getWest()},${map.getBounds().getNorth()},${map.getBounds().getEast()},${map.getBounds().getSouth()}` : undefined);
          if (results.length > 0) {
            handleSelect(results[0]);
          } else {
            toast.error('No results found for this query.', { id: 'search-nav' });
          }
        } catch (error) {
          toast.error('Search failed. Please try again.', { id: 'search-nav' });
          console.error('Immediate geocoding error:', error);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const triggerLocate = useMapStore(s => s.triggerLocate);

  const handleLocateMe = () => {
    toast.loading('Synchronizing GPS location...', { id: 'locate-me' });
    triggerLocate();
    setQuery('My Current Location');
    // Ensure the toast is dismissed after a timeout in case no location is found
    setTimeout(() => {
      toast.dismiss('locate-me');
    }, 10000);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={dropdownRef}>
      <div className="glass h-14 w-full flex items-center px-6 gap-5 pointer-events-auto border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-2xl rounded-2xl focus-within:border-[var(--accent)]/40 transition-all">
        {loading ? <Loader2 className="text-[var(--accent)] animate-spin" size={20} /> : <Search className="text-white/30" size={20} />}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 2 && setShowDropdown(true)}
          placeholder="Identify regional infrastructure gaps..."
          className="bg-transparent border-none outline-none flex-1 text-sm text-white placeholder-white/20 font-bold tracking-tight"
        />
        <button 
          onClick={handleLocateMe}
          className="p-2 hover:bg-white/10 rounded-xl transition-all text-[var(--accent)] group relative"
          title="Find my location"
        >
          <Navigation size={18} />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[9px] font-black uppercase tracking-widest rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Recenter on Me
          </span>
        </button>
      </div>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-3 p-2 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl z-[2000] max-h-[300px] overflow-y-auto custom-scrollbar pointer-events-auto"
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSelect(s)}
                className="w-full h-12 flex items-center gap-4 px-4 hover:bg-white/5 rounded-xl transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[var(--accent)] transition-colors">
                  <MapPin size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{s.display_name}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20">{s.category} // {s.type}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapSearch;

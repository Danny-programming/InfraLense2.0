import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMapStore } from '../../store/mapStore';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import HeatmapLayer from './HeatmapLayer';
import { renderToStaticMarkup } from 'react-dom/server';
import GlassCard from '../ui/GlassCard';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapController = () => {
  const map = useMap();
  const { 
    focalLocation, 
    focalBounds, 
    analyzeArea, 
    setPingLocation, 
    pingLocation,
    initialLoadComplete,
    compareMode,
    locateTrigger
  } = useMapStore();

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 400);
    return () => clearTimeout(timer);
  }, [map, compareMode]);

  useEffect(() => {
    if (!map) return;

    const handleLocationFound = (e: L.LocationEvent) => {
      const { lat, lng } = e.latlng;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      
      console.log('[MapController] GPS established:', lat, lng);
      toast.dismiss('locate-me');
      
      const zoom = hasLoadedRef.current ? map.getZoom() : 15;
      hasLoadedRef.current = true;
      
      map.flyTo([lat, lng], zoom, { animate: true, duration: 2 });
      analyzeArea(lat, lng, 'primary');
      setPingLocation(lat, lng);
    };

    const handleLocationError = (e: L.ErrorEvent) => {
      console.warn('[MapController] GPS failure:', e.message);
      toast.dismiss('locate-me');
      if (locateTrigger > 0) {
        toast.error('Neural link failed. Check permissions.');
      }
    };

    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);
    return () => {
      map.off('locationfound', handleLocationFound);
      map.off('locationerror', handleLocationError);
    };
  }, [map, analyzeArea, setPingLocation, locateTrigger]);

  useEffect(() => {
    if (locateTrigger > 0) {
      map.locate({ setView: false, enableHighAccuracy: true });
    }
  }, [map, locateTrigger]);

  useEffect(() => {
    if (!map) return;
    if (focalBounds) {
      map.fitBounds(focalBounds, { animate: true, duration: 1.5 });
      if (focalLocation) {
        analyzeArea(focalLocation.lat, focalLocation.lng, 'primary');
        setPingLocation(focalLocation.lat, focalLocation.lng);
      }
      hasLoadedRef.current = true;
    } else if (focalLocation) {
      const { lat, lng } = focalLocation;
      if (typeof lat === 'number' && typeof lng === 'number') {
        map.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
        analyzeArea(lat, lng, 'primary');
        setPingLocation(lat, lng);
        hasLoadedRef.current = true;
      }
    }
  }, [map, focalLocation, focalBounds, analyzeArea, setPingLocation]);

  useEffect(() => {
    if (initialLoadComplete) return;
    const initTimer = setTimeout(() => {
      if (!hasLoadedRef.current) {
        map.locate({ setView: false, enableHighAccuracy: true });
      }
    }, 1500);
    return () => clearTimeout(initTimer);
  }, [map, initialLoadComplete]);

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setPingLocation(lat, lng);
      analyzeArea(lat, lng, 'primary');
      map.flyTo([lat, lng], map.getZoom(), { animate: true });
    };
    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [map, setPingLocation, analyzeArea]);

  return null;
};

const InfraMap = () => {
  const { tileMode, pingLocation, activeFilters, heatmap, primaryAnalysis } = useMapStore();

  const getTileUrl = () => {
    switch (tileMode) {
      case 'satellite': return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'street': return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'terrain': return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default: return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
  };

  const getPingIcon = () => {
    const markup = renderToStaticMarkup(
      <div className="relative">
        <div className="absolute -inset-6 bg-[var(--accent)]/10 rounded-full animate-ping" />
        <div className="absolute -inset-4 bg-[var(--accent)]/20 rounded-full animate-pulse" />
        <div className="relative w-10 h-10 bg-[#02080a] border-2 border-[var(--accent)] rounded-full flex items-center justify-center shadow-[0_0_30px_var(--accent)]">
          <MapPin size={20} className="text-[var(--accent)]" />
        </div>
      </div>
    );
    return L.divIcon({
      html: markup,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  const getInfraIcon = (type: string) => {
    const colors: Record<string, string> = {
      hospital: '#ff4757',
      school: '#2ed573',
      bank: '#eccc68'
    };
    const emoji = type === 'hospital' ? '🏥' : type === 'school' ? '🏫' : '🏦';
    const color = colors[type] || '#00f5ff';

    const markup = renderToStaticMarkup(
      <div className="group relative">
        <div className="absolute -inset-2 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div 
          className="relative w-12 h-12 bg-black/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-2xl transition-all duration-300 border border-white/10 group-hover:scale-125 group-hover:border-[var(--accent)]/50"
          style={{ boxShadow: `0 0 20px ${color}20` }}
        >
          {emoji}
        </div>
      </div>
    );

    return L.divIcon({
      html: markup,
      className: '',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });
  };

  const isValidPos = (pos: any): pos is [number, number] => {
    return Array.isArray(pos) && typeof pos[0] === 'number' && typeof pos[1] === 'number' && !isNaN(pos[0]) && !isNaN(pos[1]);
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[19.0760, 72.8777]}
        zoom={12}
        className="h-full w-full grayscale-0"
        zoomControl={false}
      >
        <TileLayer
          url={getTileUrl()}
          attribution='&copy; OpenStreetMap'
        />

        <MapController />

        {heatmap.enabled && primaryAnalysis.data && (
          <HeatmapLayer
            points={primaryAnalysis.data.infraElements
              .filter((el: any) => typeof el.lat === 'number' && typeof el.lon === 'number')
              .map((el: any) => [el.lat, el.lon, 1])}
            intensity={heatmap.intensity}
          />
        )}

        {primaryAnalysis.data && (
          <MarkerClusterGroup 
            chunkedLoading 
            maxClusterRadius={40} 
            showCoverageOnHover={true}
            spiderfyOnMaxZoom={true}
          >
            {primaryAnalysis.data.infraElements.map((el: any, i: number) => {
              const amenity = el.tags?.amenity;
              const isVisible = 
                (['school', 'college', 'university'].includes(amenity) && activeFilters.schools) ||
                (['hospital', 'clinic', 'doctors'].includes(amenity) && activeFilters.hospitals) ||
                (['bank', 'atm'].includes(amenity) && activeFilters.banks);

              if (!isVisible) return null;
              
              // Map sub-types back to main categories for icon lookups
              const mainType = ['school', 'college', 'university'].includes(amenity) ? 'school' :
                               ['hospital', 'clinic', 'doctors'].includes(amenity) ? 'hospital' : 'bank';
              const pos: [number, number] = [el.lat, el.lon];
              if (!isValidPos(pos)) return null;

              return (
                <Marker key={i} position={pos} icon={getInfraIcon(mainType)}>
                  <Popup className="premium-popup">
                    <div className="p-3 min-w-[140px] space-y-2">
                      <div className="text-[9px] font-black uppercase tracking-widest text-white/40">{amenity}</div>
                      <div className="text-sm font-black italic uppercase text-white leading-tight">
                        {el.tags?.name || 'Neural Node'}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}

        {pingLocation && isValidPos([pingLocation.lat, pingLocation.lng]) && (
          <Marker position={[pingLocation.lat, pingLocation.lng]} icon={getPingIcon()} />
        )}
      </MapContainer>

      {/* Premium Orbital Intelligence Key */}
      <div className="absolute bottom-10 left-10 z-[1001] pointer-events-none animate-in fade-in slide-in-from-left-5 duration-1000">
        <div className="relative group">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-2 bg-[var(--accent)]/5 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <GlassCard className="p-4 border-white/10 bg-black/60 backdrop-blur-3xl rounded-[2rem] flex items-center gap-6 shadow-[0_32px_96px_-12px_rgba(0,0,0,0.8)] border-b-2 border-r-2 border-[var(--accent)]/10">
            {/* Status Indicator */}
            <div className="flex flex-col gap-1 pr-6 border-r border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Grid Key</span>
              </div>
              <span className="text-[7px] font-bold uppercase tracking-widest text-white/20">Orbital Deck L-14</span>
            </div>

            {/* Symbols */}
            <div className="flex items-center gap-8">
              {[
                { emoji: '🏫', label: 'Education', color: '#2ed573' },
                { emoji: '🏥', label: 'Medical', color: '#ff4757' },
                { emoji: '🏦', label: 'Financial', color: '#eccc68' }
              ].map((item) => (
                <div key={item.label} className="group/item flex flex-col items-center gap-2 relative">
                  <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover/item:scale-125 transition-transform duration-500">{item.emoji}</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/70">{item.label}</span>
                    <div className="w-1 h-0.5 mt-1 bg-white/10 rounded-full group-hover/item:w-full group-hover/item:bg-[var(--accent)] transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default InfraMap;

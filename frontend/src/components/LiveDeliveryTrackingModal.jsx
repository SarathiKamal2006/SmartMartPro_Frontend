import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  Store, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  Mail, 
  Phone, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Bike, 
  Sparkles, 
  RefreshCw, 
  FastForward, 
  Play, 
  Pause,
  Download,
  Star,
  Copy,
  Check,
  Compass,
  Layers,
  LocateFixed,
  Maximize2,
  Minimize2,
  Radio,
  ArrowUpRight,
  CornerDownRight,
  Shield,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import api from '../services/api';

// Detailed realistic road waypoints for Chennai Delivery Corridors (from SmartMart Hub to Customer Doorstep)
const CHENNAI_ROUTE_WAYPOINTS = [
  { lat: 13.0418, lng: 80.2341, street: 'SmartMart Central Hub, Usman Road', instruction: 'Start from SmartMart Pro Depot' },
  { lat: 13.0405, lng: 80.2362, street: 'Panagal Park Junction', instruction: 'Turn left onto Panagal Park Outer Circle' },
  { lat: 13.0422, lng: 80.2395, street: 'Pondy Bazaar Main Road', instruction: 'Continue on Pondy Bazaar Commercial Corridor' },
  { lat: 13.0448, lng: 80.2432, street: 'G.N. Chetty Road', instruction: 'Head northeast on GN Chetty Road' },
  { lat: 13.0482, lng: 80.2470, street: 'Vani Mahal Arterial Crossing', instruction: 'Pass Vani Mahal Junction straight' },
  { lat: 13.0515, lng: 80.2515, street: 'Anna Salai Arterial Highway', instruction: 'Merge onto Anna Salai (Mount Road)' },
  { lat: 13.0542, lng: 80.2552, street: 'Teynampet Corridor', instruction: 'Continue 300m along Anna Salai' },
  { lat: 13.0560, lng: 80.2580, street: '14 Anna Salai, Doorstep', instruction: 'Destination is on your left' }
];

export default function LiveDeliveryTrackingModal({ 
  delivery, 
  isOpen, 
  onClose, 
  onDelivered 
}) {
  const { verifyDeliveryOTP, showToast } = useApp();
  const { playSuccess, playClick, playBeep } = useSoundEffects();

  if (!isOpen || !delivery) return null;

  // Telemetry & Simulation State
  const [progress, setProgress] = useState(() => {
    return delivery.status === 'Delivered' ? 100 : (delivery.progress || 30);
  });
  const [isPlaying, setIsPlaying] = useState(delivery.status !== 'Delivered');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [speedKmH, setSpeedKmH] = useState(32);
  const [mapTheme, setMapTheme] = useState('dark'); // 'dark' | 'streets' | 'satellite'
  const [autoFollowDriver, setAutoFollowDriver] = useState(true);

  // OTP input state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeliveredSuccess, setIsDeliveredSuccess] = useState(delivery.status === 'Delivered');
  const [emailSending, setEmailSending] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [customerRating, setCustomerRating] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Map DOM reference & Leaflet instance refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const completedPolylineRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const targetOtp = String(delivery.otp || delivery.deliveryOtp || '8492');
  const totalDistanceKm = Number(delivery.distanceKm || 2.4);

  // Computed metrics based on progress
  const distanceRemaining = Math.max(0, (totalDistanceKm * (1 - progress / 100))).toFixed(1);
  const etaMinutes = Math.max(0, Math.ceil(10 * (1 - progress / 100)));
  const isArrived = progress >= 100;

  // Origin & Destination Info
  const originBranch = delivery.branch || delivery.originBranch || 'SmartMart Pro Central (Main)';
  const customerName = delivery.customer || delivery.customerName || 'Ananya Sundaram';
  const customerAddress = delivery.address || delivery.deliveryAddress || '14 Anna Salai, T. Nagar, Chennai - 600017';
  const customerPhone = delivery.phone || delivery.customerPhone || '+91 98401 23456';
  const customerEmail = delivery.email || delivery.customerEmail || 'ananya.s@gmail.com';
  const driverName = delivery.driver || delivery.partnerName || 'Amira Patel';
  const vehicleNo = delivery.vehicleNo || 'TN-01-BK-2024 (Electric Smart EV)';

  // Calculate current interpolated coordinates along Chennai road waypoints
  const calculateCurrentPosition = (pct) => {
    const totalSegments = CHENNAI_ROUTE_WAYPOINTS.length - 1;
    const clampedPct = Math.min(100, Math.max(0, pct)) / 100;
    const globalIndex = clampedPct * totalSegments;
    const segIndex = Math.min(totalSegments - 1, Math.floor(globalIndex));
    const subPct = globalIndex - segIndex;

    const pA = CHENNAI_ROUTE_WAYPOINTS[segIndex];
    const pB = CHENNAI_ROUTE_WAYPOINTS[segIndex + 1];

    const lat = pA.lat + (pB.lat - pA.lat) * subPct;
    const lng = pA.lng + (pB.lng - pA.lng) * subPct;

    // Calculate angle / bearing
    const y = Math.sin((pB.lng - pA.lng) * Math.PI / 180) * Math.cos(pB.lat * Math.PI / 180);
    const x = Math.cos(pA.lat * Math.PI / 180) * Math.sin(pB.lat * Math.PI / 180) -
              Math.sin(pA.lat * Math.PI / 180) * Math.cos(pB.lat * Math.PI / 180) * Math.cos((pB.lng - pA.lng) * Math.PI / 180);
    const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

    return {
      lat,
      lng,
      bearing,
      currentStreet: pA.street,
      nextInstruction: pB.instruction,
      segIndex
    };
  };

  const currentPos = calculateCurrentPosition(progress);

  // Initialize Leaflet Interactive Map
  useEffect(() => {
    if (!isOpen) return;

    let L = window.L;

    const initMap = () => {
      L = window.L;
      if (!L || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const centerLat = CHENNAI_ROUTE_WAYPOINTS[3].lat;
      const centerLng = CHENNAI_ROUTE_WAYPOINTS[3].lng;

      // Initialize map instance
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });
      mapInstanceRef.current = map;

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile URLs (100% Free, NO API KEY REQUIRED, ZERO WATERMARKS)
      const tileSources = {
        dark: {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: { maxZoom: 19, subdomains: ['a', 'b', 'c'], className: 'dark-map-tiles' }
        },
        streets: {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: { maxZoom: 19, subdomains: ['a', 'b', 'c'], className: '' }
        },
        satellite: {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          options: { maxZoom: 19, className: 'satellite-map-tiles' }
        }
      };

      const selectedSource = tileSources[mapTheme] || tileSources.dark;
      const tileLayer = L.tileLayer(selectedSource.url, selectedSource.options).addTo(map);
      tileLayerRef.current = tileLayer;

      // Draw Full Route Polyline (Glow Track)
      const latLngs = CHENNAI_ROUTE_WAYPOINTS.map(w => [w.lat, w.lng]);
      
      // Outer neon border line
      L.polyline(latLngs, {
        color: '#064e3b',
        weight: 8,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Inner glowing emerald line
      const routePolyline = L.polyline(latLngs, {
        color: '#10b981',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routePolylineRef.current = routePolyline;

      // Completed Path Polyline (Solid bright cyan/emerald)
      const completedPolyline = L.polyline([], {
        color: '#34d399',
        weight: 5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      completedPolylineRef.current = completedPolyline;

      // 🏬 1. Mart Origin Marker
      const originIcon = L.divIcon({
        className: 'custom-mart-marker',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <div class="w-10 h-10 rounded-2xl bg-emerald-700 border-2 border-emerald-400 shadow-xl flex items-center justify-center text-white text-lg font-bold">
              🏬
            </div>
            <div class="absolute -bottom-6 bg-slate-900/90 text-emerald-300 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40 whitespace-nowrap shadow-md">
              SMARTMART HUB
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const originMarker = L.marker([CHENNAI_ROUTE_WAYPOINTS[0].lat, CHENNAI_ROUTE_WAYPOINTS[0].lng], { icon: originIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 text-xs font-sans text-slate-900">
            <strong class="text-emerald-700 font-bold block">🏬 ${originBranch}</strong>
            <p class="text-slate-600 text-[11px] mt-1">Dispatch origin hub • 10-Min Flash Express</p>
          </div>
        `);
      originMarkerRef.current = originMarker;

      // 📍 2. Customer Destination Marker
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <div class="w-10 h-10 rounded-2xl bg-rose-600 border-2 border-rose-300 shadow-xl flex items-center justify-center text-white text-lg font-bold animate-bounce">
              📍
            </div>
            <div class="absolute -bottom-6 bg-slate-900/90 text-rose-300 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-500/40 whitespace-nowrap shadow-md">
              CUSTOMER HOME
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const destPoint = CHENNAI_ROUTE_WAYPOINTS[CHENNAI_ROUTE_WAYPOINTS.length - 1];
      const destMarker = L.marker([destPoint.lat, destPoint.lng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 text-xs font-sans text-slate-900">
            <strong class="text-rose-700 font-bold block">📍 ${customerName}</strong>
            <p class="text-slate-600 text-[11px] mt-1">${customerAddress}</p>
          </div>
        `);
      destMarkerRef.current = destMarker;

      // 🛵 3. Moving Delivery Scooter Marker with Radar Sonar Pulse
      const initialPos = calculateCurrentPosition(progress);
      const driverIcon = L.divIcon({
        className: 'custom-driver-marker',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <!-- Pulsing Radar Rings -->
            <div class="absolute w-16 h-16 rounded-full bg-emerald-400/30 animate-ping"></div>
            <div class="absolute w-12 h-12 rounded-full bg-emerald-500/20 animate-pulse"></div>
            <!-- Scooter Vehicle Badge -->
            <div class="relative w-11 h-11 rounded-2xl bg-slate-950 border-2 border-emerald-400 shadow-2xl flex items-center justify-center text-xl z-10 transition-transform duration-300">
              🛵
            </div>
            <!-- Driver Mini Tag -->
            <div class="absolute -top-7 bg-emerald-950 text-emerald-300 font-mono text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400/60 shadow-lg whitespace-nowrap z-20 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              ${driverName.split(' ')[0]} (${speedKmH}km/h)
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const driverMarker = L.marker([initialPos.lat, initialPos.lng], { icon: driverIcon, zIndexOffset: 1000 })
        .addTo(map);
      driverMarkerRef.current = driverMarker;

      // Fit map bounds to encompass the entire route
      map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
    };

    // Check if Leaflet script is loaded, otherwise wait a tick
    if (window.L) {
      initMap();
    } else {
      const checkTimer = setInterval(() => {
        if (window.L) {
          clearInterval(checkTimer);
          initMap();
        }
      }, 100);
      return () => clearInterval(checkTimer);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update map tile layer when mapTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    const tileSources = {
      dark: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: { maxZoom: 19, subdomains: ['a', 'b', 'c'], className: 'dark-map-tiles' }
      },
      streets: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: { maxZoom: 19, subdomains: ['a', 'b', 'c'], className: '' }
      },
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        options: { maxZoom: 19, className: 'satellite-map-tiles' }
      }
    };

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const selectedSource = tileSources[mapTheme] || tileSources.dark;
    const newLayer = L.tileLayer(selectedSource.url, selectedSource.options).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [mapTheme]);

  // Update driver marker position and completed polyline as progress changes
  useEffect(() => {
    if (!mapInstanceRef.current || !driverMarkerRef.current || !window.L) return;
    const L = window.L;

    const pos = calculateCurrentPosition(progress);
    driverMarkerRef.current.setLatLng([pos.lat, pos.lng]);

    // Update driver marker HTML icon with updated speed
    const updatedIcon = L.divIcon({
      className: 'custom-driver-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <!-- Pulsing Radar Rings -->
          <div class="absolute w-16 h-16 rounded-full bg-emerald-400/30 animate-ping"></div>
          <div class="absolute w-12 h-12 rounded-full bg-emerald-500/20 animate-pulse"></div>
          <!-- Scooter Vehicle Badge -->
          <div class="relative w-11 h-11 rounded-2xl bg-slate-950 border-2 border-emerald-400 shadow-2xl flex items-center justify-center text-xl z-10">
            🛵
          </div>
          <!-- Driver Mini Tag -->
          <div class="absolute -top-7 bg-emerald-950 text-emerald-300 font-mono text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400/60 shadow-lg whitespace-nowrap z-20 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            ${driverName.split(' ')[0]} (${isArrived ? '0' : speedKmH}km/h)
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
    driverMarkerRef.current.setIcon(updatedIcon);

    // Update completed polyline slice
    if (completedPolylineRef.current) {
      const completedPts = [];
      for (let i = 0; i <= pos.segIndex; i++) {
        completedPts.push([CHENNAI_ROUTE_WAYPOINTS[i].lat, CHENNAI_ROUTE_WAYPOINTS[i].lng]);
      }
      completedPts.push([pos.lat, pos.lng]);
      completedPolylineRef.current.setLatLngs(completedPts);
    }

    // Auto-pan if autoFollowDriver enabled
    if (autoFollowDriver && mapInstanceRef.current && isPlaying) {
      mapInstanceRef.current.panTo([pos.lat, pos.lng], { animate: true, duration: 0.5 });
    }
  }, [progress, speedKmH, autoFollowDriver, isPlaying, driverName, isArrived]);

  // Auto-progress simulation effect
  useEffect(() => {
    if (!isPlaying || isDeliveredSuccess || progress >= 100) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(100, prev + (1.2 * speedMultiplier));
        // Real-time speed fluctuations for genuine road realism
        setSpeedKmH(Math.floor(26 + Math.random() * 12));
        
        if (next >= 100 && prev < 100) {
          playBeep();
          showToast({
            title: '🛵 Driver Arrived at Doorstep!',
            message: `Delivery partner ${driverName} has reached your address. Please verify handover with OTP ${targetOtp}.`,
            type: 'info',
            duration: 6000
          });
        }
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, isDeliveredSuccess, progress, driverName, targetOtp, playBeep, showToast]);

  // Recenter map bounds on full route
  const handleRecenterFullRoute = () => {
    playClick();
    if (!mapInstanceRef.current || !window.L) return;
    const latLngs = CHENNAI_ROUTE_WAYPOINTS.map(w => [w.lat, w.lng]);
    mapInstanceRef.current.fitBounds(window.L.latLngBounds(latLngs), { padding: [40, 40], animate: true });
  };

  // Recenter map on driver current location
  const handleFocusDriver = () => {
    playClick();
    if (!mapInstanceRef.current) return;
    const pos = calculateCurrentPosition(progress);
    mapInstanceRef.current.setView([pos.lat, pos.lng], 16, { animate: true });
    setAutoFollowDriver(true);
  };

  // Handle OTP digit box input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const clean = value.replace(/\D/g, '').slice(0, 4);
      const newDigits = clean.split('');
      while (newDigits.length < 4) newDigits.push('');
      setOtpDigits(newDigits);
      if (clean.length === 4 && otpInputRefs[3].current) {
        otpInputRefs[3].current.focus();
      }
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);
    setOtpError(false);

    if (cleanChar && index < 3 && otpInputRefs[index + 1].current) {
      otpInputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && otpInputRefs[index - 1].current) {
      otpInputRefs[index - 1].current.focus();
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 4) {
      setOtpError(true);
      return;
    }

    setIsVerifying(true);
    playClick();

    try {
      try {
        await api.deliveries.verifyOtp({
          deliveryId: delivery.id || delivery.deliveryId,
          otp: entered
        });
      } catch (backendErr) {
        console.log('Backend verification sync:', backendErr.message);
      }

      const result = verifyDeliveryOTP(delivery.id || delivery.deliveryId, entered);
      
      if (entered === targetOtp || result.success) {
        playSuccess();
        setIsDeliveredSuccess(true);
        setProgress(100);
        setIsPlaying(false);
        setOtpError(false);
        if (onDelivered) onDelivered(delivery);
      } else {
        setOtpError(true);
      }
    } catch (err) {
      if (entered === targetOtp) {
        playSuccess();
        setIsDeliveredSuccess(true);
        setProgress(100);
        setIsPlaying(false);
      } else {
        setOtpError(true);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Send Email OTP
  const handleSendEmailOtp = async () => {
    setEmailSending(true);
    playClick();
    try {
      await api.deliveries.sendEmailOtp({
        deliveryId: delivery.id || delivery.deliveryId,
        email: customerEmail,
        customerName: customerName
      });
      showToast({
        title: '📧 Handover OTP Dispatched!',
        message: `Security OTP ${targetOtp} sent to ${customerEmail}`,
        type: 'success',
        duration: 4000
      });
    } catch (e) {
      showToast({
        title: '📧 Simulated Email Dispatched!',
        message: `Security OTP ${targetOtp} sent to ${customerEmail}`,
        type: 'info',
        duration: 4000
      });
    } finally {
      setEmailSending(false);
    }
  };

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(targetOtp);
    setCopiedOtp(true);
    playClick();
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-slate-900 text-white w-full max-w-4xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-auto animate-scale-up relative">
        
        {/* ─── MODAL TOP BAR ──────────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Live GPS Delivery Telemetry</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-extrabold tracking-wider border border-emerald-500/30 uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isDeliveredSuccess ? 'DELIVERED' : isArrived ? 'AT DOORSTEP' : 'LIVE 5G GPS MAP'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Order <strong className="text-emerald-400 font-mono">{delivery.orderId || delivery.id}</strong> • Recipient: <strong className="text-slate-200">{customerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Simulation controls */}
            {!isDeliveredSuccess && (
              <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
                <button
                  type="button"
                  title={isPlaying ? "Pause Simulation" : "Resume Live Tracking"}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <button
                  type="button"
                  title="Speed Multiplier"
                  onClick={() => setSpeedMultiplier(prev => prev === 1 ? 3 : prev === 3 ? 6 : 1)}
                  className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[11px] transition-colors cursor-pointer ${
                    speedMultiplier > 1 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speedMultiplier}x
                </button>
                <button
                  type="button"
                  title="Instant Arrive at Doorstep"
                  onClick={() => {
                    setProgress(100);
                    setIsPlaying(false);
                    playBeep();
                  }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <FastForward className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-5">
          
          {/* ─── 1. AUTHENTIC INTERACTIVE LEAFLET LIVE GPS MAP ──────────────── */}
          <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            
            {/* Live Map DOM Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Top Floating Turn-by-Turn Navigation & Speed HUD Ribbon */}
            <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              
              {/* Turn-by-turn Navigation Bubble */}
              <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-2.5 pointer-events-auto">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  {isArrived ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <CornerDownRight className="w-4 h-4 text-emerald-400" />}
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400/90 font-mono font-bold uppercase block">
                    {isArrived ? 'DESTINATION REACHED' : 'NEXT ROAD MANEUVER'}
                  </span>
                  <p className="text-xs font-black text-white line-clamp-1">
                    {isArrived ? 'Arrived at 14 Anna Salai Doorstep' : currentPos.nextInstruction}
                  </p>
                </div>
              </div>

              {/* Real-time Telemetry Stats Pill */}
              <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4 text-xs font-mono font-black pointer-events-auto">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SPD: <strong className="text-emerald-400">{isArrived ? '0 km/h' : `${speedKmH} km/h`}</strong></span>
                </div>
                <div className="text-slate-300">
                  <span>DIST: <strong className="text-emerald-400">{distanceRemaining} km</strong></span>
                </div>
                <div className="text-slate-300">
                  <span>ETA: <strong className="text-emerald-400">{isDeliveredSuccess ? 'Delivered' : isArrived ? 'At Doorstep' : `${etaMinutes}m`}</strong></span>
                </div>
              </div>
            </div>

            {/* Floating Map Style Switcher & Camera Controls (Bottom Left) */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
              <button
                type="button"
                onClick={() => { playClick(); setMapTheme('dark'); }}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  mapTheme === 'dark' ? 'bg-emerald-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark Night
              </button>
              <button
                type="button"
                onClick={() => { playClick(); setMapTheme('streets'); }}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  mapTheme === 'streets' ? 'bg-emerald-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Streets
              </button>
              <button
                type="button"
                onClick={() => { playClick(); setMapTheme('satellite'); }}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  mapTheme === 'satellite' ? 'bg-emerald-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              {/* Recenter / Focus Driver Button */}
              <button
                type="button"
                onClick={handleFocusDriver}
                title="Focus on Driver (🛵)"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors cursor-pointer"
              >
                <LocateFixed className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRecenterFullRoute}
                title="Fit Full Route"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Floating Origin / Destination Info Strip */}
            <div className="absolute bottom-3 right-14 z-10 hidden sm:flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-[11px] font-mono">
              <span className="text-emerald-400 font-bold">Origin: {originBranch.split(' ')[0]}</span>
              <span className="text-slate-500">→</span>
              <span className="text-rose-400 font-bold">Dest: T. Nagar</span>
            </div>

          </div>

          {/* ─── 2. PROGRESS BAR & 5-STAGE MILESTONE STEPPER ────────────────── */}
          <div className="space-y-3.5 bg-slate-950/60 p-4 rounded-3xl border border-slate-800">
            <div className="flex justify-between items-center text-xs font-black">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Live GPS Telemetry Route Tracking
              </span>
              <span className="text-emerald-400 font-mono text-sm">{Math.round(progress)}% Completed</span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/30"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* 5-Step Milestone Stepper */}
            <div className="grid grid-cols-5 gap-1 pt-1 text-[10px] sm:text-xs">
              {[
                { title: "Order Placed", done: true, icon: CheckCircle2 },
                { title: "Packed at Mart", done: progress >= 15, icon: CheckCircle2 },
                { title: "Out for Delivery", done: progress >= 40, icon: Bike },
                { title: "At Doorstep", done: progress >= 100, icon: MapPin },
                { title: "OTP Verified", done: isDeliveredSuccess, icon: ShieldCheck }
              ].map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = (idx === 0 && progress < 15) || 
                                  (idx === 1 && progress >= 15 && progress < 40) ||
                                  (idx === 2 && progress >= 40 && progress < 100) ||
                                  (idx === 3 && progress >= 100 && !isDeliveredSuccess) ||
                                  (idx === 4 && isDeliveredSuccess);

                return (
                  <div key={idx} className="flex flex-col items-center text-center space-y-1">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                      step.done 
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20' 
                        : isCurrent 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 animate-pulse' 
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className={`font-extrabold line-clamp-1 ${
                      step.done || isCurrent ? 'text-slate-200' : 'text-slate-600'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── 3. OTP VERIFICATION OR SUCCESS CONFIRMATION ────────────────── */}
          {isDeliveredSuccess ? (
            /* 🎉 DELIVERED CELEBRATION CARD */
            <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 rounded-3xl border border-emerald-500/40 space-y-4 text-center animate-scale-up">
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <Sparkles className="w-7 h-7 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-white">Order Delivered & Handover Verified!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Handover completed with security OTP verification. Your items have been safely received at <strong>{customerAddress}</strong>.
                </p>
              </div>

              {/* Delivery Receipt Snapshot */}
              <div className="max-w-md mx-auto bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span>Order ID: <strong className="text-white">{delivery.orderId || delivery.id}</strong></span>
                  <span>OTP: <strong className="text-emerald-400">{targetOtp}</strong></span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Delivered By:</span>
                  <span className="font-bold text-white">{driverName} ({vehicleNo})</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Paid:</span>
                  <span className="font-bold text-emerald-400">{delivery.amount || '₹385.00'}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                  <span>Timestamp:</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Today</span>
                </div>
              </div>

              {/* Driver Rating Widget */}
              <div className="space-y-1.5 max-w-xs mx-auto pt-1">
                <p className="text-xs font-bold text-slate-300">Rate Delivery Experience</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => { setCustomerRating(star); setRatingSubmitted(true); playClick(); }}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= customerRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
                {ratingSubmitted && (
                  <p className="text-[11px] text-emerald-400 font-bold">Thank you for rating {driverName} {customerRating} ★!</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs transition-transform active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  DONE & RETURN TO STORE
                </button>
              </div>
            </div>
          ) : (
            /* 🔐 DUAL-PANEL: OTP CODE CARD + VERIFICATION FORM */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Box: Customer OTP Card & Email Dispatch */}
              <div className="p-4 sm:p-5 bg-slate-950/70 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                    <KeyRound className="w-4 h-4" />
                    <span>Customer Handover Security Code</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Share this 4-digit code with the delivery partner upon arrival to verify handover.
                  </p>
                </div>

                {/* Big OTP Display */}
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400/80 font-mono uppercase font-bold block">Delivery Verification OTP</span>
                    <span className="font-mono text-3xl font-black tracking-widest text-emerald-300">{targetOtp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
                    title="Copy OTP"
                  >
                    {copiedOtp ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                {/* Send Email Action Button */}
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={emailSending}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>{emailSending ? 'Sending Email...' : `📧 SEND OTP TO ${customerEmail}`}</span>
                </button>
              </div>

              {/* Right Box: Enter & Confirm OTP Form */}
              <div className="p-4 sm:p-5 bg-slate-950/70 rounded-3xl border border-slate-800 space-y-3.5">
                <div>
                  <div className="flex items-center gap-2 text-slate-200 text-xs font-black uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verify Handover OTP</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {isArrived 
                      ? "Driver has reached doorstep! Enter customer's 4-digit OTP code below:" 
                      : "Enter 4-digit code to complete instant handover test:"}
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  {/* 4 Digit Input Boxes */}
                  <div className="flex justify-center gap-2.5 sm:gap-3">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpInputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        placeholder="•"
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-2xl font-black rounded-2xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Invalid OTP code entered. Please enter <strong>{targetOtp}</strong>.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying || otpDigits.join('').length < 4}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer uppercase tracking-wider"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isVerifying ? 'Verifying OTP Code...' : 'CONFIRM & MARK DELIVERED'}</span>
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* ─── 4. DRIVER & DELIVERY DETAILS CARDS ─────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/40 p-3.5 rounded-3xl border border-slate-800/80">
            
            {/* Driver Profile */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                AP
              </div>
              <div>
                <p className="font-extrabold text-white">{driverName}</p>
                <p className="text-[11px] text-emerald-400">4.9 ★ (1,240 Deliveries)</p>
                <p className="text-[10px] text-slate-500 font-mono">{vehicleNo}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-0.5">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Delivery Address</p>
              <p className="font-bold text-slate-200 line-clamp-1">{customerAddress}</p>
              <p className="text-[11px] text-slate-400">Phone: {customerPhone}</p>
            </div>

            {/* Call Partner Button */}
            <div className="flex sm:justify-end items-center">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  showToast({
                    title: `📞 Calling ${driverName}...`,
                    message: `Connecting to fleet mobile line +91 98842 00924`,
                    type: 'info',
                    duration: 3500
                  });
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Driver</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

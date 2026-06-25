import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../assets/images/greycats-black-logo.png';
import { isAuthenticated, StorageKey } from '@/utils/storage';
import { 
  Target, TrendingUp, Database, MousePointerClick, 
  PieChart, Send, Lock, ShieldCheck, BarChart2, 
  MessageCircle, Menu, X, ArrowRight, Search 
} from 'lucide-react';
import Footer from '@/components/Footer';

// --- Shared Components ---

const Button = ({ children, onClick, className = "", variant = "primary" }: { children: React.ReactNode, onClick?: React.MouseEventHandler<HTMLButtonElement>, className?: string, variant?: "primary" | "secondary" | "ghost" }) => {
  const base = "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 cursor-pointer";
  const variants = {
    primary: "bg-[#111] text-white hover:bg-[#333]",
    secondary: "bg-white text-[#111] border border-[#e5e5e5] hover:border-[#111]",
    ghost: "text-[#666] hover:text-[#111] hover:bg-gray-100"
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const FloatingCard = ({ children, className, index }: { children: React.ReactNode, className?: string, index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: "transform 0.1s ease-out"
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s ease-out"
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, animationDelay: `${index * 1.5}s` }}
      className={`animate-float-card paused-on-hover ${className}`}
    >
      {children}
    </div>
  );
};

const AnimatedText = ({ children, progress, order, total }: { children: React.ReactNode, progress: any, order: number, total: number }) => {
  const step = 0.5 / total;
  const start = 0.1 + order * step;
  const end = start + step * 2;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [20, 0]);

  return (
    <motion.span style={{ opacity, y }} className="inline-block">
      {children}
    </motion.span>
  );
};

const BackgroundDashLine = () => (
  <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <mask id="dash-mask">
        <motion.path 
          d="M 5 85 Q 50 85 95 0" fill="none" stroke="white" strokeWidth="3" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeIn" }}
        />
      </mask>
    </defs>
    <motion.path 
      d="M 5 85 Q 50 85 95 0" fill="none" stroke="#111" strokeWidth="1.5" strokeDasharray="1 1.5" vectorEffect="non-scaling-stroke"
      mask="url(#dash-mask)" initial={{ opacity: 0.2 }} animate={{ opacity: 0 }} transition={{ delay: 1.2, duration: 3, ease: "easeOut" }}
    />
  </svg>
);

// --- Graphics & Mockups Data ---

const integrationList = [
  {
    name: "Google Analytics", category: "Analytics", color: "#F9AB00", desc: "Track website traffic and user behavior effortlessly in one unified dashboard.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-[85%] h-[60%] rounded-xl backdrop-blur-sm border shadow-lg overflow-hidden flex flex-col group-hover:-translate-y-2 transition-transform duration-500" style={{ borderColor: `${h}30`, backgroundColor: `${h}0A` }}>
          <div className="h-6 w-full border-b flex items-center px-3 gap-1.5" style={{ borderColor: `${h}20` }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" /><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /><div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 relative flex items-end p-2 gap-1.5">
            {[30, 45, 25, 60, 40, 75, 50, 90].map((x, y) => (
              <div key={y} className="flex-1 rounded-sm relative group-hover:scale-y-110 origin-bottom transition-transform duration-500" style={{ height: `${x}%`, backgroundColor: `${h}40`, transitionDelay: `${y * 50}ms` }}>
                {y === 7 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: h, color: h }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-2 top-4 px-2 py-1 rounded-md shadow-xl border text-[9px] font-bold tracking-wider backdrop-blur-md animate-bounce" style={{ backgroundColor: "white", color: h, borderColor: `${h}30`, animationDuration: "3s" }}>+124%</div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#F9AB00" d="M12 2L2 19h20L12 2zm0 4.5L18.5 17h-13L12 6.5z"/><path fill="#E37400" d="M12 2L2 19h10V2z"/>
      </svg>
    )
  },
  {
    name: "Search Console", category: "Analytics", color: "#4285F4", desc: "Monitor and optimize your site's presence in Google Search results directly.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[90%] h-[70%] rounded-xl shadow-md border overflow-hidden bg-white/50 backdrop-blur-md flex flex-col group-hover:scale-105 transition-transform duration-500" style={{ borderColor: `${h}30` }}>
          <div className="p-2 border-b flex items-center gap-2" style={{ borderColor: `${h}15` }}>
            <div className="w-4 h-4 rounded shadow-sm flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: h }}>G</div>
            <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full w-2/3" style={{ backgroundColor: `${h}40` }} /></div>
          </div>
          <div className="flex-1 p-3 flex flex-col gap-2">
            <div className="flex items-end gap-2 h-10 border-b pb-1" style={{ borderColor: `${h}20` }}>
              <svg className="w-full h-full group-hover:scale-y-110 origin-bottom transition-transform duration-700" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0,40 Q20,20 40,30 T80,10 T100,5" fill="none" stroke={h} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex gap-2">
              <div className="h-1.5 rounded-full w-1/3" style={{ backgroundColor: `${h}30` }} /><div className="h-1.5 rounded-full w-1/4" style={{ backgroundColor: `${h}20` }} />
            </div>
          </div>
        </div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#4285F4" d="M12 2L2 7l10 5 10-5-10-5z"/><path fill="#34A853" d="M2 17l10 5 10-5"/><path fill="#FBBC05" d="M2 12l10 5 10-5"/>
      </svg>
    )
  },
  {
    name: "YouTube", category: "Analytics", color: "#EA4335", desc: "Analyze video views, subscriber growth, and audience retention.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[85%] h-[60%] rounded-xl shadow-lg overflow-hidden border group-hover:scale-105 transition-transform duration-500" style={{ borderColor: `${h}30`, backgroundColor: `${h}0A` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-7 rounded-lg shadow-[0_0_15px_currentColor] flex items-center justify-center transition-all duration-300" style={{ backgroundColor: h, color: `${h}80` }}>
              <div className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-white ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent flex items-end px-2 pb-1.5">
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/2 group-hover:w-[90%] transition-all duration-1000" />
            </div>
          </div>
        </div>
        <div className="absolute -top-2 -right-1 bg-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg border animate-pulse" style={{ color: h, borderColor: `${h}30` }}>10k Views</div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
  {
    name: "Google Ads", category: "Analytics", color: "#FBBC05", desc: "Track ad spend, conversions, and keyword performance in real time.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[85%] h-[65%] bg-white rounded-xl shadow-lg border p-3 flex gap-3 group-hover:rotate-2 transition-transform duration-500" style={{ borderColor: `${h}30` }}>
          <div className="flex-1 flex flex-col justify-between">
            <div className="h-2 w-1/2 rounded-full mb-2" style={{ backgroundColor: `${h}50` }} />
            {[60, 85, 40, 95].map((x, y) => (
              <div key={y} className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full group-hover:w-full transition-all duration-1000 origin-left" style={{ width: `${x}%`, backgroundColor: h, transitionDelay: `${y * 100}ms` }} />
              </div>
            ))}
          </div>
          <div className="w-10 h-10 rounded-full border-4 flex items-center justify-center relative group-hover:rotate-180 transition-transform duration-1000" style={{ borderColor: `${h}30`, borderTopColor: h }}>
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: h }} />
          </div>
        </div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#FBBC05" d="M15.5 2.5l-9 15.5 3 5 9-15.5z"/><path fill="#4285F4" d="M6.5 18h12v5h-12z"/><path fill="#34A853" d="M6.5 18l-3 5h3z"/>
      </svg>
    )
  },
  {
    name: "Meta Ads", category: "Analytics", color: "#0668E1", desc: "Monitor ad spend, ROAS, and campaign performance across Meta.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[90%] h-[70%] bg-white rounded-xl shadow-xl border p-3 flex flex-col gap-2 group-hover:-translate-y-2 transition-transform duration-500" style={{ borderColor: `${h}30` }}>
          <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: `${h}15` }}>
            <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: `${h}80` }} />
            <div className="w-6 h-3 rounded-full flex items-center p-0.5" style={{ backgroundColor: h }}>
              <div className="w-2 h-2 rounded-full bg-white ml-auto" />
            </div>
          </div>
          <div className="flex-1 flex gap-2">
            <div className="w-1/3 h-full rounded-md opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: h }} />
            <div className="w-1/3 h-full rounded-md opacity-50 group-hover:opacity-70 transition-opacity" style={{ backgroundColor: h }} />
            <div className="w-1/3 h-full rounded-md opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: h }} />
          </div>
        </div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#0668E1">
        <path d="M16.48 5.42c-1.39 0-2.58.64-3.4 1.76-1.12-1.48-2.61-2.12-4.04-2.12-2.91 0-5.11 2.37-5.11 5.4 0 2.94 2.1 5.39 5.01 5.39 1.48 0 2.76-.71 3.57-1.92.93 1.34 2.31 2.29 4.19 2.29 2.8 0 4.88-2.22 4.88-5.3 0-3-.95-5.5-5.1-5.5zm-5.69 10.42c-2.07 0-3.41-1.63-3.41-3.48 0-2.11 1.5-3.35 3.19-3.35.79 0 1.57.25 2.19.89-1 1.76-1.57 4-1.97 5.94zm5.83-1.01c-.57 0-1.21-.19-1.66-.6l1.32-4.8c.17.06.35.09.53.09 1.59 0 2.85 1.58 2.85 3.39 0 1.31-.83 1.92-3.04 1.92z"/>
      </svg>
    )
  },
  {
    name: "Facebook", category: "Scheduler", color: "#1877F2", desc: "Monitor page engagement, post reach, and audience demographics.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[75%] bg-white rounded-xl shadow-lg border p-3 flex flex-col gap-3 group-hover:-translate-y-2 transition-transform duration-500" style={{ borderColor: `${h}30` }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full shadow-sm" style={{ backgroundColor: h }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-3/4 rounded-full" style={{ backgroundColor: `${h}60` }} />
              <div className="h-1.5 w-1/3 rounded-full" style={{ backgroundColor: `${h}30` }} />
            </div>
          </div>
          <div className="w-full h-12 rounded-lg" style={{ backgroundColor: `${h}15` }} />
          <div className="flex gap-2">
            <div className="h-4 w-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${h}20` }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h }} />
            </div>
          </div>
        </div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    name: "Instagram", category: "Scheduler", color: "#E4405F", desc: "Schedule posts, track engagement, and analyze your audience growth seamlessly.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[80%] h-[80%] flex flex-col gap-2">
          <div className="flex gap-2 justify-center">
            {[1, 2, 3].map((x) => (
              <div key={x} className="w-10 h-10 rounded-full border-2 p-0.5 group-hover:rotate-180 transition-transform duration-[2s]" style={{ borderColor: x === 1 ? h : `${h}40` }}>
                <div className="w-full h-full rounded-full" style={{ backgroundColor: `${h}${x === 1 ? "80" : "20"}` }} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5 flex-1 mt-1">
            {[1, 2, 3, 4, 5, 6].map((x) => (
              <div key={x} className="rounded-sm group-hover:scale-95 transition-transform duration-300" style={{ backgroundColor: x % 2 === 0 ? `${h}40` : `${h}15` }} />
            ))}
          </div>
        </div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <defs>
          <radialGradient id="ig-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(45) scale(33.9411)">
            <stop offset="0" stopColor="#fed373"/><stop offset="0.25" stopColor="#f15245"/><stop offset="0.5" stopColor="#d92e7f"/><stop offset="0.75" stopColor="#9b36b7"/><stop offset="1" stopColor="#515ecf"/>
          </radialGradient>
        </defs>
        <path fill="url(#ig-grad)" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126s1.337 1.078 2.126 1.384c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384s1.078-1.337 1.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126s-1.337-1.078-2.126-1.384c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.58.016 4.85.071 1.17.054 1.805.249 2.227.412.562.218.96.478 1.381.9.422.421.682.819.9 1.381.164.422.359 1.057.413 2.227.057 1.27.07 1.646.07 4.85s-.015 3.58-.07 4.85c-.054 1.17-.249 1.805-.413 2.227-.218.562-.478.96-.9 1.381-.421.422-.819.682-1.381.9-.422.164-1.057.359-2.227.413-1.27.057-1.646.07-4.85.07s-3.58-.015-4.85-.07c-1.17-.054-1.805-.249-2.227-.413-.562-.218-.96-.478-1.381-.9-.421-.421-.682-.819-.9-1.381-.164-.422-.359-1.057-.413-2.227-.057-1.27-.07-1.646-.07-4.85s.012-3.58.07-4.85c.054-1.17.249-1.805.413-2.227.218-.562.478-.96.9-1.381.422-.421.819-.682 1.381-.9.422-.164 1.057-.359 2.227-.413 1.27-.057 1.646-.07 4.85-.07zM12 5.837a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-9.845a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88z"/>
      </svg>
    )
  },
  {
    name: "WooCommerce", category: "Analytics", color: "#7F54B3", desc: "Analyze store revenue, top products, and conversion funnels.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[85%] h-[65%] bg-white rounded-xl shadow-lg border flex overflow-hidden group-hover:shadow-2xl transition-shadow duration-500" style={{ borderColor: `${h}30` }}>
          <div className="w-1/3 h-full p-2 flex flex-col gap-2 border-r" style={{ borderColor: `${h}15`, backgroundColor: `${h}05` }}>
            {[1, 2, 3, 4].map((x) => (
              <div key={x} className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.random() * 50 + 50}%`, backgroundColor: x === 1 ? h : `${h}40` }} />
            ))}
          </div>
          <div className="flex-1 p-3 flex flex-col">
            <div className="h-3 w-1/2 rounded-full mb-3" style={{ backgroundColor: h }} />
            <div className="flex-1 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundColor: `${h}15` }}>
              <svg className="w-6 h-6" style={{ color: h }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#7F54B3" d="M2.2 4h19.6c1.2 0 2.2 1 2.2 2.2v8.7c0 1.2-1 2.2-2.2 2.2H14.8l1 3.4-6.2-3.4H2.2C1 17.1 0 16.1 0 14.9V6.2C0 5 1 4 2.2 4z"/>
        <path fill="#FFFFFF" d="M3.6 8.4c.2-.3.6-.5 1-.5.7-.1 1.1.3 1.2 1 .3 1.8.5 3.3.9 4.5l2.1-4c.2-.4.4-.6.7-.6.4 0 .7.3.8.8.2 1.2.5 2.2.9 3.1.2-2.2.6-3.8 1.2-4.8.1-.2.3-.4.6-.4.2 0 .4.1.6.2.2.1.3.3.3.6 0 .2 0 .3-.1.5-.3.6-.6 1.6-.8 3-.2 1.4-.3 2.5-.3 3.2 0 .2 0 .4-.1.5-.1.2-.3.3-.5.3-.3 0-.5-.1-.8-.4-.9-.9-1.6-2.3-2.1-4.1-.6 1.3-1.1 2.2-1.4 2.8-.6 1.1-1.1 1.6-1.5 1.7-.3 0-.5-.2-.7-.7-.6-1.5-1.2-4.4-1.9-8.7 0-.2.1-.4.2-.5z"/>
      </svg>
    )
  },
  {
    name: "LinkedIn", category: "Scheduler", color: "#0A66C2", desc: "Track professional network growth and B2B engagement metrics.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[80%] bg-white rounded-xl shadow-lg border overflow-hidden group-hover:-translate-y-2 transition-transform duration-500" style={{ borderColor: `${h}30` }}>
          <div className="h-8 w-full relative" style={{ backgroundColor: h }}>
            <div className="absolute -bottom-4 left-3 w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: `${h}40` }} />
          </div>
          <div className="p-3 pt-5 flex flex-col gap-1.5">
            <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: h }} />
            <div className="h-1.5 w-2/3 rounded-full" style={{ backgroundColor: `${h}40` }} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="h-10 rounded-md" style={{ backgroundColor: `${h}10` }} />
              <div className="h-10 rounded-md" style={{ backgroundColor: `${h}10` }} />
            </div>
          </div>
        </div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#0A66C2">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    )
  },
  {
    name: "Telegram", category: "Broadcast", color: "#229ED9", desc: "Broadcast reports and alerts directly to your team or clients instantly.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500 shadow-lg" style={{ background: `linear-gradient(135deg, ${h}90, ${h})` }}>
          <div className="absolute inset-0 rounded-full border-4 border-white/20" />
          <svg className="w-10 h-10 text-white ml-[-2px] mt-[2px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </div>
        <div className="absolute top-4 right-8 w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: h }} />
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#229ED9">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 7.007l-2.012 9.487c-.15.674-.551.841-1.116.523l-3.07-2.261-1.482 1.426c-.164.164-.301.301-.617.301l.221-3.131 5.7-5.15c.248-.221-.053-.344-.385-.123l-7.045 4.434-3.036-.949c-.661-.207-.674-.661.138-.977l11.868-4.573c.551-.207 1.034.123.832.997z"/>
      </svg>
    )
  },
  {
    name: "WhatsApp", category: "Broadcast", color: "#25D366", desc: "Send personalized WhatsApp campaigns and automated alerts to customers.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-[80%] h-[70%]">
          <div className="absolute top-2 left-2 w-2/3 p-2 rounded-xl rounded-tl-none shadow-sm backdrop-blur-sm border" style={{ backgroundColor: `${h}15`, borderColor: `${h}30` }}>
            <div className="h-1.5 w-3/4 rounded-full mb-1.5" style={{ backgroundColor: `${h}60` }} />
            <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: `${h}40` }} />
          </div>
          <div className="absolute bottom-2 right-2 w-2/3 p-2 rounded-xl rounded-br-none shadow-md border group-hover:-translate-y-1 transition-transform duration-300" style={{ backgroundColor: h, borderColor: h }}>
            <div className="h-1.5 w-full rounded-full bg-white/70 mb-1.5" />
            <div className="flex justify-between items-end">
              <div className="h-1.5 w-1/3 rounded-full bg-white/50" />
              <div className="flex text-white/90">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    )
  },
  {
    name: "SMS", category: "Broadcast", color: "#8A2BE2", desc: "Deliver high-open-rate text messages directly to mobile devices.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[45%] h-[85%] bg-white rounded-[20px] shadow-lg border-4 flex flex-col p-1.5 group-hover:rotate-6 transition-transform duration-500" style={{ borderColor: `${h}30` }}>
          <div className="w-1/3 h-1 rounded-full mx-auto mb-2" style={{ backgroundColor: `${h}30` }} />
          <div className="flex-1 flex flex-col gap-1.5 mt-2">
            <div className="w-[85%] p-1.5 rounded-lg rounded-tl-sm" style={{ backgroundColor: `${h}15` }}>
              <div className="h-1 w-full rounded-full" style={{ backgroundColor: `${h}40` }} />
            </div>
            <div className="w-[85%] self-end p-1.5 rounded-lg rounded-tr-sm" style={{ backgroundColor: h }}>
              <div className="h-1 w-3/4 rounded-full bg-white/80" />
            </div>
          </div>
        </div>
        <div className="absolute top-6 right-8 w-5 h-5 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white text-[8px] font-bold animate-bounce" style={{ backgroundColor: "#EF4444" }}>1</div>
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#8A2BE2">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    )
  },
  {
    name: "Email", category: "Broadcast", color: "#D44638", desc: "Design and send targeted email marketing campaigns effortlessly.",
    graphic: (h: string) => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-[75%] h-[60%] bg-white rounded-xl shadow-lg border overflow-hidden group-hover:scale-105 transition-transform duration-500" style={{ borderColor: `${h}30` }}>
          <div className="absolute inset-0 flex flex-col pt-3 px-3 gap-1.5">
            <div className="h-2 w-1/2 rounded-full" style={{ backgroundColor: h }} />
            <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: `${h}40` }} />
            <div className="h-1.5 w-1/3 rounded-full" style={{ backgroundColor: `${h}20` }} />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[60%] border-b shadow-sm" style={{ backgroundColor: "white", borderColor: `${h}20`, transformOrigin: "top", transform: "perspective(100px) rotateX(10deg)" }}>
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r bg-white" style={{ borderColor: `${h}20` }} />
          </div>
        </div>
        <div className="absolute -top-4 right-2 shadow-[0_0_20px_currentColor] w-8 h-8 rounded-full blur-xl opacity-30" style={{ color: h, backgroundColor: h }} />
      </div>
    ),
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#D44638">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    )
  }
];

const featureTabs = [
  {
    id: "analytics", title: "Analytics", desc: "Unify your marketing data from multiple sources. Get a crystal-clear view of your performance across all platforms in real time.",
    graphic: () => (
      <div className="w-full h-full bg-[#fafafa] flex flex-col font-sans text-[#18181b] rounded-[2rem] overflow-hidden">
        <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="h-16 bg-white border-b border-[#e4e4e7] px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4285F4] to-blue-400 flex items-center justify-center shadow-sm">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <div className="font-semibold text-sm">Analytics Overview</div>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 text-xs font-medium border border-[#e4e4e7] rounded-lg text-[#71717a] bg-white shadow-sm hover:bg-gray-50 cursor-pointer transition-colors">Last 30 Days</div>
            <div className="px-4 py-2 text-xs font-medium bg-[#18181b] text-white rounded-lg shadow-sm hover:bg-black cursor-pointer transition-colors">Export Report</div>
          </div>
        </motion.div>
        <div className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 shrink-0">
            {[
              { title: "Total Revenue", val: "$124,500", change: "+14.2%", trend: "up", spark: "from-green-50 to-transparent", bar: "bg-green-400", data: [40, 50, 45, 60, 55, 75, 90] },
              { title: "Active Users", val: "12,402", change: "+8.1%", trend: "up", spark: "from-blue-50 to-transparent", bar: "bg-[#4285F4]", data: [60, 55, 65, 60, 70, 85, 80] },
              { title: "Bounce Rate", val: "24.5%", change: "-2.4%", trend: "down", spark: "from-purple-50 to-transparent", bar: "bg-purple-400", data: [30, 25, 28, 22, 20, 15, 12] }
            ].map((e, t) => (
              <motion.div key={t} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 + t * 0.1 }} className="bg-white border border-[#e4e4e7] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                <div className="text-xs font-medium text-[#71717a]">{e.title}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-2xl font-bold tracking-tight">{e.val}</div>
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${e.trend === "up" ? "text-green-700 bg-green-50" : "text-purple-700 bg-purple-50"}`}>{e.change}</div>
                </div>
                <div className={`mt-6 h-12 bg-gradient-to-t ${e.spark} flex items-end rounded-lg`}>
                  <div className="w-full flex justify-between items-end h-full gap-[2px] px-1">
                    {e.data.map((s, i) => (
                      <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${s}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 + t * 0.1 + i * 0.05, type: "spring" }} className={`w-full ${e.bar} rounded-t-[2px] opacity-70 group-hover:opacity-100 transition-opacity`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }} className="flex-1 bg-white border border-[#e4e4e7] rounded-2xl shadow-sm p-6 flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-sm font-semibold text-[#18181b]">Traffic vs Conversions</div>
                <div className="text-xs text-[#71717a] mt-1">Daily aggregated performance</div>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#4285F4]" />Traffic</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#18181b]" />Conversions</div>
              </div>
            </div>
            <div className="flex-1 border-b border-l border-gray-100 relative mt-4">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[1, 2, 3, 4].map(e => <div key={e} className="w-full border-t border-gray-100 border-dashed" />)}
              </div>
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="gradientTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4285F4" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4285F4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }} d="M0,75 C10,75 10,55 20,55 C30,55 30,65 40,65 C50,65 50,35 60,35 C70,35 70,45 80,45 C90,45 90,15 100,15 L100,100 L0,100 Z" fill="url(#gradientTraffic)" />
                <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }} d="M0,75 C10,75 10,55 20,55 C30,55 30,65 40,65 C50,65 50,35 60,35 C70,35 70,45 80,45 C90,45 90,15 100,15" fill="none" stroke="#4285F4" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" className="drop-shadow-md" />
                <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }} d="M0,85 C10,85 10,75 20,75 C30,75 30,80 40,80 C50,80 50,60 60,60 C70,60 70,70 80,70 C90,70 90,40 100,40" fill="none" stroke="#18181b" strokeWidth="2" strokeDasharray="4 4" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <div className="absolute bottom-0 left-0 w-full flex justify-between translate-y-full pt-3 text-[10px] font-medium text-[#71717a]">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  },
  {
    id: "reports", title: "Reports", desc: "Automate client reporting and generate stunning, brandable dashboards in seconds. Say goodbye to manual spreadsheets.",
    graphic: () => (
      <div className="w-full h-full bg-[#fafafa] flex font-sans text-[#18181b] overflow-hidden rounded-[2rem]">
        <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="w-56 bg-white border-r border-[#e4e4e7] flex flex-col shrink-0 z-10 shadow-sm relative">
          <div className="p-5 border-b border-[#e4e4e7] bg-[#fafafa] flex justify-between items-center">
            <span className="font-semibold text-xs text-[#71717a] uppercase tracking-wider">Report Builder</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="p-5 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1">Drag Widgets</div>
            {[
              { icon: BarChart2, text: "Bar Chart", color: "blue" },
              { icon: PieChart, text: "Pie Chart", color: "purple" },
              { icon: Target, text: "Goal Tracker", color: "green" },
              { icon: (props: any) => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>, text: "Funnel", color: "orange" },
              { icon: (props: any) => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, text: "Data Table", color: "teal" }
            ].map((w, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} className={`border border-[#e4e4e7] bg-white rounded-xl p-2.5 flex items-center gap-3 cursor-grab shadow-sm hover:border-${w.color}-500 transition-colors group`}>
                <div className={`w-7 h-7 rounded-lg bg-${w.color}-50 flex items-center justify-center group-hover:bg-${w.color}-100 transition-colors`}>
                  <w.icon className={`w-3.5 h-3.5 text-${w.color}-500`} />
                </div>
                <span className="text-xs font-semibold">{w.text}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-auto p-5 border-t border-[#e4e4e7] bg-white shrink-0">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full py-2.5 bg-[#18181b] text-white rounded-lg text-xs font-semibold shadow-md flex justify-center items-center gap-2">
              Generate PDF <Send className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>
        <div className="flex-1 bg-[#f4f4f5] p-8 flex justify-center overflow-y-auto overflow-x-hidden relative custom-scrollbar">
          <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />
          <div className="w-full max-w-md bg-white shadow-xl border border-[#e4e4e7] rounded-lg p-8 flex flex-col gap-6 relative shrink-0">
            <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="flex justify-between items-start border-b border-[#e4e4e7] pb-6">
              <div>
                <div className="text-2xl font-bold tracking-tight text-[#18181b]">Q3 Performance</div>
                <div className="text-xs text-[#71717a] mt-1 font-medium">October 2026 — Acme Corp</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-[#18181b] to-gray-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">AC</div>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-[#fafafa] border border-[#e4e4e7] rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-1">Total Leads</div>
                <div className="text-2xl font-bold text-[#18181b]">842</div>
                <div className="text-[10px] text-green-600 font-semibold mt-1 flex items-center gap-1">↑ 12% vs last month</div>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-[#fafafa] border border-[#e4e4e7] rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-1">Avg CPA</div>
                <div className="text-2xl font-bold text-[#18181b]">$12.50</div>
                <div className="text-[10px] text-green-600 font-semibold mt-1 flex items-center gap-1">↓ $1.20 vs last month</div>
              </motion.div>
            </div>
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-white border border-[#e4e4e7] rounded-xl p-5 flex flex-col h-48 shadow-sm relative group cursor-pointer">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-100 rounded text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
              </div>
              <div className="text-xs font-bold text-[#18181b] mb-4">Lead Generation Over Time</div>
              <div className="flex-1 flex items-end gap-2 h-full border-b border-[#e4e4e7]">
                {[40, 60, 30, 80, 50, 100, 70].map((e, t) => (
                  <div key={t} className="flex-1 relative group/bar h-full flex items-end">
                    <motion.div initial={{ height: 0 }} whileInView={{ height: `${e}%` }} viewport={{ once: true }} transition={{ delay: 0.8 + t * 0.05, type: "spring" }} className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm opacity-80 group-hover/bar:opacity-100 transition-opacity" />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#18181b] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none">{e}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-[#a1a1aa] font-medium">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "seo", title: "SEO Tools", desc: "Monitor and optimize your search presence. Track keyword rankings and identify opportunities to climb the search results.",
    graphic: () => (
      <div className="w-full h-full bg-[#fafafa] flex font-sans text-[#18181b] overflow-hidden rounded-[2rem]">
        <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="w-60 bg-white border-r border-[#e4e4e7] flex flex-col shrink-0 shadow-sm z-10">
          <div className="p-5 border-b border-[#e4e4e7] bg-[#fafafa] flex justify-between items-center">
            <span className="font-semibold text-xs text-[#71717a] uppercase tracking-wider">SEO Projects</span>
            <button className="text-[#4285F4] hover:bg-blue-50 p-1 rounded transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <motion.div whileHover={{ x: 2 }} className="bg-[#f4f4f5] border border-[#e4e4e7] rounded-xl p-3 border-l-4 border-l-green-500 cursor-pointer shadow-sm">
              <div className="text-xs font-bold text-[#18181b] mb-1 flex items-center justify-between">Acme Corp <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /></div>
              <div className="text-[10px] text-[#71717a] flex gap-2"><span>842 KWs</span> • <span className="text-green-600 font-semibold">↑ 12% Visibility</span></div>
            </motion.div>
            <motion.div whileHover={{ x: 2 }} className="bg-white border border-[#e4e4e7] rounded-xl p-3 cursor-pointer hover:border-gray-300 transition-colors">
              <div className="text-xs font-bold text-[#71717a] mb-1">Global Tech Blog</div>
              <div className="text-[10px] text-[#a1a1aa] flex gap-2"><span>1.2k KWs</span> • <span>- 2% Visibility</span></div>
            </motion.div>
          </div>
          <div className="mt-auto p-4 border-t border-[#e4e4e7]">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2">
              <div className="bg-orange-100 p-1 rounded text-orange-600"><Target className="w-3 h-3" /></div>
              <div>
                <div className="text-[10px] font-bold text-orange-800">Critical Issues Found</div>
                <div className="text-[9px] text-orange-600 mt-0.5">3 pages missing H1 tags</div>
              </div>
            </div>
          </div>
        </motion.div>
        <div className="flex-1 flex flex-col bg-[#f4f4f5] overflow-hidden">
          <div className="p-6 pb-0 flex gap-4 shrink-0">
            <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1 bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-1">Visibility Index</div>
                <div className="text-2xl font-bold text-[#18181b]">42.8%</div>
              </div>
              <div className="w-24 h-10 flex items-end gap-1">
                {[30, 45, 40, 60, 50, 80, 100].map((e, t) => (
                  <motion.div key={t} initial={{ height: 0 }} whileInView={{ height: `${e}%` }} viewport={{ once: true }} transition={{ delay: 0.4 + t * 0.05, type: "spring" }} className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm" />
                ))}
              </div>
            </motion.div>
          </div>
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="p-6 flex-1 flex flex-col min-h-0">
            <div className="bg-white border border-[#e4e4e7] rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-[#e4e4e7] flex justify-between items-center bg-[#fafafa]">
                <div className="text-sm font-bold text-[#18181b]">Keyword Rankings</div>
                <div className="flex gap-2">
                  <div className="bg-white border border-[#e4e4e7] rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm focus-within:border-[#4285F4] transition-colors">
                    <Search className="w-3.5 h-3.5 text-[#a1a1aa]" />
                    <span className="text-xs text-[#a1a1aa]">Search keywords...</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white/90 backdrop-blur z-10 border-b border-[#e4e4e7]">
                    <tr className="text-[#71717a] text-[10px] uppercase tracking-wider font-bold">
                      <th className="px-6 py-3 font-semibold">Keyword</th><th className="px-6 py-3 font-semibold">Intent</th><th className="px-6 py-3 font-semibold">Position</th><th className="px-6 py-3 font-semibold">Volume</th><th className="px-6 py-3 font-semibold">KD</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {[
                      { kw: "best marketing agency", intent: "Commercial", pos: "1", diff: "+3", vol: "12,000", kd: "78", color: "bg-red-100 text-red-700" },
                      { kw: "b2b lead generation", intent: "Transactional", pos: "4", diff: "+1", vol: "8,500", kd: "64", color: "bg-yellow-100 text-yellow-700" },
                      { kw: "content strategy 2026", intent: "Informational", pos: "2", diff: "-", vol: "4,200", kd: "45", color: "bg-green-100 text-green-700" }
                    ].map((e, t) => (
                      <motion.tr key={t} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 + t * 0.05 }} className="border-b border-[#f4f4f5] hover:bg-[#fafafa] transition-colors group cursor-pointer">
                        <td className="px-6 py-4 font-bold text-[#18181b]">{e.kw}</td>
                        <td className="px-6 py-4"><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${e.intent === "Commercial" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>{e.intent}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#18181b] text-sm">{e.pos}</span>
                            {e.diff !== "-" ? <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">↑ {e.diff.replace("+", "")}</span> : <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">-</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#71717a] font-medium">{e.vol}</td>
                        <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded-md ${e.color}`}>{e.kd}</span></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  },
  {
    id: "scheduler", title: "Scheduler", desc: "Plan, schedule, and publish your content across all social channels from one unified calendar.",
    graphic: () => (
      <div className="w-full h-full bg-[#fafafa] flex font-sans text-[#18181b] overflow-hidden rounded-[2rem]">
        <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="w-56 bg-white border-r border-[#e4e4e7] flex flex-col shrink-0 z-10 shadow-sm relative">
          <div className="p-5 border-b border-[#e4e4e7] bg-[#fafafa]"><span className="font-semibold text-xs text-[#71717a] uppercase tracking-wider">Media Library</span></div>
          <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            <motion.div initial={{ y: 10, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02 }} className="border border-[#e4e4e7] rounded-xl overflow-hidden cursor-grab group shadow-sm">
              <div className="h-20 bg-gradient-to-tr from-purple-400 to-indigo-400 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-white font-bold text-xs shadow-sm">New Product</span>
              </div>
              <div className="p-2 bg-white flex justify-between items-center"><span className="text-[9px] font-semibold text-[#71717a]">IMG_8421.png</span><span className="text-[8px] bg-gray-100 px-1 rounded">2.4 MB</span></div>
            </motion.div>
            <motion.div initial={{ y: 10, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.02 }} className="border border-[#e4e4e7] rounded-xl overflow-hidden cursor-grab group shadow-sm">
              <div className="h-20 bg-gradient-to-br from-green-300 to-emerald-500 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-white font-bold text-[10px] bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">0:15</span>
              </div>
              <div className="p-2 bg-white flex justify-between items-center"><span className="text-[9px] font-semibold text-[#71717a]">Promo_Reel.mp4</span><span className="text-[8px] bg-gray-100 px-1 rounded">12 MB</span></div>
            </motion.div>
          </div>
        </motion.div>
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden bg-[#f4f4f5]">
          <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#e4e4e7] shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <div className="font-bold text-lg text-[#18181b]">October 2026</div>
              <div className="flex bg-[#f4f4f5] border border-[#e4e4e7] rounded-lg p-1">
                <div className="px-4 py-1 text-xs font-semibold text-[#71717a] cursor-pointer hover:text-[#18181b]">Month</div>
                <div className="px-4 py-1 text-xs font-bold bg-white shadow-sm rounded-md text-[#18181b]">Week</div>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-[#4285F4] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md flex items-center gap-2">New Post <span className="text-lg leading-none">+</span></motion.button>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="flex-1 bg-white border border-[#e4e4e7] rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="grid grid-cols-5 border-b border-[#e4e4e7] bg-[#fafafa]">
              {[{ d: "Mon", n: "12" }, { d: "Tue", n: "13" }, { d: "Wed", n: "14" }, { d: "Thu", n: "15" }, { d: "Fri", n: "16" }].map((e, t) => (
                <div key={t} className="p-3 text-center border-r border-[#e4e4e7] last:border-0 flex flex-col">
                  <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wide">{e.d}</span>
                  <span className={`text-lg font-bold ${t === 2 ? "text-[#4285F4]" : "text-[#18181b]"}`}>{e.n}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-5 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                {[1, 2, 3, 4, 5].map(e => <div key={e} className="w-full border-t border-[#e4e4e7] border-dashed opacity-50 flex-1" />)}
              </div>
              {[...Array(5)].map((_, t) => (
                <div key={t} className="border-r border-[#e4e4e7] last:border-0 p-2 flex flex-col gap-2 relative z-10">
                  {t === 0 && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", delay: 0.6 }} whileHover={{ scale: 1.02 }} className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-2 shadow-sm cursor-pointer border-l-4 border-l-blue-500 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#0a66c2] text-white rounded-[2px] flex items-center justify-center text-[7px] font-bold">in</div><span className="text-[9px] font-bold text-[#71717a]">09:00 AM</span></div>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      </div>
                      <div className="text-[10px] font-semibold text-[#18181b] leading-tight">Product Launch Teaser</div>
                      <div className="h-10 bg-blue-100 rounded-md mt-1 border border-blue-200" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  },
  {
    id: "broadcast", title: "Broadcast", desc: "Send personalized campaigns, alerts, and updates to your audience via Email, SMS, and WhatsApp effortlessly.",
    graphic: () => (
      <div className="w-full h-full bg-[#fafafa] flex font-sans text-[#18181b] overflow-hidden rounded-[2rem]">
        <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="w-64 bg-white border-r border-[#e4e4e7] flex flex-col shrink-0 shadow-sm z-10">
          <div className="p-5 border-b border-[#e4e4e7] bg-[#fafafa]"><span className="font-semibold text-xs text-[#71717a] uppercase tracking-wider">Campaigns</span></div>
          <div className="flex flex-col gap-2 px-4 py-4">
            <motion.div whileHover={{ x: 2 }} className="bg-[#f4f4f5] border border-[#e4e4e7] rounded-xl p-3 border-l-4 border-l-[#4285F4] cursor-pointer shadow-sm">
              <div className="text-xs font-bold mb-1 text-[#18181b]">Black Friday Promo</div>
              <div className="text-[10px] text-[#71717a] flex justify-between items-center"><span className="font-medium">SMS & Email</span><span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Active</span></div>
            </motion.div>
          </div>
        </motion.div>
        <div className="flex-1 p-8 flex flex-col gap-6 overflow-hidden bg-[#f4f4f5]">
          <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="flex justify-between items-center bg-white border border-[#e4e4e7] p-4 rounded-xl shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-[#4285F4]" /></div>
              <div><div className="font-bold text-sm text-[#18181b]">Black Friday Promo</div><div className="text-[10px] font-medium text-[#71717a]">Omnichannel Broadcast</div></div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md flex items-center gap-2">Publish <Send className="w-3 h-3" /></motion.button>
          </motion.div>
          <div className="flex gap-6 flex-1 min-h-0">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", delay: 0.4 }} className="w-[220px] border-[10px] border-[#18181b] rounded-[2.5rem] bg-white relative flex flex-col overflow-hidden shadow-2xl shrink-0 my-auto h-[440px]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#18181b] rounded-b-xl z-20" />
              <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto bg-[#fafafa] pt-12">
                <motion.div initial={{ scale: 0.9, opacity: 0, originX: 0, originY: 1 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} className="bg-[#e4e4e7] text-[#18181b] p-3 rounded-2xl rounded-tl-sm text-[10px] w-5/6 shadow-sm">Hi {"{{first_name}}"}! 👋</motion.div>
                <motion.div initial={{ scale: 0.9, opacity: 0, originX: 1, originY: 1 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-[#4285F4] to-blue-500 text-white p-3 rounded-2xl rounded-tr-sm text-[10px] w-[95%] self-end shadow-md">Our biggest sale is live! Use code <b>FRIDAY50</b></motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }
];

const FeatureScrollItem = ({ feature, index, isActive, setActiveIdx }: { feature: any, index: number, isActive: boolean, setActiveIdx: (idx: number) => void }) => (
  <div className="flex flex-col gap-1 transition-all duration-500 group py-1 md:py-2" onMouseEnter={() => setActiveIdx(index)}>
    <h3 className={`text-xl md:text-2xl lg:text-3xl font-bold tracking-tight transition-all duration-500 cursor-pointer ${isActive ? "text-[#111] translate-x-1" : "text-[#a1a1aa] hover:text-[#71717a]"}`}>{feature.title}</h3>
    <motion.div initial={false} animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }} className="overflow-hidden">
      <p className="text-sm md:text-base text-[#52525b] pt-2 pb-3 pr-4 md:pr-8 leading-relaxed font-medium">{feature.desc}</p>
      <button className="text-[#111] font-semibold flex items-center gap-1.5 hover:opacity-70 transition-opacity text-sm">Learn more <ArrowRight size={14} /></button>
    </motion.div>
  </div>
);

const FeatureScrollSection = () => {
  const containerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = Math.min(4, Math.max(0, Math.floor(latest * 5)));
    setActiveIdx(idx);
  });

  const yTransform = useTransform(scrollYProgress, [0, 0.15, 0.25, 0.4, 0.5, 0.65, 0.75, 0.9, 1], ["0%", "0%", "-20%", "-20%", "-40%", "-40%", "-60%", "-60%", "-80%"]);

  return (
    <section ref={containerRef} id="features" className="relative h-[500vh] z-20 bg-white">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden w-full relative">
        <div className="max-w-[1200px] mx-auto w-full px-6 h-full flex items-center relative z-10 pointer-events-none">
          <div className="w-full md:w-[40%] flex flex-col gap-2 md:gap-4 lg:gap-6 py-8 pointer-events-auto">
            <div className="mb-6 md:mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#18181b] leading-tight pr-4">Analyze, broadcast, and rank higher.</h2>
            </div>
            {featureTabs.map((f, idx) => (
              <FeatureScrollItem key={f.id} index={idx} feature={f} isActive={activeIdx === idx} setActiveIdx={setActiveIdx} />
            ))}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-[55vw] h-[80vh] z-0 pointer-events-none hidden md:block">
          <motion.div className="flex flex-col w-full h-[500%]" style={{ y: yTransform }}>
            {featureTabs.map((f, idx) => (
              <div key={f.id} className={`w-full h-1/5 flex items-start justify-end transition-all duration-700 pointer-events-auto ${activeIdx === idx ? "opacity-100 scale-100" : "opacity-30 scale-95"}`}>
                <div className="w-full h-full bg-white rounded-tl-[2rem] overflow-hidden shadow-[-10px_-10px_30px_rgba(0,0,0,0.03)] border-t border-l border-[#e5e5e5] flex items-center justify-center p-6">
                  <div className="w-full h-full rounded-[1.5rem] overflow-hidden border border-[#e5e5e5] shadow-sm">
                    {f.graphic()}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Main Landing Page Component ---

const tabs = ["Client", "Social media", "Broadcast", "Report", "AI Suite"];

export default function LandingPage() {
  const isAuth = isAuthenticated(StorageKey.ANALYTICS_TOKEN);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Client");
  
  const productSectionRef = useRef(null);
  const { scrollYProgress: productScroll } = useScroll({ target: productSectionRef, offset: ["start 80%", "end 50%"] });
  const [showMask, setShowMask] = useState(false);

  useMotionValueEvent(productScroll, "change", (latest) => {
    if (latest >= 0.5 && !showMask) setShowMask(true);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab(current => {
        const idx = tabs.indexOf(current);
        return tabs[(idx + 1) % tabs.length];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const pointerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("is-revealed");
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -100px 0px" });

    document.querySelectorAll(".reveal-on-scroll, .reveal-from-left, .reveal-from-right, .reveal-scale").forEach(el => observer.observe(el));

    const handleMouseMove = (e: MouseEvent) => {
      if (pointerRef.current) {
        const x = e.clientX;
        const y = e.clientY;
        pointerRef.current.style.background = `
          radial-gradient(600px circle at ${x}px ${y}px, rgba(0, 0, 0, 0.05), transparent 40%),
          radial-gradient(rgba(0, 0, 0, 0.4) 1.5px, transparent 1.5px)
        `;
        pointerRef.current.style.backgroundSize = "100% 100%, 24px 24px";
        pointerRef.current.style.webkitMaskImage = `radial-gradient(400px circle at ${x}px ${y}px, black 10%, transparent 100%)`;
        pointerRef.current.style.maskImage = `radial-gradient(400px circle at ${x}px ${y}px, black 10%, transparent 100%)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  const philosophyWords = "See What's Working. Fix What's Not. Scale What Matters.".split(" ");
  const philosophyOrder = [3, 7, 1, 6, 0, 8, 2, 4, 5];
  const [activeIntegrationCategory, setActiveIntegrationCategory] = useState("Analytics");

  return (
    <div className="min-h-[100dvh] bg-white text-[#111] font-sans selection:bg-[#4285F4] selection:text-white overflow-x-clip relative">
      <div ref={pointerRef} className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #ffffff; }
        .bg-grid-dots { 
          background-image: radial-gradient(#e5e5e5 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .reveal-on-scroll { opacity: 0; transform: translateY(60px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-on-scroll.is-revealed { opacity: 1; transform: translateY(0); }
        .reveal-from-left { opacity: 0; transform: translate(-60px, 40px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-from-left.is-revealed { opacity: 1; transform: translate(0, 0); }
        .reveal-from-right { opacity: 0; transform: translate(60px, 40px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-from-right.is-revealed { opacity: 1; transform: translate(0, 0); }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
        @keyframes float-card { 0%, 100% { transform: translateY(0px) rotateX(0deg); } 50% { transform: translateY(-20px) rotateX(2deg); } }
        .animate-float-card { animation: float-card 6s ease-in-out infinite; }
        .paused-on-hover:hover { animation-play-state: paused; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
        #integrations-slider::-webkit-scrollbar { display: none; }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
      `}</style>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-[#e5e5e5] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="GreyCats Logo" className="h-8" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-sm font-semibold text-[#666] hover:text-[#111] transition-colors">Plans</Link>
            <Link to="/contact" className="text-sm font-semibold text-[#666] hover:text-[#111] transition-colors">Support</Link>
            <div className="flex items-center gap-2">
              {!isAuth && <Link to="/auth/login" className="px-4 py-2 text-sm font-semibold text-[#111] hover:text-[#4285F4] transition-colors">Sign in</Link>}
              <Link to={isAuth ? "/clients" : "/auth/signup"}>
                <Button className="px-5 py-2.5 text-sm font-semibold bg-[#4285F4] hover:bg-[#3367D6] text-white border-none">
                  {isAuth ? "Go to Dashboard" : "Start Free Trial"}
                </Button>
              </Link>
            </div>
          </div>
          <button className="md:hidden text-[#111]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-24 px-6 flex flex-col gap-6">
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-[#111]">Plans</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-[#111]">Support</Link>
          <div className="h-px w-full bg-[#e5e5e5] my-4" />
          <div className="flex flex-col gap-4">
            {!isAuth && <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}><Button variant="secondary" className="w-full py-4 text-lg">Sign in</Button></Link>}
            <Link to={isAuth ? "/clients" : "/auth/signup"} onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full py-4 text-lg bg-[#4285F4] text-white hover:bg-[#3367D6]">
                {isAuth ? "Go to Dashboard" : "Start Free Trial"}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 flex flex-col items-center overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-transparent pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-grid-dots opacity-45 pointer-events-none" style={{ WebkitMaskImage: "linear-gradient(to bottom, black, transparent)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(66,133,244,0.04),transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#4285F4] opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center px-4 mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] mb-8 md:mb-12 uppercase tracking-[0.3em] cursor-pointer hover:bg-[#f4f4f5] transition-colors">GreyCats Analytics</div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tighter mb-8 leading-[1.1] text-[#111] px-4">
            All your marketing data. <br /> One clear reporting platform.
          </h1>
          <p className="text-lg md:text-2xl text-[#111] mb-12 max-w-4xl mx-auto leading-relaxed font-semibold px-4">
            Connect channels, track KPIs, and deliver client-ready reports faster.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to={isAuth ? "/clients" : "/auth/signup"}>
              <button className="inline-flex items-center justify-center rounded-lg text-[15px] font-medium transition-all duration-200 ease-in-out h-11 px-6 bg-[#18181b] text-white hover:bg-[#27272a] shadow-sm">
                {isAuth ? "Go to Dashboard" : "Start for free"}
              </button>
            </Link>
            <Link to="/docs/getting-started">
              <button className="inline-flex items-center justify-center rounded-lg text-[15px] font-medium transition-all duration-200 ease-in-out h-11 px-6 bg-white text-[#18181b] border border-[#e4e4e7] hover:bg-[#f4f4f5]">Documentation</button>
            </Link>
          </div>
        </div>

        {/* Dashboard Tabs Preview */}
        <div className="w-full max-w-[1200px] mx-auto px-4 mb-24">
          <div className="flex justify-center border-b border-[#e4e4e7] mb-0 relative overflow-x-auto whitespace-nowrap custom-scrollbar">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 text-sm font-medium relative transition-colors ${activeTab === tab ? "text-[#18181b]" : "text-[#71717a] hover:text-[#18181b]"}`}>
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#e4e4e7] overflow-hidden">
                    <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 4, ease: "linear" }} className="h-full bg-[#18181b]" key={activeTab} />
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          <div className="relative mt-8">
            <div className="w-full bg-white border border-[#e4e4e7] rounded-t-xl rounded-b-none shadow-sm h-[500px] flex overflow-hidden text-left">
              {/* Sidebar */}
              <div className="hidden md:flex w-64 border-r border-[#e4e4e7] bg-[#fafafa] flex-col pt-4 overflow-y-auto overflow-x-hidden pb-4 custom-scrollbar">
                <div className="px-4 pb-4 border-b border-[#e4e4e7] mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#18181b] rounded-md flex items-center justify-center text-white font-bold text-xs">G</div>
                  <span className="text-sm font-semibold text-[#18181b]">GreyCats Workspace <span>v</span></span>
                </div>
                <div className="px-2 space-y-5">
                  {[
                    { group: "Analytics", items: ["Clients", "Alerts", "Reports"] },
                    { group: "Scheduler", items: ["Social Media", "Blog"] },
                    { group: "Broadcast", items: ["WhatsApp", "SMS", "Email", "Telegram"] },
                    { group: "Ads Manager", items: ["Meta Ads", "Google Ads"] },
                    { group: "Intelligence", items: ["SEO Reporter", "AI Suite"] }
                  ].map((group, x) => (
                    <div key={x}>
                      <div className="px-3 mb-1 text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">{group.group}</div>
                      <div className="space-y-0.5">
                        {group.items.map(item => {
                          const isActive = (activeTab === "Client" && item === "Clients") || (activeTab === "Social media" && item === "Social Media") || (activeTab === "Broadcast" && item === "WhatsApp") || (activeTab === "Report" && item === "Reports") || (activeTab === "AI Suite" && item === "AI Suite");
                          return (
                            <motion.div key={item} whileHover={{ scale: 1.02, x: 2 }} className={`px-3 py-1.5 text-[13px] rounded-md cursor-pointer flex items-center gap-2 transition-colors ${isActive ? "bg-[#e4e4e7]/80 text-[#18181b] font-semibold shadow-sm" : "text-[#71717a] hover:bg-[#e4e4e7]/50 hover:text-[#18181b]"}`}>
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />}
                              <span className={isActive ? "" : "ml-2.5"}>{item}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 bg-white p-4 md:p-8 relative overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="flex items-center justify-between mb-8 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#18181b] text-lg">{activeTab} view</span>
                    <span className="hidden sm:inline-block text-[#a1a1aa] px-1.5 py-0.5 border border-[#e4e4e7] rounded text-xs bg-gray-50">⌘ K</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-[#18181b] text-white rounded-md text-xs font-medium shadow-sm">Create New</motion.button>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(4px)" }} transition={{ duration: 0.25, ease: "easeInOut" }} className="h-full">
                    {/* Mockups based on active tab */}
                    {activeTab === "Client" && (
                      <div className="border border-[#e4e4e7] rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="bg-[#fafafa] border-b border-[#e4e4e7] hidden sm:flex px-4 py-3 text-xs font-semibold text-[#71717a]">
                          <div className="w-8" /><div className="flex-1">Company</div><div className="flex-1">Domains</div><div className="flex-1">Integrations</div><div className="w-32">Status</div>
                        </div>
                        {[
                          { name: "Vercel", domain: "vercel.com", ints: 4, status: "Excellent", color: "text-purple-700 bg-purple-50" },
                          { name: "DigitalOcean", domain: "digitalocean.com", ints: 2, status: "Medium", color: "text-blue-700 bg-blue-50" },
                          { name: "GitHub", domain: "github.com", ints: 6, status: "Good", color: "text-emerald-700 bg-emerald-50" },
                          { name: "Stripe", domain: "stripe.com", ints: 3, status: "Evaluating", color: "text-[#71717a] bg-[#f4f4f5]" }
                        ].map((c, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + 0.1 }} className="border-b border-[#e4e4e7] last:border-0 flex flex-col sm:flex-row px-4 py-3.5 text-sm sm:items-center hover:bg-gray-50 transition-colors cursor-pointer group gap-2 sm:gap-0">
                            <div className="hidden sm:block w-8"><div className="w-4 h-4 border border-[#e4e4e7] rounded-[4px] group-hover:border-gray-400 transition-colors" /></div>
                            <div className="flex-1 font-medium flex items-center gap-3 text-[#18181b]"><div className="w-6 h-6 bg-[#18181b] rounded-md flex items-center justify-center text-white text-[10px] shadow-sm">{c.name[0]}</div>{c.name}</div>
                            <div className="flex-1 text-[#4285F4] text-xs"><span className="px-2.5 py-1 bg-[#4285F4]/10 rounded-full font-medium">{c.domain}</span></div>
                            <div className="flex-1 text-[#71717a] text-xs flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-full" /> {c.ints} Connected</div>
                            <div className="w-32"><span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${c.color}`}>{c.status}</span></div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    {activeTab === "Social media" && (
                      <div className="h-full flex flex-col">
                        <div className="text-[#18181b] font-medium mb-4 flex items-center gap-2">Post Scheduler <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full uppercase tracking-wider font-bold">Active</span></div>
                        <div className="flex flex-col md:flex-row gap-6">
                          <motion.div whileHover={{ y: -2 }} className="w-full md:w-72 h-72 border border-[#e4e4e7] rounded-xl p-5 bg-[#fafafa] shadow-sm flex flex-col relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                              <div><div className="w-20 h-2 bg-gray-300 rounded mb-1" /><div className="w-12 h-1.5 bg-gray-200 rounded" /></div>
                            </div>
                            <div className="w-full h-32 bg-white border border-[#e4e4e7] rounded-lg mb-3 shadow-sm" />
                            <div className="w-3/4 h-2 bg-gray-300 rounded mb-1.5" /><div className="w-1/2 h-2 bg-gray-200 rounded" />
                          </motion.div>
                          <div className="flex-1 border border-[#e4e4e7] rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between">
                            <div className="space-y-4">
                              <div className="w-1/3 h-4 bg-gray-200 rounded" />
                              <div className="w-full h-24 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs bg-gray-50">Drop media here</div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-white border border-[#e4e4e7] rounded-md text-xs font-medium text-[#18181b] shadow-sm">Preview</motion.button>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-[#4285F4] text-white rounded-md text-xs font-medium shadow-sm hover:bg-[#3367d6]">Schedule Post</motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === "Broadcast" && (
                      <div className="flex flex-col h-full border border-[#e4e4e7] rounded-xl p-6 bg-[#fafafa]">
                        <div className="text-sm font-semibold mb-6 text-[#18181b]">Active Campaigns</div>
                        <div className="space-y-3">
                          {[1, 2, 3].map(h => (
                            <motion.div key={h} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: h * 0.1 }} className="p-4 bg-white border border-[#e4e4e7] rounded-lg flex justify-between items-center shadow-sm hover:shadow transition-shadow cursor-pointer">
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${h === 1 ? "bg-blue-500" : h === 2 ? "bg-purple-500" : "bg-orange-500"}`}>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div><div className="text-sm font-medium text-[#18181b]">Newsletter Q{h}</div><div className="text-xs text-gray-500">Sent to 4,2{h}0 subscribers</div></div>
                              </div>
                              <div className="text-right"><div className="text-sm font-semibold text-green-600">{60 + h * 5}% Open</div><div className="text-xs text-gray-400">2h ago</div></div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeTab === "Report" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-2rem)]">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="border border-[#e4e4e7] rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
                          <div className="text-xs font-medium text-gray-500">Total Revenue</div><div className="text-3xl font-bold text-[#18181b] mt-2">$124,500</div>
                          <div className="mt-4 h-24 bg-gradient-to-t from-green-50 to-transparent flex items-end rounded-lg">
                            <div className="w-full flex justify-between items-end h-full gap-1 px-2">
                              {[40, 60, 45, 80, 65, 90, 100].map((h, x) => <motion.div key={x} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.2 + x * 0.05, type: "spring" }} className="w-full bg-green-400 rounded-t-sm" />)}
                            </div>
                          </div>
                        </motion.div>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="border border-[#e4e4e7] rounded-xl p-5 bg-[#fafafa] shadow-sm flex flex-col hover:shadow transition-shadow">
                          <div className="text-xs font-medium text-gray-500">Conversion Rate</div><div className="text-3xl font-bold text-[#18181b] mt-2">4.2%</div>
                          <div className="flex-1 mt-4 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400 bg-white shadow-sm">Funnel Analysis Dashboard</div>
                        </motion.div>
                      </div>
                    )}
                    {activeTab === "AI Suite" && (
                      <div className="flex flex-col h-full border border-[#e4e4e7] rounded-xl overflow-hidden bg-white shadow-sm relative">
                        <div className="p-4 border-b border-[#e4e4e7] bg-[#fafafa] flex items-center gap-2"><span className="text-lg">✨</span><span className="font-semibold text-sm text-[#18181b]">GreyCats Intelligence</span></div>
                        <div className="flex-1 p-6 flex flex-col justify-end space-y-4">
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="self-end max-w-[80%] bg-[#18181b] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm shadow-sm">How do I win my deal with Greenleaf?</motion.div>
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="self-start max-w-[80%] bg-[#f4f4f5] text-[#18181b] px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-[#e4e4e7] shadow-sm">
                            <div className="flex gap-2 items-center mb-2"><div className="w-4 h-4 rounded bg-purple-100 flex items-center justify-center text-[10px]">✨</div><span className="font-semibold text-xs">Analysis</span></div>
                            Greenleaf values fast integration. Focus on our 1-click connectors. Here's a custom slide deck you can use:
                            <motion.div whileHover={{ scale: 1.02 }} className="mt-3 p-2 bg-white rounded border border-[#e4e4e7] flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center font-bold text-[10px]">PPT</div>
                              <div className="flex-1"><div className="text-xs font-semibold">Greenleaf_Pitch.pptx</div><div className="text-[10px] text-gray-500">Generated just now</div></div>
                            </motion.div>
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none rounded-b-xl" />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="product" ref={productSectionRef} className="py-40 px-6 relative z-10 overflow-hidden flex items-center justify-center min-h-[80vh]">
        {showMask && <BackgroundDashLine />}
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#111] leading-tight flex flex-wrap justify-center gap-x-3 gap-y-2 lg:gap-x-4 lg:gap-y-3">
            {philosophyWords.map((word, idx) => (
              <AnimatedText key={idx} progress={productScroll} order={philosophyOrder[idx]} total={philosophyWords.length}>
                {word}
              </AnimatedText>
            ))}
          </h2>
          <div className="mt-16 inline-flex items-center text-[10px] font-medium text-[#999] uppercase tracking-[0.3em] opacity-60">The GreyCats Philosophy</div>
        </div>
      </section>

      {/* Horizontal Scroll Feature Section */}
      <FeatureScrollSection />

      {/* Integrations Section */}
      <section id="integrations" className="py-24 relative z-10 overflow-hidden border-y border-[#f0f0f0]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 reveal-on-scroll gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111] mb-2">Connect the Tools That Power Your Marketing</h2>
              <p className="text-[#666] text-lg font-medium">Automatically sync data from advertising platforms, analytics tools, social channels, CRMs, and ecommerce platforms into one reporting workspace.</p>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="hidden md:flex flex-wrap gap-1 items-center bg-[#f5f5f5] p-1.5 rounded-full border border-[#e5e5e5]">
                {["Analytics", "Scheduler", "Broadcast"].map((cat) => (
                  <button key={cat} onClick={() => setActiveIntegrationCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeIntegrationCategory === cat ? "bg-white text-[#111] shadow-sm border border-[#e5e5e5]" : "text-[#666] hover:text-[#111]"}`}>{cat}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => document.getElementById("integrations-slider")?.scrollBy({ left: -350, behavior: "smooth" })} className="w-10 h-10 rounded-full border border-[#e5e5e5] bg-white flex items-center justify-center text-[#111] hover:bg-[#f5f5f5] transition-colors shadow-sm hover:scale-105">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button onClick={() => document.getElementById("integrations-slider")?.scrollBy({ left: 350, behavior: "smooth" })} className="w-10 h-10 rounded-full border border-[#e5e5e5] bg-white flex items-center justify-center text-[#111] hover:bg-[#f5f5f5] transition-colors shadow-sm hover:scale-105">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
            </div>
          </div>
          
          <div id="integrations-slider" className="flex overflow-x-auto gap-6 reveal-on-scroll pb-12 pt-4 -mx-6 px-6 sm:mx-0 sm:px-0 snap-x snap-proximity scroll-smooth transition-all duration-500" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)" }}>
            {integrationList.filter(h => h.category === activeIntegrationCategory).map((h, x) => (
              <div key={h.name} className="flex-shrink-0 w-[300px] md:w-[320px] snap-center group relative h-[420px] rounded-[2rem] overflow-hidden p-6 transition-all cursor-pointer flex flex-col shadow-sm hover:-translate-y-1 hover:shadow-xl border animate-slide-in-right" style={{ backgroundColor: "white", borderColor: `${h.color}20`, animationDelay: `${x * 0.05}s` }}>
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-50" style={{ background: `linear-gradient(135deg, transparent 30%, ${h.color}15)` }} />
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[14px] bg-white border shadow-sm flex items-center justify-center p-2.5 group-hover:scale-110 transition-transform duration-300 backdrop-blur-md" style={{ borderColor: `${h.color}30` }}>
                      {h.icon()}
                    </div>
                    <span className="text-[#111] font-bold text-[18px] tracking-wide">{h.name}</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666] group-hover:bg-[#111] group-hover:border-[#111] group-hover:text-white group-hover:-rotate-45 transition-all duration-300 shadow-sm border bg-white" style={{ borderColor: `${h.color}30` }}>
                    <ArrowRight size={14} />
                  </div>
                </div>
                <p className="text-[#666] text-[15px] leading-relaxed mb-8 relative z-10 font-medium">{h.desc}</p>
                <div className="flex-1 relative z-10 flex items-center justify-center w-full">
                  {h.graphic(h.color)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-left px-4">
            <Link to="/integrations-info" className="text-[13px] font-bold text-[#666] hover:text-[#111] transition-colors inline-flex items-center gap-2 group tracking-wide">Browse thousands more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-40 px-6 relative z-10 border-t border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-24 reveal-on-scroll">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] mb-8 uppercase tracking-[0.3em]">Target Audience</div>
            <h2 className="text-4xl md:text-7xl font-medium tracking-tighter mb-8 text-[#111] leading-[1.1]">Built for teams that manage <br /> multi-channel marketing.</h2>
            <p className="text-xl text-[#666] font-light max-w-2xl leading-relaxed">Purpose-built for professionals who need reliable, unified reporting across multiple platforms and accounts.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal-on-scroll">
            {[
              { role: "Agencies", sub: "White-Label Solution", title: "Unified Client Control", icon: ShieldCheck, tag: "Branded Reports", color: "#4285F4" },
              { role: "Growth Teams", sub: "Cross-Channel Strategy", title: "Funnel Actuation", icon: Target, tag: "Actionable Insights", color: "#EA4335" },
              { role: "Performance", sub: "Ad Optimization", title: "ROAS & Spend Studio", icon: TrendingUp, tag: "Budget Management", color: "#FBBC05" },
              { role: "Content Hubs", sub: "Distribution & SEO", title: "Omnichannel Studio", icon: BarChart2, tag: "Post Scheduling", color: "#34A853" }
            ].map((h, x) => (
              <FloatingCard key={x} index={x} className="relative overflow-hidden group p-8 rounded-[2.5rem] bg-white border border-[#e5e5e5] hover:border-[#111] hover:bg-[#111] text-[#111] cursor-pointer h-[380px] flex flex-col justify-between transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-[#111] group-hover:text-white mb-1 transition-all duration-700 ease-out">{h.role}</h4>
                    <p className="text-[10px] text-[#999] group-hover:text-white/60 uppercase tracking-wider transition-all duration-700 ease-out">{h.sub}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#f5f5f5] group-hover:bg-white/10 flex items-center justify-center transition-all duration-700 ease-out">
                    <h.icon className="w-5 h-5 text-[#111] group-hover:text-white transition-all duration-700 ease-out" />
                  </div>
                </div>
                <div>
                  <div className="text-[2rem] font-medium tracking-tighter leading-none mb-6 group-hover:text-white transition-all duration-700 ease-out">{h.title}</div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e5e5e5] group-hover:border-white/20 text-[9px] font-bold uppercase tracking-widest group-hover:text-white transition-all duration-700 ease-out">
                    {h.tag} <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent group-hover:bg-white/20 transition-all duration-700 ease-out" />
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 relative z-10 border-y border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-center mb-16 reveal-on-scroll">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e5e5e5] border border-[#e5e5e5] rounded-[2rem] overflow-hidden reveal-on-scroll">
            <div className="bg-white p-12 flex flex-col hover:bg-[#fafafa] transition-colors duration-500">
              <div className="w-12 h-12 rounded-full border border-[#e5e5e5] flex items-center justify-center mb-8"><Database className="w-5 h-5 text-[#4285F4]" /></div>
              <div className="text-xs font-bold text-[#4285F4] mb-4 tracking-widest uppercase">Step 1</div>
              <h3 className="text-2xl font-medium tracking-tight mb-4 text-[#111]">Connect data sources</h3>
              <p className="text-[#666] leading-relaxed">Authorize supported platforms using OAuth or API keys.</p>
            </div>
            <div className="bg-white p-12 flex flex-col hover:bg-[#fafafa] transition-colors duration-500">
              <div className="w-12 h-12 rounded-full border border-[#e5e5e5] flex items-center justify-center mb-8"><MousePointerClick className="w-5 h-5 text-[#EA4335]" /></div>
              <div className="text-xs font-bold text-[#EA4335] mb-4 tracking-widest uppercase">Step 2</div>
              <h3 className="text-2xl font-medium tracking-tight mb-4 text-[#111]">Choose what to track</h3>
              <p className="text-[#666] leading-relaxed">Select accounts, properties, and performance metrics.</p>
            </div>
            <div className="bg-white p-12 flex flex-col hover:bg-[#fafafa] transition-colors duration-500">
              <div className="w-12 h-12 rounded-full border border-[#e5e5e5] flex items-center justify-center mb-8"><PieChart className="w-5 h-5 text-[#FBBC05]" /></div>
              <div className="text-xs font-bold text-[#FBBC05] mb-4 tracking-widest uppercase">Step 3</div>
              <h3 className="text-2xl font-medium tracking-tight mb-4 text-[#111]">Build dashboards and reports</h3>
              <p className="text-[#666] leading-relaxed">Use widgets and charts to create clear, branded reporting views.</p>
            </div>
            <div className="bg-white p-12 flex flex-col hover:bg-[#fafafa] transition-colors duration-500">
              <div className="w-12 h-12 rounded-full border border-[#e5e5e5] flex items-center justify-center mb-8"><Send className="w-5 h-5 text-[#34A853]" /></div>
              <div className="text-xs font-bold text-[#34A853] mb-4 tracking-widest uppercase">Step 4</div>
              <h3 className="text-2xl font-medium tracking-tight mb-4 text-[#111]">Share insights</h3>
              <p className="text-[#666] leading-relaxed">Export reports or schedule delivery for clients and internal teams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts Section */}
      <section id="alerts" className="py-40 px-6 relative z-10 overflow-hidden border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="reveal-on-scroll">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] mb-8 uppercase tracking-[0.3em]">Proactive Monitoring</div>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-8 text-[#111] leading-[1.1]">Stay ahead with <br /> real-time alerts.</h2>
              <p className="text-xl text-[#666] font-light leading-relaxed mb-12">Configure smart triggers to monitor budget caps, performance spikes, or drops in conversion across all your client accounts. Never miss a critical shift again.</p>
              <div className="space-y-6">
                {[
                  { title: "Performance Alerts", desc: "Threshold-based triggers for shifts in your key metrics." },
                  { title: "Budget Guardians", desc: "Stop overspending with instant notifications on ad spend." },
                  { title: "KPI Thresholds", desc: "Get alerted when goals are met or performance dips." }
                ].map((h, x) => (
                  <div key={x} className="flex gap-4 group">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-[#f5f5f5] group-hover:bg-[#111] flex items-center justify-center transition-all">
                      <ShieldCheck className="w-4 h-4 text-[#111] group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111] text-sm mb-1">{h.title}</h4>
                      <p className="text-sm text-[#666]">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative reveal-scale">
              <div className="bg-white rounded-[2.5rem] border border-[#f0f0f0] p-8 shadow-2xl shadow-zinc-200/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-red-500 fill-red-500" />
                    </div>
                    <span className="font-bold text-sm">Active Trigger</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Just Now</span>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 mb-6">
                  <h4 className="font-bold text-zinc-900 mb-2">Budget Threshold Exceeded</h4>
                  <p className="text-sm text-zinc-600">Client: <span className="font-bold">Acme Global</span> · Meta Ads spend reached 90% of monthly budget.</p>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 h-12 rounded-xl bg-[#111] text-white font-bold text-xs">View Report</Button>
                  <Button variant="secondary" className="flex-1 h-12 rounded-xl text-xs font-bold">Dismiss</Button>
                </div>
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#4285F4] opacity-10 blur-[100px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Security & Permissions */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="reveal-on-scroll mb-24">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-[#111] mb-6">Why we request access to your data.</h2>
              <p className="text-lg text-[#666] font-light leading-relaxed">GreyCats Analytics requests only the permissions required to read analytics and reporting data from platforms you explicitly connect.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-10 rounded-[3rem] bg-white border border-[#f0f0f0] relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center"><Database className="w-5 h-5 text-white" /></div>
                  <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-[#111]">We use this access to:</h4>
                </div>
                <ul className="space-y-6">
                  {[
                    { icon: PieChart, text: "Display your dashboard metrics and trends visually." },
                    { icon: Send, text: "Generate professional branded reports from your data." },
                    { icon: Database, text: "Keep your connected data sources updated automatically." }
                  ].map((h, x) => (
                    <li key={x} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white border border-[#f0f0f0] flex items-center justify-center shrink-0 mt-0.5"><h.icon className="w-3.5 h-3.5 text-[#111]" /></div>
                      <span className="text-[#111] font-medium leading-tight">{h.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-10 rounded-[3rem] bg-white border border-[#f0f0f0] relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center"><X className="w-5 h-5 text-white" /></div>
                  <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-[#111]">We do not:</h4>
                </div>
                <ul className="space-y-6">
                  {[
                    { icon: Lock, text: "Use connected data for any unrelated purposes." },
                    { icon: ShieldCheck, text: "Share your analytics data with third parties." },
                    { icon: Target, text: "Use your data for advertising or AI training models." }
                  ].map((h, x) => (
                    <li key={x} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white border border-[#f0f0f0] flex items-center justify-center shrink-0 mt-0.5"><h.icon className="w-3.5 h-3.5 text-[#111]" /></div>
                      <span className="text-[#111] font-medium leading-tight">{h.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center p-8 bg-white rounded-[2rem] border border-[#f0f0f0] max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-[#111] font-medium text-lg">Manage or disconnect your integrations at any time.</p>
              <div className="flex gap-4">
                <Link to="/privacy-policy" className="text-xs font-bold uppercase tracking-widest text-[#111] hover:underline">Privacy Policy</Link>
                <Link to="/cookies" className="text-xs font-bold uppercase tracking-widest text-[#111] hover:underline">Cookie Policy</Link>
              </div>
            </div>
          </div>
          <div id="security" className="reveal-on-scroll bg-white p-8 sm:p-12 md:p-16 rounded-[3rem] border border-[#f0f0f0] shadow-sm mt-12 md:mt-24">
            <div className="grid lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-2">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-[#111] mb-8">Security and privacy by design.</h2>
                <p className="text-xl text-[#666] leading-relaxed font-light mb-10">GreyCats Analytics uses authenticated access controls and encrypted data transmission to protect account and integration data.</p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/privacy-policy" className="inline-flex items-center px-6 py-3 rounded-full border border-[#f0f0f0] hover:border-[#111] text-[10px] font-bold uppercase tracking-widest transition-all">Privacy Policy</Link>
                  <Link to="/terms-of-service" className="inline-flex items-center px-6 py-3 rounded-full border border-[#f0f0f0] hover:border-[#111] text-[10px] font-bold uppercase tracking-widest transition-all">Terms of Service</Link>
                  <Link to="/contact" className="inline-flex items-center px-6 py-3 rounded-full border border-[#f0f0f0] hover:border-[#111] text-[10px] font-bold uppercase tracking-widest transition-all">Support</Link>
                </div>
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "OAuth 2.0 Auth", desc: "No passwords stored for integrations.", icon: Lock, color: "#111" },
                  { title: "E2E Encryption", desc: "Data is encrypted during transmission.", icon: ShieldCheck, color: "#111" },
                  { title: "Role-Based Access", desc: "Granular control over team permissions.", icon: BarChart2, color: "#111" },
                  { title: "Regular Audits", desc: "Consistent security checks and logging.", icon: Database, color: "#111" }
                ].map((h, x) => (
                  <div key={x} className="p-8 bg-white rounded-[2.5rem] border border-[#f0f0f0] hover:border-[#111] transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#f0f0f0] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <h.icon className="w-5 h-5" style={{ color: h.color }} />
                    </div>
                    <h4 className="text-xl font-medium mb-2 text-[#111]">{h.title}</h4>
                    <p className="text-sm text-[#666] font-light leading-relaxed">{h.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-6 relative z-10 border-t border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden reveal-scale flex flex-col items-center origin-center border border-[#f0f0f0] bg-white">
            <div className="flex flex-col items-center w-full relative z-10">
              <h4 className="text-xs font-bold text-[#111] uppercase tracking-[0.3em] mb-8">Built for teams that manage multi-channel marketing</h4>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-medium tracking-tighter mb-8 text-[#111] max-w-4xl leading-[1.1]">Ready to simplify your reporting workflow?</h2>
              <p className="text-xl text-[#666] mb-12 max-w-3xl font-light leading-relaxed">Ideal for marketing agencies, in-house growth teams, performance marketers, and analysts who need reliable reporting across multiple platforms, accounts, and clients.</p>
              <div className="flex justify-center relative z-10 mt-8">
                <Link to={isAuth ? "/clients" : "/pricing"} className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full px-16 py-6 text-xl font-semibold hover:bg-[#333] hover:scale-105 border-none shadow-none">
                    {isAuth ? "Go to Dashboard" : "Start Free Trial"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
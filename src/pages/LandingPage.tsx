import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoBlack from "../assets/images/greycats-black-logo.png";
import { isAuthenticated, StorageKey } from "@/utils/storage";
import ParticleBackground from "@/components/ParticleBackground";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, 
  Database, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  Menu,
  X,
  PieChart,
  Lock,
  Send,
  MousePointerClick,
  Users,
  Target,
  TrendingUp,
  Presentation,
  Star,
  ArrowUpRight
} from "lucide-react";

// Custom Button - Antigravity Style (Flat, High Contrast)
const Button = ({ children, onClick, className, variant = "primary" }: { children: React.ReactNode, onClick?: () => void, className?: string, variant?: "primary" | "secondary" | "ghost" }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300";
  const variants = {
    primary: "bg-[#111] text-white hover:bg-[#333]",
    secondary: "bg-white text-[#111] border border-[#e5e5e5] hover:border-[#111]",
    ghost: "text-[#666] hover:text-[#111] hover:bg-gray-100"
  };
  
  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authed = isAuthenticated(StorageKey.ANALYTICS_TOKEN);
  const [activeTab, setActiveTab] = useState("Client");
  const [activeIntegrationCategory, setActiveIntegrationCategory] = useState("Analytics");
  const tabs = ["Client", "Social media", "Broadcast", "Report", "AI Suite"];
  
  useEffect(() => {
    const autoPlayTabs = ["Client", "Social media", "Broadcast", "Report", "AI Suite"];
    const timer = setTimeout(() => {
      setActiveTab((current) => {
        const currentIndex = autoPlayTabs.indexOf(current);
        return autoPlayTabs[(currentIndex + 1) % autoPlayTabs.length];
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeTab]);
  
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll Reveals
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -100px 0px" });

    document.querySelectorAll(".reveal-on-scroll, .reveal-from-left, .reveal-from-right, .reveal-scale").forEach(el => observer.observe(el));

    // Mouse Move Spotlight Animation
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        const x = e.clientX;
        const y = e.clientY;
        
        // Dotted glow background (Black version)
        spotlightRef.current.style.background = `
          radial-gradient(600px circle at ${x}px ${y}px, rgba(0, 0, 0, 0.05), transparent 40%),
          radial-gradient(rgba(0, 0, 0, 0.4) 1.5px, transparent 1.5px)
        `;
        spotlightRef.current.style.backgroundSize = `100% 100%, 24px 24px`;
        
        spotlightRef.current.style.webkitMaskImage = `radial-gradient(400px circle at ${x}px ${y}px, black 10%, transparent 100%)`;
        spotlightRef.current.style.maskImage = `radial-gradient(400px circle at ${x}px ${y}px, black 10%, transparent 100%)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  const integrations = [
    { 
      name: "Google Analytics", 
      color: "#F9AB00",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path fill="#F9AB00" d="M12 2L2 19h20L12 2zm0 4.5L18.5 17h-13L12 6.5z"/>
          <path fill="#E37400" d="M12 2L2 19h10V2z"/>
        </svg>
      )
    },
    { 
      name: "Search Console", 
      color: "#4285F4",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path fill="#4285F4" d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path fill="#34A853" d="M2 17l10 5 10-5"/>
          <path fill="#FBBC05" d="M2 12l10 5 10-5"/>
        </svg>
      )
    },
    { 
      name: "YouTube", 
      color: "#EA4335",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    { 
      name: "Google Ads", 
      color: "#FBBC05",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path fill="#FBBC05" d="M15.5 2.5l-9 15.5 3 5 9-15.5z"/>
          <path fill="#4285F4" d="M6.5 18h12v5h-12z"/>
          <path fill="#34A853" d="M6.5 18l-3 5h3z"/>
        </svg>
      )
    },
    { 
      name: "Meta Ads", 
      color: "#0668E1",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#0668E1">
          <path d="M16.48 5.42c-1.39 0-2.58.64-3.4 1.76-1.12-1.48-2.61-2.12-4.04-2.12-2.91 0-5.11 2.37-5.11 5.4 0 2.94 2.1 5.39 5.01 5.39 1.48 0 2.76-.71 3.57-1.92.93 1.34 2.31 2.29 4.19 2.29 2.8 0 4.88-2.22 4.88-5.3 0-3-.95-5.5-5.1-5.5zm-5.69 10.42c-2.07 0-3.41-1.63-3.41-3.48 0-2.11 1.5-3.35 3.19-3.35.79 0 1.57.25 2.19.89-1 1.76-1.57 4-1.97 5.94zm5.83-1.01c-.57 0-1.21-.19-1.66-.6l1.32-4.8c.17.06.35.09.53.09 1.59 0 2.85 1.58 2.85 3.39 0 1.31-.83 1.92-3.04 1.92z"/>
        </svg>
      )
    },
    { 
      name: "Facebook", 
      color: "#1877F2",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: "Instagram", 
      color: "#E4405F",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <defs>
            <radialGradient id="ig-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(45) scale(33.9411)">
              <stop offset="0" stopColor="#fed373"/>
              <stop offset="0.25" stopColor="#f15245"/>
              <stop offset="0.5" stopColor="#d92e7f"/>
              <stop offset="0.75" stopColor="#9b36b7"/>
              <stop offset="1" stopColor="#515ecf"/>
            </radialGradient>
          </defs>
          <path fill="url(#ig-grad)" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126s1.337 1.078 2.126 1.384c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384s1.078-1.337 1.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126s-1.337-1.078-2.126-1.384c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.58.016 4.85.071 1.17.054 1.805.249 2.227.412.562.218.96.478 1.381.9.422.421.682.819.9 1.381.164.422.359 1.057.413 2.227.057 1.27.07 1.646.07 4.85s-.015 3.58-.07 4.85c-.054 1.17-.249 1.805-.413 2.227-.218.562-.478.96-.9 1.381-.421.422-.819.682-1.381.9-.422.164-1.057.359-2.227.413-1.27.057-1.646.07-4.85.07s-3.58-.015-4.85-.07c-1.17-.054-1.805-.249-2.227-.413-.562-.218-.96-.478-1.381-.9-.421-.421-.682-.819-.9-1.381-.164-.422-.359-1.057-.413-2.227-.057-1.27-.07-1.646-.07-4.85s.012-3.58.07-4.85c.054-1.17.249-1.805.413-2.227.218-.562.478-.96.9-1.381.422-.421.819-.682 1.381-.9.422-.164 1.057-.359 2.227-.413 1.27-.057 1.646-.07 4.85-.07zM12 5.837a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-9.845a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88z"/>
        </svg>
      )
    },
    { 
      name: "Shopify", 
      color: "#95BF47",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path fill="#95BF47" d="M18.8 6.5l-4.2-1.1L12 1.1 9.4 5.4l-4.2 1.1-1.3 11 8.1 4.4 8.1-4.4-1.3-11z"/>
          <path fill="#5E8E3E" d="M12 1.1l2.6 4.3 4.2 1.1-1.3 11-8.1 4.4L12 21.4V1.1z" opacity=".2"/>
          <path fill="white" d="M11.9 16.5c-2.3 0-3.6-1.3-3.6-3.1 0-1.4.5-2.2 1.4-3.1.4-.4.9-.9 1.8-.9.9 0 1.8.4 1.8 1.4.5.5.5 1 .5 1.4v1.8c0 1.3-.9 2.3-1.9 2.6v-.1z"/>
        </svg>
      )
    },
    {
      name: "WooCommerce",
      color: "#7F54B3",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path fill="#7F54B3" d="M2.2 4h19.6c1.2 0 2.2 1 2.2 2.2v8.7c0 1.2-1 2.2-2.2 2.2H14.8l1 3.4-6.2-3.4H2.2C1 17.1 0 16.1 0 14.9V6.2C0 5 1 4 2.2 4z"/>
          <path fill="#FFFFFF" d="M3.6 8.4c.2-.3.6-.5 1-.5.7-.1 1.1.3 1.2 1 .3 1.8.5 3.3.9 4.5l2.1-4c.2-.4.4-.6.7-.6.4 0 .7.3.8.8.2 1.2.5 2.2.9 3.1.2-2.2.6-3.8 1.2-4.8.1-.2.3-.4.6-.4.2 0 .4.1.6.2.2.1.3.3.3.6 0 .2 0 .3-.1.5-.3.6-.6 1.6-.8 3-.2 1.4-.3 2.5-.3 3.2 0 .2 0 .4-.1.5-.1.2-.3.3-.5.3-.3 0-.5-.1-.8-.4-.9-.9-1.6-2.3-2.1-4.1-.6 1.3-1.1 2.2-1.4 2.8-.6 1.1-1.1 1.6-1.5 1.7-.3 0-.5-.2-.7-.7-.6-1.5-1.2-4.4-1.9-8.7 0-.2.1-.4.2-.5z"/>
        </svg>
      )
    },
    { 
      name: "LinkedIn", 
      color: "#0A66C2",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#0A66C2">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      name: "Telegram",
      color: "#229ED9",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#229ED9">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 7.007l-2.012 9.487c-.15.674-.551.841-1.116.523l-3.07-2.261-1.482 1.426c-.164.164-.301.301-.617.301l.221-3.131 5.7-5.15c.248-.221-.053-.344-.385-.123l-7.045 4.434-3.036-.949c-.661-.207-.674-.661.138-.977l11.868-4.573c.551-.207 1.034.123.832.997z"/>
        </svg>
      )
    },
    {
      name: "WordPress",
      color: "#21759b",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#21759b">
          <path d="M12.158 12.786l-2.698 7.84c.806.236 1.657.365 2.54.365 1.047 0 2.05-.18 2.986-.51-.024-.037-.046-.078-.065-.123l-2.763-7.572zm5.723-6.605c-.15 0-.3.008-.452.025.26.54.406 1.137.406 1.765 0 1.258-.65 2.278-1.573 3.414l-2.023 2.56-3.08-8.625c.783-.162 1.6-.247 2.44-.247 1.542 0 3.012.308 4.354.872-.023-.053-.047-.107-.072-.164zm-5.88 0c-.84 0-1.658.085-2.44.248l3.08 8.626 2.024-2.56c.923-1.137 1.573-2.157 1.573-3.415 0-.628-.146-1.226-.406-1.766-.15-.017-.302-.025-.452-.025zm11.233 5.819c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-3.09 0c0-3.64-2.31-6.732-5.59-8.118l-1.925 5.39 3.047 8.527c2.613-1.424 4.468-4.323 4.468-7.799zm-13.82-3.834c-1.393 1.83-2.226 4.14-2.226 6.653 0 2.26.696 4.357 1.88 6.082l3.412-9.55c-.24-.265-.436-.576-.566-.92l-2.5-2.265z"/>
        </svg>
      )
    },
    {
      name: "WhatsApp",
      color: "#25D366",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      )
    },
    {
      name: "SMS",
      color: "#8A2BE2",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#8A2BE2">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      )
    },
    {
      name: "Email",
      color: "#D44638",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#D44638">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      )
    }
  ];

  const TiltCard = ({ children, className, index }: { children: React.ReactNode, className?: string, index: number }) => {
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



  return (
    <div className="min-h-[100dvh] bg-white text-[#111] font-sans selection:bg-[#4285F4] selection:text-white overflow-x-hidden relative">
      
      {/* Dynamic Mouse Particle Background */}
      <ParticleBackground />

      {/* Dynamic Background Spotlight element */}
      <div 
        ref={spotlightRef}
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #ffffff; }
        

        /* Minimalist Grid Pattern */
        .bg-grid-dots { 
          background-image: radial-gradient(#e5e5e5 1px, transparent 1px);
          background-size: 30px 30px;
        }
        
        /* Editorial Scroll Reveals */
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(60px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-on-scroll.is-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        .reveal-from-left {
          opacity: 0;
          transform: translate(-60px, 40px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-from-left.is-revealed {
          opacity: 1;
          transform: translate(0, 0);
        }
        
        .reveal-from-right {
          opacity: 0;
          transform: translate(60px, 40px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-from-right.is-revealed {
          opacity: 1;
          transform: translate(0, 0);
        }

        /* Marquee */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }

        /* Floating Card Animations */
        @keyframes float-card {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-20px) rotateX(2deg); }
        }
        .animate-float-card {
          animation: float-card 6s ease-in-out infinite;
        }
        .paused-on-hover:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Full-width Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-[#e5e5e5] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoBlack} alt="GreyCats" className="h-8 w-auto" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-sm font-semibold text-[#666] hover:text-[#111] transition-colors">Plans</Link>
            <Link to="/contact" className="text-sm font-semibold text-[#666] hover:text-[#111] transition-colors">Support</Link>
            <div className="flex items-center gap-2">
              {authed ? (
                <Button onClick={() => navigate("/clients")} className="px-5 py-2.5 text-sm">
                  Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Link to="/auth/login" className="px-4 py-2 text-sm font-semibold text-[#111] hover:text-[#4285F4] transition-colors">Sign in</Link>
                  <Link to="/pricing">
                    <Button className="px-5 py-2.5 text-sm font-semibold bg-[#4285F4] hover:bg-[#3367D6] text-white border-none">Start Free Trial</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <button className="md:hidden text-[#111]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-24 px-6 flex flex-col gap-6">
          <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-[#111]">Plans</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-[#111]">Support</Link>
          <div className="h-px w-full bg-[#e5e5e5] my-4" />
          {authed ? (
            <Button onClick={() => { navigate("/clients"); setIsMenuOpen(false); }} className="w-full py-4 text-lg">
              Go to Dashboard
            </Button>
          ) : (
            <div className="flex flex-col gap-4">
              <Link to="/auth/login"><Button variant="secondary" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-lg">Sign in</Button></Link>
              <Link to="/pricing"><Button onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-lg bg-[#4285F4] text-white hover:bg-[#3367D6]">Start Free Trial</Button></Link>
            </div>
          )}
        </div>
      )}

      {/* New Minimal Hero Section */}
      <section className="relative pt-32 pb-20 flex flex-col items-center overflow-hidden z-10">
        {/* White top that fades into the transparent background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-transparent pointer-events-none -z-10" />
        
        {/* Cinematic Background Layers - Balanced Visibility */}
        <div className="absolute inset-0 bg-grid-dots opacity-45 pointer-events-none mask-image-[linear-gradient(to_bottom,white,transparent)]" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }} />
        
        {/* Softer Dynamic Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(66,133,244,0.04),transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#4285F4] opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-4 mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] mb-8 md:mb-12 uppercase tracking-[0.3em] cursor-pointer hover:bg-[#f4f4f5] transition-colors">
            GreyCats Analytics
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tighter mb-8 leading-[1.1] text-[#111] px-4">
            All your marketing data. <br /> One clear reporting platform.
          </h1>
          
          <p className="text-lg md:text-2xl text-[#111] mb-12 max-w-4xl mx-auto leading-relaxed font-semibold px-4">
            Connect channels, track KPIs, and deliver client-ready reports faster.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link to={authed ? "/clients" : "/pricing"}>
              <button className="inline-flex items-center justify-center rounded-lg text-[15px] font-medium transition-all duration-200 ease-in-out h-11 px-6 bg-[#18181b] text-white hover:bg-[#27272a] shadow-sm">
                {authed ? "Go to Dashboard" : "Start for free"}
              </button>
            </Link>
            <Link to="/contact">
              <button className="inline-flex items-center justify-center rounded-lg text-[15px] font-medium transition-all duration-200 ease-in-out h-11 px-6 bg-white text-[#18181b] border border-[#e4e4e7] hover:bg-[#f4f4f5]">
                Contact us
              </button>
            </Link>
          </div>
        </div>

        {/* Tabbed UI Mockup */}
        <div className="w-full max-w-[1200px] mx-auto px-4 mb-24">
          
          {/* Tabs */}
          <div className="flex justify-center border-b border-[#e4e4e7] mb-0 relative">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-medium relative transition-colors ${
                  activeTab === tab 
                    ? "text-[#18181b]" 
                    : "text-[#71717a] hover:text-[#18181b]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="tab-underline"
                    className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#e4e4e7] overflow-hidden" 
                  >
                    <motion.div
                      key={activeTab}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4, ease: "linear" }}
                      className="h-full bg-[#18181b]"
                    />
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          {/* Mockup Container with Bottom Fade */}
          <div className="relative mt-8">
            <div className="w-full bg-white border border-[#e4e4e7] rounded-t-xl rounded-b-none shadow-sm h-[500px] flex overflow-hidden text-left">
            
            {/* Sidebar Mockup */}
            <div className="w-64 border-r border-[#e4e4e7] bg-[#fafafa] flex flex-col pt-4 overflow-y-auto overflow-x-hidden pb-4 custom-scrollbar">
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
                ].map((section, idx) => (
                  <div key={idx}>
                    <div className="px-3 mb-1 text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                      {section.group}
                    </div>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isHighlighted = 
                          (activeTab === "Client" && item === "Clients") ||
                          (activeTab === "Social media" && item === "Social Media") ||
                          (activeTab === "Broadcast" && item === "WhatsApp") ||
                          (activeTab === "Report" && item === "Reports") ||
                          (activeTab === "AI Suite" && item === "AI Suite");
                          
                        return (
                          <motion.div 
                            key={item} 
                            whileHover={{ scale: 1.02, x: 2 }}
                            className={`px-3 py-1.5 text-[13px] rounded-md cursor-pointer flex items-center gap-2 transition-colors ${
                              isHighlighted 
                                ? "bg-[#e4e4e7]/80 text-[#18181b] font-semibold shadow-sm" 
                                : "text-[#71717a] hover:bg-[#e4e4e7]/50 hover:text-[#18181b]"
                            }`}
                          >
                             {isHighlighted && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>}
                             <span className={!isHighlighted ? "ml-2.5" : ""}>{item}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Mockup */}
            <div className="flex-1 bg-white p-8 relative overflow-y-auto overflow-x-hidden custom-scrollbar">
              <div className="flex items-center justify-between mb-8 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#18181b] text-lg">{activeTab} view</span>
                  <span className="text-[#a1a1aa] px-1.5 py-0.5 border border-[#e4e4e7] rounded text-xs bg-gray-50">⌘ K</span>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-[#18181b] text-white rounded-md text-xs font-medium shadow-sm">
                  Create New
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="h-full"
                >
                  {activeTab === "Client" && (
                    <div className="border border-[#e4e4e7] rounded-xl overflow-hidden bg-white shadow-sm">
                       <div className="bg-[#fafafa] border-b border-[#e4e4e7] flex px-4 py-3 text-xs font-semibold text-[#71717a]">
                          <div className="w-8"></div>
                          <div className="flex-1">Company</div>
                          <div className="flex-1">Domains</div>
                          <div className="flex-1">Integrations</div>
                          <div className="w-32">Status</div>
                       </div>
                       {[
                         { name: "Vercel", domain: "vercel.com", ints: 4, status: "Excellent", color: "text-purple-700 bg-purple-50" },
                         { name: "DigitalOcean", domain: "digitalocean.com", ints: 2, status: "Medium", color: "text-blue-700 bg-blue-50" },
                         { name: "GitHub", domain: "github.com", ints: 6, status: "Good", color: "text-emerald-700 bg-emerald-50" },
                         { name: "Stripe", domain: "stripe.com", ints: 3, status: "Evaluating", color: "text-[#71717a] bg-[#f4f4f5]" },
                       ].map((row, i) => (
                         <motion.div 
                           initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + 0.1 }}
                           key={i} 
                           className="border-b border-[#e4e4e7] last:border-0 flex px-4 py-3.5 text-sm items-center hover:bg-gray-50 transition-colors cursor-pointer group"
                         >
                            <div className="w-8"><div className="w-4 h-4 border border-[#e4e4e7] rounded-[4px] group-hover:border-gray-400 transition-colors"></div></div>
                            <div className="flex-1 font-medium flex items-center gap-3 text-[#18181b]">
                               <div className="w-6 h-6 bg-[#18181b] rounded-md flex items-center justify-center text-white text-[10px] shadow-sm">{row.name[0]}</div>
                               {row.name}
                            </div>
                            <div className="flex-1 text-[#4285F4] text-xs"><span className="px-2.5 py-1 bg-[#4285F4]/10 rounded-full font-medium">{row.domain}</span></div>
                            <div className="flex-1 text-[#71717a] text-xs flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-full"></div> {row.ints} Connected</div>
                            <div className="w-32"><span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${row.color}`}>{row.status}</span></div>
                         </motion.div>
                       ))}
                    </div>
                  )}

                  {activeTab === "Social media" && (
                    <div className="h-full flex flex-col">
                       <div className="text-[#18181b] font-medium mb-4 flex items-center gap-2">
                         Post Scheduler <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full uppercase tracking-wider font-bold">Active</span>
                       </div>
                       <div className="flex gap-6">
                          <motion.div whileHover={{ y: -2 }} className="w-72 h-72 border border-[#e4e4e7] rounded-xl p-5 bg-[#fafafa] shadow-sm flex flex-col relative overflow-hidden">
                             <div className="flex items-center gap-3 mb-4">
                               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
                               <div>
                                 <div className="w-20 h-2 bg-gray-300 rounded mb-1"></div>
                                 <div className="w-12 h-1.5 bg-gray-200 rounded"></div>
                               </div>
                             </div>
                             <div className="w-full h-32 bg-white border border-[#e4e4e7] rounded-lg mb-3 shadow-sm"></div>
                             <div className="w-3/4 h-2 bg-gray-300 rounded mb-1.5"></div>
                             <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                          </motion.div>
                          <div className="flex-1 border border-[#e4e4e7] rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between">
                             <div className="space-y-4">
                               <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
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
                        {[1, 2, 3].map((i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-4 bg-white border border-[#e4e4e7] rounded-lg flex justify-between items-center shadow-sm hover:shadow transition-shadow cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${i===1?'bg-blue-500':i===2?'bg-purple-500':'bg-orange-500'}`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[#18181b]">Newsletter Q{i}</div>
                                <div className="text-xs text-gray-500">Sent to 4,2{i}0 subscribers</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">{60 + i * 5}% Open</div>
                              <div className="text-xs text-gray-400">2h ago</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "Report" && (
                    <div className="grid grid-cols-2 gap-4 h-[calc(100%-2rem)]">
                      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="border border-[#e4e4e7] rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
                        <div className="text-xs font-medium text-gray-500">Total Revenue</div>
                        <div className="text-3xl font-bold text-[#18181b] mt-2">$124,500</div>
                        <div className="mt-4 h-24 bg-gradient-to-t from-green-50 to-transparent flex items-end rounded-lg">
                          <div className="w-full flex justify-between items-end h-full gap-1 px-2">
                            {[40, 60, 45, 80, 65, 90, 100].map((h, i) => <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.2 + (i*0.05), type: "spring" }} key={i} className="w-full bg-green-400 rounded-t-sm"></motion.div>)}
                          </div>
                        </div>
                      </motion.div>
                      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="border border-[#e4e4e7] rounded-xl p-5 bg-[#fafafa] shadow-sm flex flex-col hover:shadow transition-shadow">
                        <div className="text-xs font-medium text-gray-500">Conversion Rate</div>
                        <div className="text-3xl font-bold text-[#18181b] mt-2">4.2%</div>
                        <div className="flex-1 mt-4 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400 bg-white shadow-sm">
                          Funnel Analysis Dashboard
                        </div>
                      </motion.div>
                    </div>
                  )}
                  
                  {activeTab === "AI Suite" && (
                    <div className="flex flex-col h-full border border-[#e4e4e7] rounded-xl overflow-hidden bg-white shadow-sm relative">
                       <div className="p-4 border-b border-[#e4e4e7] bg-[#fafafa] flex items-center gap-2">
                         <span className="text-lg">✨</span>
                         <span className="font-semibold text-sm text-[#18181b]">GreyCats Intelligence</span>
                       </div>
                       <div className="flex-1 p-6 flex flex-col justify-end space-y-4">
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="self-end max-w-[80%] bg-[#18181b] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm shadow-sm">
                           How do I win my deal with Greenleaf?
                         </motion.div>
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="self-start max-w-[80%] bg-[#f4f4f5] text-[#18181b] px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-[#e4e4e7] shadow-sm">
                           <div className="flex gap-2 items-center mb-2">
                             <div className="w-4 h-4 rounded bg-purple-100 flex items-center justify-center text-[10px]">✨</div>
                             <span className="font-semibold text-xs">Analysis</span>
                           </div>
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
            {/* Close Flex Container */}
          </div>
            
          {/* Bottom Fade Overlay to merge with background */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none rounded-b-xl" />
        </div>
      </div>
      </section>

      {/* What We Do - Verified & Static Content */}
      <section id="product" className="py-40 px-6 relative z-10 overflow-hidden">
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center px-5 py-2 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] mb-12 uppercase tracking-[0.3em]">
                Platform Capabilities
              </div>
              <h2 className="text-5xl md:text-7xl font-medium tracking-tight text-[#111] mb-10 leading-[1.05]">
                What GreyCats <br /> Analytics does.
              </h2>
              <p className="text-xl text-[#666] font-light leading-relaxed mb-12 max-w-xl">
                Unify marketing data across platforms, build custom dashboards and reports, and deliver insights to clients on a schedule.
              </p>
              
              <div className="space-y-8 mb-14">
                {[
                  { title: "Unified Data Layer", desc: "Single batch resolver fetches metrics across all connected integrations in one request." },
                  { title: "Scheduled Delivery", desc: "Automate PDF report generation and white-labelled client distribution." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-[#4285F4]/10 flex items-center justify-center mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4285F4]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111] text-sm mb-1">{item.title}</h4>
                      <p className="text-sm text-[#666]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-8">
                <Link to="/contact">
                  <button className="px-8 py-4 bg-white border border-[#e4e4e7] text-[#18181b] rounded-full font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    Contact us
                  </button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#FBBC05] text-[#FBBC05]" />
                    <span className="font-bold text-[#111]">Verified</span>
                  </div>
                  <span className="h-4 w-px bg-[#e5e5e5]" />
                  <span className="text-xs text-[#999] font-medium uppercase tracking-wider">Multi-Platform</span>
                </div>
              </div>
            </div>

            {/* Right Content - Static Minimalist Layout */}
            <div className="relative">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-[#f0f0f0]">
                <img 
                  src="/about-hero.png" 
                  alt="GreyCats Analytics Interface" 
                  className="w-full h-auto object-cover aspect-[4/5]"
                />
              </div>
              
              {/* Static Glass Card 1 */}
              <div className="absolute -top-10 -right-8 z-20 bg-white/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/40 max-w-[200px]">
                <div className="text-4xl font-medium text-[#111] mb-2 tracking-tighter">10+</div>
                <div className="text-[9px] font-bold text-[#111] uppercase tracking-[0.2em]">Supported Integrations</div>
              </div>

              {/* Static Glass Card 2 */}
              <div className="absolute -bottom-8 -left-8 z-20 bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 min-w-[280px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#111]">Batch Resolver</div>
                    <div className="text-[10px] text-[#666] font-medium tracking-wide">Optimized Data Fetching</div>
                  </div>
                </div>
              </div>

              {/* Minimalist Grid Underlay */}
              <div className="absolute -z-10 -top-12 -left-12 w-48 h-48 bg-grid-dots opacity-40" />
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Bento Cards Slider */}
      <section id="integrations" className="py-24 relative z-10 overflow-hidden border-y border-[#f0f0f0]">
        <style>{`
          #integrations-slider::-webkit-scrollbar { display: none; }
        `}</style>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 reveal-on-scroll gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111] mb-2">
                There's an integration for that.
              </h2>
              <p className="text-[#666] text-lg font-medium">
                Use your favorite tools without even opening them.
              </p>
            </div>
            
            {/* Category Tabs & Arrows */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="hidden md:flex flex-wrap gap-1 items-center bg-[#f5f5f5] p-1.5 rounded-full border border-[#e5e5e5]">
                {["Analytics", "Scheduler", "Broadcast"].map((cat, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveIntegrationCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeIntegrationCategory === cat ? "bg-white text-[#111] shadow-sm border border-[#e5e5e5]" : "text-[#666] hover:text-[#111]"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => document.getElementById('integrations-slider')?.scrollBy({ left: -350, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full border border-[#e5e5e5] bg-white flex items-center justify-center text-[#111] hover:bg-[#f5f5f5] transition-colors shadow-sm hover:scale-105"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button 
                  onClick={() => document.getElementById('integrations-slider')?.scrollBy({ left: 350, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full border border-[#e5e5e5] bg-white flex items-center justify-center text-[#111] hover:bg-[#f5f5f5] transition-colors shadow-sm hover:scale-105"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(50px); }
              to { opacity: 1; transform: translateX(0); }
            }
            .animate-slide-in-right {
              animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
            }
          `}</style>
          <div id="integrations-slider" className="flex overflow-x-auto gap-6 reveal-on-scroll pb-12 pt-4 -mx-6 px-6 sm:mx-0 sm:px-0 snap-x snap-proximity scroll-smooth transition-all duration-500" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
            {[
              {
                name: "Google Analytics",
                category: "Analytics",
                color: "#F9AB00",
                desc: "Track website traffic and user behavior effortlessly in one unified dashboard.",
                graphic: (color: string) => (
                  <div className="w-full h-28 flex items-end justify-between px-4 gap-2">
                    {[30, 50, 40, 70, 55, 90].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm transition-all duration-500 group-hover:scale-y-110 origin-bottom" style={{ height: `${h}%`, backgroundColor: color, opacity: 0.2 + (i * 0.15) }}></div>
                    ))}
                  </div>
                )
              },
              {
                name: "Search Console",
                category: "Analytics",
                color: "#4285F4",
                desc: "Monitor and optimize your site's presence in Google Search results directly.",
                graphic: (color: string) => (
                   <div className="w-full relative h-32 rounded-xl border overflow-hidden flex items-center px-4" style={{ borderColor: `${color}20`, backgroundColor: `${color}05` }}>
                     <div className="w-full opacity-70 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 mb-3">
                           <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: color }}>G</div>
                           <div className="w-24 h-2 rounded-full" style={{ backgroundColor: `${color}20` }}></div>
                        </div>
                        <div className="pl-7 space-y-2">
                           <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: `${color}40` }}></div>
                           <div className="w-2/3 h-1.5 rounded-full" style={{ backgroundColor: `${color}20` }}></div>
                        </div>
                     </div>
                   </div>
                )
              },
              {
                name: "Google Ads",
                category: "Analytics",
                color: "#FBBC05",
                desc: "Track ad spend, conversions, and keyword performance in real time.",
                graphic: (color: string) => (
                  <div className="relative w-full h-24 flex items-center justify-center">
                     <div className="absolute inset-0 flex flex-col justify-end px-8 pb-4 gap-2">
                        {[40, 70, 100].map((w, i) => (
                           <div key={i} className="h-4 rounded-r-md group-hover:scale-x-110 origin-left transition-transform duration-500" style={{ width: `${w}%`, backgroundColor: color, opacity: 0.4 + (i * 0.2) }}></div>
                        ))}
                     </div>
                  </div>
                )
              },
              {
                name: "YouTube",
                category: "Analytics",
                color: "#EA4335",
                desc: "Analyze video views, subscriber growth, and audience retention.",
                graphic: (color: string) => (
                   <div className="relative w-32 h-24 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500 border-2" style={{ borderColor: `${color}30`, backgroundColor: `${color}05` }}>
                      <div className="w-12 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_currentColor]" style={{ backgroundColor: color, color: color }}>
                         <div className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-white ml-1"></div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${color}20` }}>
                         <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: color }}></div>
                      </div>
                   </div>
                )
              },
              {
                name: "Meta Ads",
                category: "Analytics",
                color: "#0668E1",
                desc: "Monitor ad spend, ROAS, and campaign performance across Meta.",
                graphic: (color: string) => (
                  <div className="w-full space-y-3 px-6">
                    {[80, 60, 40].map((w, i) => (
                       <div key={i} className="h-3 w-full rounded-full overflow-hidden" style={{ backgroundColor: `${color}15` }}>
                         <div className="h-full group-hover:w-full transition-all duration-1000 ease-in-out rounded-full" style={{ width: `${w}%`, backgroundColor: color }}></div>
                       </div>
                    ))}
                  </div>
                )
              },
              {
                name: "Facebook",
                category: "Scheduler",
                color: "#1877F2",
                desc: "Monitor page engagement, post reach, and audience demographics.",
                graphic: (color: string) => (
                   <div className="w-full h-full flex items-center justify-center">
                     <div className="w-24 h-24 rounded-xl flex flex-col gap-3 p-3 group-hover:-translate-y-2 transition-transform duration-500" style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30` }}>
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }}></div>
                           <div className="space-y-1 flex-1">
                              <div className="h-2 w-full rounded-full" style={{ backgroundColor: `${color}40` }}></div>
                              <div className="h-2 w-2/3 rounded-full" style={{ backgroundColor: `${color}20` }}></div>
                           </div>
                        </div>
                        <div className="flex-1 rounded-md" style={{ backgroundColor: `${color}20` }}></div>
                     </div>
                   </div>
                )
              },
              {
                name: "Instagram",
                category: "Scheduler",
                color: "#E4405F",
                desc: "Schedule posts, track engagement, and analyze your audience growth seamlessly.",
                graphic: (color: string) => (
                  <div className="w-32 h-32 rounded-full border-[2px] border-dashed group-hover:rotate-[360deg] transition-transform duration-[4s] ease-linear flex items-center justify-center relative" style={{ borderColor: `${color}40` }}>
                     <div className="absolute inset-4 rounded-full border flex items-center justify-center" style={{ borderColor: `${color}30` }}>
                        <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}></div>
                     </div>
                     <div className="absolute top-0 right-1/2 w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
                  </div>
                )
              },
              {
                name: "WooCommerce",
                category: "Analytics",
                color: "#7F54B3",
                desc: "Analyze store revenue, top products, and conversion funnels.",
                graphic: (color: string) => (
                  <div className="grid grid-cols-2 gap-2 w-24 h-24 p-2 rotate-45 group-hover:rotate-0 transition-transform duration-700 ease-in-out">
                     {[1, 2, 3, 4].map(i => (
                       <div key={i} className="rounded-lg shadow-sm" style={{ backgroundColor: i % 3 === 0 ? color : `${color}30` }}></div>
                     ))}
                  </div>
                )
              },
              {
                name: "LinkedIn",
                category: "Scheduler",
                color: "#0A66C2",
                desc: "Track professional network growth and B2B engagement metrics.",
                graphic: (color: string) => (
                   <div className="relative w-32 h-24 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                     <div className="absolute top-2 left-4 w-3 h-3 rounded-full z-10" style={{ backgroundColor: color }}></div>
                     <div className="absolute bottom-4 left-10 w-4 h-4 rounded-full z-10" style={{ backgroundColor: `${color}90` }}></div>
                     <div className="absolute top-8 right-6 w-5 h-5 rounded-full z-10" style={{ backgroundColor: `${color}80` }}></div>
                     <div className="absolute bottom-6 right-12 w-3 h-3 rounded-full z-10" style={{ backgroundColor: color }}></div>
                     <svg className="absolute inset-0 w-full h-full" style={{ stroke: `${color}40`, strokeWidth: 2 }}>
                       <line x1="22" y1="14" x2="46" y2="76" />
                       <line x1="46" y1="76" x2="104" y2="42" />
                       <line x1="104" y1="42" x2="84" y2="72" />
                       <line x1="46" y1="76" x2="84" y2="72" />
                     </svg>
                   </div>
                )
              },
              {
                name: "WordPress",
                category: "Scheduler",
                color: "#21759b",
                desc: "Publish posts, track site metrics, and manage your blog presence.",
                graphic: (color: string) => (
                   <div className="relative w-28 h-28 rounded-full border-4 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500" style={{ borderColor: color, backgroundColor: `${color}10` }}>
                      <div className="absolute inset-2 rounded-full border-2 border-dashed" style={{ borderColor: `${color}50` }}></div>
                      <div className="font-serif text-5xl font-bold italic" style={{ color: color }}>W</div>
                   </div>
                )
              },
              {
                name: "Telegram",
                category: "Broadcast",
                color: "#229ED9",
                desc: "Broadcast reports and alerts directly to your team or clients instantly.",
                graphic: (color: string) => (
                   <div className="relative w-28 h-28 flex items-center justify-center">
                     <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: color, animationDuration: '3s' }}></div>
                     <div className="absolute inset-4 rounded-full animate-ping opacity-40" style={{ backgroundColor: color, animationDuration: '3s', animationDelay: '1s' }}></div>
                     <div className="absolute inset-8 rounded-full flex items-center justify-center backdrop-blur-sm z-10" style={{ backgroundColor: `${color}10` }}>
                        <Send className="w-6 h-6 group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" style={{ color: color }} />
                     </div>
                   </div>
                )
              },
              {
                name: "WhatsApp",
                category: "Broadcast",
                color: "#25D366",
                desc: "Send personalized WhatsApp campaigns and automated alerts to customers.",
                graphic: (color: string) => (
                   <div className="relative w-28 h-28 flex items-center justify-center">
                     <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400 to-green-600 opacity-20 animate-pulse"></div>
                     <div className="absolute inset-2 rounded-full border border-green-500 opacity-40 animate-ping" style={{ animationDuration: '2s' }}></div>
                     <div className="absolute inset-6 rounded-full flex items-center justify-center backdrop-blur-sm z-10" style={{ backgroundColor: `${color}15` }}>
                        <svg className="w-8 h-8 text-[#25D366] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                     </div>
                   </div>
                )
              },
              {
                name: "SMS",
                category: "Broadcast",
                color: "#8A2BE2",
                desc: "Deliver high-open-rate text messages directly to mobile devices.",
                graphic: (color: string) => (
                   <div className="relative w-28 h-28 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500">
                     <div className="w-16 h-12 rounded-2xl rounded-bl-sm flex items-center justify-center shadow-lg relative z-10" style={{ backgroundColor: color }}>
                        <div className="flex gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                     </div>
                     <div className="absolute top-4 right-4 w-12 h-8 rounded-xl rounded-br-sm opacity-40" style={{ backgroundColor: color }}></div>
                   </div>
                )
              },
              {
                name: "Email",
                category: "Broadcast",
                color: "#D44638",
                desc: "Design and send targeted email marketing campaigns effortlessly.",
                graphic: (color: string) => (
                   <div className="relative w-28 h-20 rounded-lg flex items-center justify-center overflow-hidden border-2 group-hover:scale-105 transition-transform duration-500" style={{ borderColor: `${color}40`, backgroundColor: `${color}05` }}>
                      <div className="absolute top-0 left-0 right-0 h-10 border-b-2 flex justify-center" style={{ borderColor: `${color}40` }}>
                         <div className="w-4 h-4 rotate-45 border-b-2 border-r-2 translate-y-8" style={{ borderColor: `${color}40`, backgroundColor: `${color}05` }}></div>
                      </div>
                      <div className="absolute top-4 w-16 h-2 rounded-full opacity-50" style={{ backgroundColor: color }}></div>
                      <div className="absolute bottom-4 left-4 w-12 h-1.5 rounded-full opacity-30" style={{ backgroundColor: color }}></div>
                      <div className="absolute bottom-4 right-4 w-8 h-1.5 rounded-full opacity-30" style={{ backgroundColor: color }}></div>
                   </div>
                )
              }
            ].filter(card => card.category === activeIntegrationCategory).map((card, idx) => (
              <div 
                key={activeIntegrationCategory + '-' + card.name} 
                className="flex-shrink-0 w-[300px] md:w-[320px] snap-center group relative h-[420px] rounded-[2rem] overflow-hidden p-6 transition-all cursor-pointer flex flex-col shadow-sm hover:-translate-y-1 hover:shadow-xl border animate-slide-in-right"
                style={{ backgroundColor: 'white', borderColor: `${card.color}20`, animationDelay: `${idx * 0.05}s` }}
              >
                {/* Soft Pastel Overlay */}
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-50" style={{ background: `linear-gradient(135deg, transparent 30%, ${card.color}15)` }}></div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[14px] bg-white border shadow-sm flex items-center justify-center p-2.5 group-hover:scale-110 transition-transform duration-300 backdrop-blur-md" style={{ borderColor: `${card.color}30` }}>
                      {integrations.find(i => i.name === card.name)?.icon()}
                    </div>
                    <span className="text-[#111] font-bold text-[18px] tracking-wide">{card.name}</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666] group-hover:bg-[#111] group-hover:border-[#111] group-hover:text-white group-hover:-rotate-45 transition-all duration-300 shadow-sm border bg-white" style={{ borderColor: `${card.color}30` }}>
                    <ArrowRight size={14} />
                  </div>
                </div>
                
                <p className="text-[#666] text-[15px] leading-relaxed mb-8 relative z-10 font-medium">
                  {card.desc}
                </p>
                
                <div className="flex-1 relative z-10 flex items-center justify-center w-full">
                   {card.graphic(card.color)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-left px-4">
            <Link to="/integrations" className="text-[13px] font-bold text-[#666] hover:text-[#111] transition-colors inline-flex items-center gap-2 group tracking-wide">
              Browse thousands more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>


      <section className="py-40 px-6 relative z-10 border-t border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-24 reveal-on-scroll">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] mb-8 uppercase tracking-[0.3em]">
              Target Audience
            </div>
            <h2 className="text-4xl md:text-7xl font-medium tracking-tighter mb-8 text-[#111] leading-[1.1]">
              Built for teams that manage <br /> multi-channel marketing.
            </h2>
            <p className="text-xl text-[#666] font-light max-w-2xl leading-relaxed">
              Purpose-built for professionals who need reliable, unified reporting across multiple platforms and accounts.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal-on-scroll">
            {[
              { 
                role: "Agencies", 
                sub: "White-Label Solution", 
                title: "Unified Client Control", 
                icon: Users, 
                tag: "Branded Reports",
                color: "#4285F4" 
              },
              { 
                role: "Growth Teams", 
                sub: "Cross-Channel Strategy", 
                title: "Funnel Actuation", 
                icon: Target, 
                tag: "Actionable Insights",
                color: "#EA4335" 
              },
              { 
                role: "Performance", 
                sub: "Ad Optimization", 
                title: "ROAS & Spend Studio", 
                icon: TrendingUp, 
                tag: "Budget Management",
                color: "#FBBC05" 
              },
              { 
                role: "Content Hubs", 
                sub: "Distribution & SEO", 
                title: "Omnichannel Studio", 
                icon: Presentation, 
                tag: "Post Scheduling",
                color: "#34A853" 
              }
            ].map((card, i) => (
              <TiltCard key={i} index={i} className="relative overflow-hidden group p-8 rounded-[2.5rem] bg-white border border-[#e5e5e5] hover:border-[#111] hover:bg-[#111] text-[#111] cursor-pointer h-[380px] flex flex-col justify-between transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-[#111] group-hover:text-white mb-1 transition-all duration-700 ease-out">{card.role}</h4>
                    <p className="text-[10px] text-[#999] group-hover:text-white/60 uppercase tracking-wider transition-all duration-700 ease-out">{card.sub}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#f5f5f5] group-hover:bg-white/10 flex items-center justify-center transition-all duration-700 ease-out">
                    <card.icon className="w-5 h-5 text-[#111] group-hover:text-white transition-all duration-700 ease-out" />
                  </div>
                </div>
                
                <div>
                  <div className="text-[2rem] font-medium tracking-tighter leading-none mb-6 group-hover:text-white transition-all duration-700 ease-out">
                    {card.title}
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e5e5e5] group-hover:border-white/20 text-[9px] font-bold uppercase tracking-widest group-hover:text-white transition-all duration-700 ease-out">
                    {card.tag} <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
                
                {/* Subtle bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent group-hover:bg-white/20 transition-all duration-700 ease-out" />
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Minimalist Grid */}
      <section id="how-it-works" className="py-20 px-6 relative z-10 border-y border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-center mb-16 reveal-on-scroll">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e5e5e5] border border-[#e5e5e5] rounded-[2rem] overflow-hidden reveal-on-scroll">
            
            {/* Step 1 */}
            <div className="bg-white p-12 flex flex-col hover:bg-[#fafafa] transition-colors duration-500">
              <div className="w-12 h-12 rounded-full border border-[#e5e5e5] flex items-center justify-center mb-8">
                <Database className="w-5 h-5 text-[#4285F4]" />
              </div>
              <div className="text-xs font-bold text-[#4285F4] mb-4 tracking-widest uppercase">Step 1</div>
              <h3 className="text-2xl font-medium tracking-tight mb-4 text-[#111]">Connect data sources</h3>
              <p className="text-[#666] leading-relaxed">
                Authorize supported platforms using OAuth or API keys.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-12 flex flex-col hover:bg-[#fafafa] transition-colors duration-500">
               <div className="w-12 h-12 rounded-full border border-[#e5e5e5] flex items-center justify-center mb-8">
                <MousePointerClick className="w-5 h-5 text-[#EA4335]" />
              </div>
               <div className="text-xs font-bold text-[#EA4335] mb-4 tracking-widest uppercase">Step 2</div>
               <h3 className="text-2xl font-medium tracking-tight mb-4 text-[#111]">Choose what to track</h3>
               <p className="text-[#666] leading-relaxed">
                 Select accounts, properties, and performance metrics.
               </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-12 flex flex-col hover:bg-[#fafafa] transition-colors duration-500">
               <div className="w-12 h-12 rounded-full border border-[#e5e5e5] flex items-center justify-center mb-8">
                <PieChart className="w-5 h-5 text-[#FBBC05]" />
              </div>
               <div className="text-xs font-bold text-[#FBBC05] mb-4 tracking-widest uppercase">Step 3</div>
               <h3 className="text-2xl font-medium tracking-tight mb-4 text-[#111]">Build dashboards and reports</h3>
               <p className="text-[#666] leading-relaxed">
                 Use widgets and charts to create clear, branded reporting views.
               </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-12 flex flex-col hover:bg-[#fafafa] transition-colors duration-500">
               <div className="w-12 h-12 rounded-full border border-[#e5e5e5] flex items-center justify-center mb-8">
                <Send className="w-5 h-5 text-[#34A853]" />
              </div>
               <div className="text-xs font-bold text-[#34A853] mb-4 tracking-widest uppercase">Step 4</div>
               <h3 className="text-2xl font-medium tracking-tight mb-4 text-[#111]">Share insights</h3>
               <p className="text-[#666] leading-relaxed">
                 Export reports or schedule delivery for clients and internal teams.
               </p>
            </div>

          </div>
        </div>
      </section>

      {/* Real-Time Alerts - High Visibility Section */}
      <section id="alerts" className="py-40 px-6 relative z-10 overflow-hidden border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="reveal-on-scroll">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] mb-8 uppercase tracking-[0.3em]">
                Proactive Monitoring
              </div>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-8 text-[#111] leading-[1.1]">
                Stay ahead with <br /> real-time alerts.
              </h2>
              <p className="text-xl text-[#666] font-light leading-relaxed mb-12">
                Configure smart triggers to monitor budget caps, performance spikes, or drops in conversion across all your client accounts. Never miss a critical shift again.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Performance Alerts", desc: "Threshold-based triggers for shifts in your key metrics." },
                  { title: "Budget Guardians", desc: "Stop overspending with instant notifications on ad spend." },
                  { title: "KPI Thresholds", desc: "Get alerted when goals are met or performance dips." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-[#f5f5f5] group-hover:bg-[#111] flex items-center justify-center transition-all">
                      <Star className="w-4 h-4 text-[#111] group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111] text-sm mb-1">{item.title}</h4>
                      <p className="text-sm text-[#666]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative reveal-scale">
               {/* Mock Alert UI */}
               <div className="bg-white rounded-[2.5rem] border border-[#f0f0f0] p-8 shadow-2xl shadow-zinc-200/50">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                         <Star className="w-5 h-5 text-red-500 fill-red-500" />
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
               
               {/* Background Glow */}
               <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#4285F4] opacity-10 blur-[100px]" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Transparency Section */}
          <div className="reveal-on-scroll mb-24">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-[#111] mb-6">Why we request access to your data.</h2>
              <p className="text-lg text-[#666] font-light leading-relaxed">
                GreyCats Analytics requests only the permissions required to read analytics and reporting data from platforms you explicitly connect. 
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Positive Access Card */}
              <div className="p-10 rounded-[3rem] bg-white border border-[#f0f0f0] relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-[#111]">We use this access to:</h4>
                </div>
                <ul className="space-y-6">
                  {[
                    { icon: PieChart, text: "Display your dashboard metrics and trends visually." },
                    { icon: Send, text: "Generate professional branded reports from your data." },
                    { icon: Database, text: "Keep your connected data sources updated automatically." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white border border-[#f0f0f0] flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-3.5 h-3.5 text-[#111]" />
                      </div>
                      <span className="text-[#111] font-medium leading-tight">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Negative Access Card */}
              <div className="p-10 rounded-[3rem] bg-white border border-[#f0f0f0] relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center">
                    <X className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-[#111]">We do not:</h4>
                </div>
                <ul className="space-y-6">
                  {[
                    { icon: Lock, text: "Use connected data for any unrelated purposes." },
                    { icon: Users, text: "Share your analytics data with third parties." },
                    { icon: Target, text: "Use your data for advertising or AI training models." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white border border-[#f0f0f0] flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-3.5 h-3.5 text-[#111]" />
                      </div>
                      <span className="text-[#111] font-medium leading-tight">{item.text}</span>
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

          {/* Security Section */}
          <div id="security" className="reveal-on-scroll bg-white p-8 sm:p-12 md:p-16 rounded-[3rem] border border-[#f0f0f0] shadow-sm mt-12 md:mt-24">
            <div className="grid lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-2">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-[#111] mb-8">Security and privacy by design.</h2>
                <p className="text-xl text-[#666] leading-relaxed font-light mb-10">
                  GreyCats Analytics uses authenticated access controls and encrypted data transmission to protect account and integration data. 
                </p>
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
                  { title: "Role-Based Access", desc: "Granular control over team permissions.", icon: BarChart3, color: "#111" },
                  { title: "Regular Audits", desc: "Consistent security checks and logging.", icon: CheckCircle2, color: "#111" }
                ].map((item, idx) => (
                  <div key={idx} className="p-8 bg-white rounded-[2.5rem] border border-[#f0f0f0] hover:border-[#111] transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#f0f0f0] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <h4 className="text-xl font-medium mb-2 text-[#111]">{item.title}</h4>
                    <p className="text-sm text-[#666] font-light leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Massive CTA - Refined White Style */}
      <section className="py-20 px-6 relative z-10 border-t border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden reveal-scale flex flex-col items-center origin-center border border-[#f0f0f0] bg-white">
            
            <div className="flex flex-col items-center w-full relative z-10">
              <h4 className="text-xs font-bold text-[#111] uppercase tracking-[0.3em] mb-8">Built for teams that manage multi-channel marketing</h4>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-medium tracking-tighter mb-8 text-[#111] max-w-4xl leading-[1.1]">
                Ready to simplify your reporting workflow?
              </h2>
              <p className="text-xl text-[#666] mb-12 max-w-3xl font-light leading-relaxed">
                Ideal for marketing agencies, in-house growth teams, performance marketers, and analysts who need reliable reporting across multiple platforms, accounts, and clients.
              </p>
              
              <div className="flex justify-center relative z-10 mt-8">
                 <Link to={authed ? "/clients" : "/pricing"} className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full px-16 py-6 text-xl font-semibold hover:bg-[#333] hover:scale-105 border-none shadow-none">
                    {authed ? "Go to Dashboard" : "Start Free Trial"}
                  </Button>
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-transparent text-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={logoBlack} alt="GreyCats Analytics" className="h-8 w-auto" />
              </div>
              <p className="text-[#666] mb-2 font-medium">Operated by Greycats Tech LLP</p>
              <a href="mailto:info@greycats.tech" className="text-[#4285F4] font-semibold hover:underline">info@greycats.tech</a>
            </div>
            
            <div>
              <h4 className="font-bold text-[#111] mb-6 uppercase tracking-widest text-xs">Legal & Support</h4>
              <ul className="space-y-4 text-[#666] font-medium">
                <li><Link to="/pricing" className="hover:text-[#111] transition-colors">Plans & Pricing</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-[#111] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-[#111] transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-[#111] transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#e5e5e5] flex flex-col md:flex-row items-center justify-between gap-6 text-[#666] font-medium">
            <p>© 2026 Greycats Tech LLP. All rights reserved.</p>
            <div className="flex items-center gap-6">
               <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Secure Data</span>
               <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Data Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

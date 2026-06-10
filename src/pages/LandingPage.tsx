import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoBlack from "../assets/images/greycats-black-logo.png";
import { isAuthenticated, StorageKey } from "@/utils/storage";
import ParticleBackground from "@/components/ParticleBackground";
import { DottedSurface } from "@/components/ui/dotted-surface";
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

      {/* Zero-Gravity Hero Section */}
      <section className="relative min-h-[90vh] pt-28 md:pt-40 pb-20 px-4 md:px-6 flex flex-col items-center justify-center overflow-hidden z-10">
        {/* Cinematic Background Layers - Balanced Visibility */}
        <div className="absolute inset-0 bg-grid-dots opacity-45 pointer-events-none mask-image-[linear-gradient(to_bottom,white,transparent)]" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }} />
        
        {/* Softer Dynamic Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(66,133,244,0.04),transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#4285F4] opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />

        <DottedSurface className="absolute inset-0 top-[35%] size-full pointer-events-none z-0" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 mt-12 md:mt-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 rounded-full"></div>
            <div className="relative inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] mb-8 md:mb-12 uppercase tracking-[0.3em]">
              GreyCats Analytics
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-[5rem] lg:text-[6rem] font-medium tracking-tighter mb-8 leading-[1.1] text-[#111] min-h-[2.2em] md:min-h-[auto] px-4">
            All your marketing data. <br className="hidden md:block" /> One clear reporting platform.
          </h1>
          <p className="text-lg md:text-2xl text-[#111] mb-12 max-w-4xl mx-auto leading-relaxed font-semibold px-4">
            Connect channels, track KPIs, and deliver client-ready reports faster.
          </p>
          
          <div className="flex justify-center w-full sm:w-auto">
            <Link to={authed ? "/clients" : "/pricing"} className="w-full sm:w-auto">
              <Button className="w-full px-10 py-5 text-lg font-semibold bg-[#111] hover:bg-[#333] text-white border-none shadow-none">
                {authed ? "Go to Dashboard" : "Start Free Trial"}
              </Button>
            </Link>
          </div>
          {!authed && (
            <div className="mt-8">
              <Link to="/auth/login" className="text-[#666] hover:text-[#111] transition-colors text-sm font-medium">Already have an account? <span className="text-[#4285F4] underline">Sign in</span></Link>
            </div>
          )}
        </div>
      </section>

      {/* Sine Wave Marquee Integrations - Compact Version */}
      <section id="integrations" className="py-24 border-y border-[#f0f0f0] relative z-10 overflow-hidden">
        <div className="text-center mb-16 relative z-20 px-6 reveal-on-scroll">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] mb-6 uppercase tracking-[0.3em]">
            Unified Connectivity
          </div>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter mb-4 text-[#111] leading-[1.1]">
            Connect the platforms <br /> you already use.
          </h2>
        </div>

        <div className="relative h-[200px] flex items-center">
          <style>{`
            @keyframes float-wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-30px); }
            }
          `}</style>
          
          <div className="flex w-fit animate-marquee hover:[animation-play-state:paused] transition-all cursor-default py-12 relative z-20">
            {[...integrations, ...integrations, ...integrations, ...integrations].map((item, i) => {
              return (
                <div 
                  key={i} 
                  className="px-6 flex-shrink-0"
                  style={{ 
                    animation: `float-wave 4s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`
                  }}
                >
                  <div 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border border-[#f0f0f0] shadow-sm flex items-center justify-center hover:scale-110 hover:border-[#111] transition-all duration-500 group"
                  >
                    <div className="scale-110 group-hover:scale-125 transition-transform duration-500">
                      <item.icon />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Fading Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-white via-white/80 to-transparent z-30" />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-white via-white/80 to-transparent z-30" />
        </div>

        <div className="text-center mt-12 relative z-20">
          <p className="text-[9px] text-[#999] font-medium tracking-wide">More integrations added regularly to our reporting suite.</p>
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
                <Link to="/pricing">
                  <Button className="px-10 py-5 text-sm font-bold bg-[#111] hover:bg-[#333] text-white">
                    Explore Platform
                  </Button>
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

      {/* Redesigned Action Hub - Premium 2-Column Layout */}
      <section id="action-hub" className="py-40 px-6 relative z-10 overflow-hidden border-y border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32 reveal-on-scroll">
            <h2 className="text-5xl md:text-7xl font-medium tracking-tighter mb-8 text-[#111] leading-[1.05]">
              Everything you need <br /> to deliver results
            </h2>
            <p className="text-xl text-[#666] font-light max-w-3xl mx-auto leading-relaxed">
              Don’t just track. Take action on your insights. GreyCats connects your data directly to execution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Card 1: Scheduled Report Delivery */}
            <div className="reveal-on-scroll">
              <Link to={authed ? "/clients" : "/pricing"} className="group rounded-[2.5rem] border border-[#f0f0f0] bg-white p-4 pb-12 transition-all duration-700 hover:shadow-2xl hover:shadow-zinc-200/50 flex flex-col h-full block cursor-pointer">
                <div className="rounded-[2rem] bg-[#f8faff] h-[400px] flex items-center justify-center p-12 relative overflow-hidden mb-12">
                   {/* UI Mockup: Scheduled Reports */}
                   <div className="w-full max-w-[340px] bg-white rounded-2xl shadow-2xl border border-blue-100 p-6 group-hover:-translate-y-4 transition-transform duration-700">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                            <Send className="text-white w-5 h-5" />
                         </div>
                         <div>
                            <div className="text-sm font-bold text-[#111]">Scheduled Reports</div>
                            <div className="text-[10px] text-[#999] uppercase font-bold tracking-widest">3 Active</div>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                            <div>
                               <div className="text-xs font-bold text-[#111]">Acme Global · Monthly</div>
                               <div className="text-[10px] text-[#999] mt-0.5">Next: 1st of every month</div>
                            </div>
                            <div className="text-[9px] font-bold text-blue-600 uppercase px-2 py-1 rounded-full bg-white">PDF</div>
                         </div>
                         <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                            <div>
                               <div className="text-xs font-bold text-[#111]">Lumen Co · Weekly</div>
                               <div className="text-[10px] text-[#999] mt-0.5">Every Monday · 9:00 AM</div>
                            </div>
                            <div className="text-[9px] font-bold text-zinc-600 uppercase px-2 py-1 rounded-full bg-white">PDF</div>
                         </div>
                         <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                            <div>
                               <div className="text-xs font-bold text-[#111]">Nova Studio · Weekly</div>
                               <div className="text-[10px] text-[#999] mt-0.5">Every Friday · 5:00 PM</div>
                            </div>
                            <div className="text-[9px] font-bold text-zinc-600 uppercase px-2 py-1 rounded-full bg-white">PDF</div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="px-6 flex-1">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-3xl font-medium tracking-tight text-[#111]">Reports delivered on autopilot</h3>
                      <div className="w-14 h-14 rounded-full bg-[#111] flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                         <ArrowUpRight size={28} />
                      </div>
                   </div>
                   <p className="text-xl text-[#666] font-light leading-relaxed">
                      Generate branded PDF reports on a schedule and deliver them straight to your clients — daily, weekly, or monthly.
                   </p>
                </div>
              </Link>
            </div>

            {/* Card 2: Client Issue Detection */}
            <div className="reveal-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <Link to={authed ? "/clients" : "/pricing"} className="group rounded-[2.5rem] border border-[#f0f0f0] bg-white p-4 pb-12 transition-all duration-700 hover:shadow-2xl hover:shadow-zinc-200/50 flex flex-col h-full block cursor-pointer">
                <div className="rounded-[2rem] bg-[#fffcf8] h-[400px] flex items-center justify-center p-12 relative overflow-hidden mb-12">
                   {/* UI Mockup: Dashboard View */}
                   <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden flex flex-col group-hover:-translate-y-4 transition-transform duration-700">
                      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                         <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                         </div>
                         <div className="text-[9px] font-bold text-[#111] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-100">Overview</div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col gap-6">
                         <div className="flex gap-4">
                            <div className="flex-1 p-4 rounded-xl bg-amber-50 border border-amber-100">
                               <div className="text-[9px] font-bold text-amber-700 uppercase mb-2">Alert</div>
                               <div className="text-sm font-bold text-[#111]">Threshold Crossed</div>
                            </div>
                            <div className="flex-1 p-4 rounded-xl bg-gray-50 border border-gray-100">
                               <div className="text-[9px] font-bold text-gray-500 uppercase mb-2">Metrics</div>
                               <div className="text-sm font-bold text-[#111]">ROAS +12%</div>
                            </div>
                         </div>
                         <div className="flex-1 border-t border-gray-50 pt-4">
                            <div className="grid grid-cols-5 gap-2 h-full">
                               {[...Array(5)].map((_, i) => (
                                 <div key={i} className="bg-gray-50 rounded-lg flex items-end p-2">
                                    <div className="w-full bg-blue-500/20 rounded-t-sm" style={{ height: `${20 + (i * 15)}%` }} />
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="px-6 flex-1">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-3xl font-medium tracking-tight text-[#111]">Spot client issues—before they do</h3>
                      <div className="w-14 h-14 rounded-full bg-[#111] flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                         <ArrowUpRight size={28} />
                      </div>
                   </div>
                   <p className="text-xl text-[#666] font-light leading-relaxed">
                      Catch performance dips instantly with threshold-based alerts and automated KPI triggers across your entire portfolio.
                   </p>
                </div>
              </Link>
            </div>
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

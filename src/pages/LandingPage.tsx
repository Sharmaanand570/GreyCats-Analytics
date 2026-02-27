import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoBlack from "../assets/images/greycats-black-logo.png";
import { isAuthenticated, StorageKey } from "@/utils/storage";
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
  Presentation
} from "lucide-react";

// Custom Button - Antigravity Style (Flat, High Contrast)
const Button = ({ children, onClick, className, variant = "primary" }: { children: React.ReactNode, onClick?: () => void, className?: string, variant?: "primary" | "secondary" | "ghost" }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-500 ease-out hover:scale-105 active:scale-95";
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

    document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));

    // Mouse Move Spotlight Animation
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        const x = e.clientX;
        const y = e.clientY;
        // Soft Google-blue spotlight
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(66, 133, 244, 0.05), transparent 40%)`;
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
      color: "#4285F4",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path fill="#F9AB00" d="M12 21.5c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" opacity=".2"/>
          <path fill="#F9AB00" d="M12 11V7l-4 4 4 4v-4z"/>
          <path fill="#E37400" d="M12 11h4l-4-4v4z"/>
          <path fill="#F9AB00" d="M12 11v4l4-4h-4z"/>
        </svg>
      )
    },
    { 
      name: "Search Console", 
      color: "#34A853",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path fill="#4285F4" d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path fill="#34A853" d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
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
          <path fill="#FBBC05" d="M16 2l-10 17 3 5 10-17z"/>
          <path fill="#4285F4" d="M6 19h12v5H6z"/>
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
      color: "#7AB55C",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path fill="#95BF47" d="M18.8 6.5l-4.2-1.1L12 1.1 9.4 5.4l-4.2 1.1-1.3 11 8.1 4.4 8.1-4.4-1.3-11z"/>
          <path fill="#5E8E3E" d="M12 21.4l-8.1-4.4 1.3-11 4.2-1.1L12 1.1l2.6 4.3 4.2 1.1-1.3 11-8.1 4.4z" opacity=".2"/>
          <path fill="white" d="M12 16.5c-2.5 0-4-1.5-4-3.5 0-1.5.5-2.5 1.5-3.5.5-.5 1-1 2-1 1 0 2 .5 2 1.5.5.5.5 1 .5 1.5v2c0 1.5-1 2.5-2 3zm0-6c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1z"/>
        </svg>
      )
    },
    { 
      name: "Quora", 
      color: "#B92B27",
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#B92B27">
          <path d="M15.39 16.91a8.4 8.4 0 1 1 2.12-2.12l3.43 3.44a1.5 1.5 0 0 1-2.12 2.12l-3.43-3.44zM12 17.4a5.4 5.4 0 1 0 0-10.8 5.4 5.4 0 0 0 0 10.8z"/>
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

  const Typewriter = ({ text, delay = 50 }: { text: string, delay?: number }) => {
    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, delay);
        return () => clearTimeout(timeout);
      }
    }, [currentIndex, delay, text]);

    return <span className="typewriter-cursor">{displayText}</span>;
  };

  return (
    <div className="min-h-screen bg-white text-[#111] font-sans selection:bg-[#4285F4] selection:text-white overflow-x-hidden relative">
      
      {/* Dynamic Background Spotlight element */}
      <div 
        ref={spotlightRef}
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #ffffff; }
        
        /* Antigravity Floating Animations */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
        @keyframes float-med {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-2deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(3deg); }
        }
        
        .float-1 { animation: float-slow 6s ease-in-out infinite; }
        .float-2 { animation: float-med 8s ease-in-out infinite reverse; }
        .float-3 { animation: float-fast 5s ease-in-out infinite; }
        
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

        /* Typewriter Cursor */
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .typewriter-cursor::after {
          content: '';
          display: inline-block;
          width: 0.1em;
          height: 0.9em;
          background-color: #4285F4;
          margin-left: 2px;
          vertical-align: middle;
          animation: blink 0.8s infinite;
        }
      `}</style>

      {/* Full-width Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-[#e5e5e5] transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoBlack} alt="GreyCats" className="h-8 w-auto" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/contact" className="text-sm font-semibold text-[#666] hover:text-[#111] transition-colors">Support</Link>
            <div className="flex items-center gap-2">
              {authed ? (
                <Button onClick={() => navigate("/clients")} className="px-5 py-2.5 text-sm">
                  Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Link to="/auth/login" className="px-4 py-2 text-sm font-semibold text-[#111] hover:text-[#4285F4] transition-colors">Sign in</Link>
                  <Link to="/auth/signup">
                    <Button className="px-5 py-2.5 text-sm font-semibold bg-[#4285F4] hover:bg-[#3367D6] text-white border-none shadow-md shadow-blue-500/10">Start Free Trial</Button>
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
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-[#111]">Support</Link>
          <div className="h-px w-full bg-[#e5e5e5] my-4" />
          {authed ? (
            <Button onClick={() => { navigate("/clients"); setIsMenuOpen(false); }} className="w-full py-4 text-lg">
              Go to Dashboard
            </Button>
          ) : (
            <div className="flex flex-col gap-4">
              <Link to="/auth/login"><Button variant="secondary" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-lg">Sign in</Button></Link>
              <Link to="/auth/signup"><Button onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-lg bg-[#4285F4] text-white hover:bg-[#3367D6]">Start Free Trial</Button></Link>
            </div>
          )}
        </div>
      )}

      {/* Zero-Gravity Hero Section */}
      <section className="relative min-h-[90vh] pt-28 md:pt-40 pb-20 px-4 md:px-6 flex flex-col items-center justify-center overflow-hidden z-10">
        <div className="absolute inset-0 bg-grid-dots opacity-50 pointer-events-none mask-image-[linear-gradient(to_bottom,white,transparent)]" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }} />

        {/* Floating Abstract UI Elements (The Antigravity effect) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center max-w-7xl mx-auto hidden md:flex">
          <div className="absolute left-[5%] top-[15%] w-48 p-4 bg-white border border-[#e5e5e5] rounded-2xl float-1 shadow-[0_20px_40px_rgba(0,0,0,0.04)] opacity-60 hover:opacity-100 transition-opacity duration-500">
             <div className="w-8 h-8 rounded-full bg-[#EA4335]/10 flex items-center justify-center mb-3">
               <PieChart className="w-4 h-4 text-[#EA4335]" />
             </div>
             <div className="h-2 w-20 bg-[#f0f0f0] rounded-full mb-2" />
             <div className="h-2 w-12 bg-[#f0f0f0] rounded-full" />
          </div>
          
          <div className="absolute right-[5%] top-[20%] w-56 p-5 bg-white border border-[#e5e5e5] rounded-2xl float-2 shadow-[0_20px_40px_rgba(0,0,0,0.04)] opacity-60 hover:opacity-100 transition-opacity duration-500">
             <div className="flex justify-between items-end mb-4">
               <div>
                 <div className="text-[10px] font-bold text-[#666] uppercase tracking-wider mb-1">Conversions</div>
                 <div className="text-2xl font-bold text-[#111]">12.4k</div>
               </div>
               <div className="text-xs font-bold text-[#34A853]">+14%</div>
             </div>
             <div className="flex items-end gap-1 h-12">
               {[40, 70, 45, 90, 65, 100].map((h, i) => (
                 <div key={i} className="flex-1 bg-[#4285F4] rounded-sm opacity-20" style={{ height: `${h}%` }} />
               ))}
             </div>
          </div>

          <div className="absolute left-[8%] bottom-[10%] w-40 p-4 bg-white border border-[#e5e5e5] rounded-3xl float-3 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-500">
             <div className="w-10 h-10 rounded-full bg-[#FBBC05] flex items-center justify-center">
               <ShieldCheck className="w-5 h-5 text-white" />
             </div>
             <div>
               <div className="h-2 w-16 bg-[#f0f0f0] rounded-full mb-1.5" />
               <div className="h-2 w-10 bg-[#f0f0f0] rounded-full" />
             </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 mt-12 md:mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] mb-8 md:mb-12 uppercase tracking-[0.3em]">
            GreyCats Analytics
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-[5rem] lg:text-[6rem] font-medium tracking-tighter mb-8 leading-[1.1] text-[#111] min-h-[2.2em] md:min-h-[auto] px-4">
            <Typewriter text="All your marketing data. One clear reporting platform." delay={40} />
          </h1>
          <p className="text-lg md:text-2xl text-[#111] mb-12 max-w-4xl mx-auto leading-relaxed font-semibold px-4">
            Connect channels, track KPIs, and deliver client-ready reports faster.
          </p>
          
          <div className="flex justify-center w-full sm:w-auto">
            <Link to={authed ? "/clients" : "/auth/signup"} className="w-full sm:w-auto">
              <Button className="w-full px-12 py-6 text-xl font-semibold bg-[#4285F4] hover:bg-[#3367D6] text-white border-none shadow-2xl shadow-blue-500/30">
                {authed ? "Go to Dashboard" : "Start Free Trial"}
              </Button>
            </Link>
          </div>
          <div className="mt-8">
            <Link to="/auth/login" className="text-[#666] hover:text-[#111] transition-colors text-sm font-medium">Already have an account? <span className="text-[#4285F4] underline">Sign in</span></Link>
          </div>
        </div>
      </section>

      {/* Endless Marquee Integrations */}
      <section id="integrations" className="py-32 border-y border-[#e5e5e5] bg-[#fafafa] relative z-10 overflow-hidden">
        {/* Subtitle Background Glass Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-[#fafafa] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-[#fafafa] to-transparent z-10" />
        
        <div className="text-center mb-12 md:mb-20 relative z-20 px-6">
          <p className="text-[10px] font-bold text-[#4285F4] uppercase tracking-[0.4em] mb-4">Unified Connectivity</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-4 text-[#111]">Connect the platforms you already use.</h2>
        </div>

        <div className="flex w-fit animate-marquee hover:[animation-play-state:paused] transition-all cursor-default relative z-20">
          {[...integrations, ...integrations, ...integrations].map((item, i) => (
            <div key={i} className="px-12 whitespace-nowrap group flex items-center gap-6 transition-all duration-500">
              <div 
                className="w-16 h-16 rounded-3xl bg-white border border-[#e5e5e5] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex items-center justify-center group-hover:scale-110 group-hover:border-[#111] transition-all duration-500"
              >
                <item.icon />
              </div>
              <span className="text-3xl md:text-4xl font-medium tracking-tight text-[#111]/30 group-hover:text-[#111] transition-all duration-500">
                {item.name}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 relative z-20">
          <p className="text-xs text-[#999] font-medium tracking-wide">More integrations added regularly to our reporting suite.</p>
        </div>
      </section>

      {/* What We Do - Editorial Split */}
      <section id="product" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto reveal-on-scroll">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-medium tracking-tighter mb-8 text-[#111]">
                What GreyCats Analytics does.
              </h2>
            </div>
            <div>
              <p className="text-lg md:text-xl text-[#666] font-light leading-relaxed max-w-2xl">
                GreyCats Analytics securely pulls authorized data from your connected platforms, standardizes it, and presents it in dashboards and reports your team can act on. You can compare trends, monitor campaign performance, and share results with clients or stakeholders from one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It’s For - Enhanced Grid Section */}
      <section className="py-32 px-6 relative z-10 bg-white border-t border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tighter mb-8 text-[#111]">
              Built for teams that manage multi-channel marketing.
            </h2>
            <p className="text-lg md:text-xl text-[#666] font-light max-w-2xl mx-auto">
              Purpose-built for professionals who need reliable, unified reporting across multiple platforms and accounts.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 reveal-on-scroll">
            {/* Agencies */}
            <TiltCard index={0} className="group p-8 rounded-[3rem] border border-[#e5e5e5] hover:border-[#bdbdbd] transition-all duration-500 bg-[#fafafa]/50 hover:bg-white hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e5e5] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <Users className="w-6 h-6 text-[#4285F4]" />
              </div>
              <h3 className="text-2xl font-medium mb-4 text-[#111]">Marketing Agencies</h3>
              <p className="text-[#666] leading-relaxed text-sm">
                Manage reporting for hundreds of clients from a single login. Automate branded PDF delivery and save hours of manual data work every month.
              </p>
            </TiltCard>

            {/* In-house Growth */}
            <TiltCard index={1} className="group p-8 rounded-[3rem] border border-[#e5e5e5] hover:border-[#bdbdbd] transition-all duration-500 bg-[#fafafa]/50 hover:bg-white hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e5e5] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <Target className="w-6 h-6 text-[#EA4335]" />
              </div>
              <h3 className="text-2xl font-medium mb-4 text-[#111]">Growth Teams</h3>
              <p className="text-[#666] leading-relaxed text-sm">
                Monitor KPIs across every stage of your funnel. Compare performance between search, social, and shop platforms in real-time.
              </p>
            </TiltCard>

            {/* Performance Marketers */}
            <TiltCard index={2} className="group p-8 rounded-[3rem] border border-[#e5e5e5] hover:border-[#bdbdbd] transition-all duration-500 bg-[#fafafa]/50 hover:bg-white hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e5e5] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <TrendingUp className="w-6 h-6 text-[#FBBC05]" />
              </div>
              <h3 className="text-2xl font-medium mb-4 text-[#111]">Performance Marketers</h3>
              <p className="text-[#666] leading-relaxed text-sm">
                Deep dive into ad spend and conversion trends. Use data-backed insights to optimize campaigns and maximize your ROAS.
              </p>
            </TiltCard>

            {/* Data Analysts */}
            <TiltCard index={3} className="group p-8 rounded-[3rem] border border-[#e5e5e5] hover:border-[#bdbdbd] transition-all duration-500 bg-[#fafafa]/50 hover:bg-white hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e5e5] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <Presentation className="w-6 h-6 text-[#34A853]" />
              </div>
              <h3 className="text-2xl font-medium mb-4 text-[#111]">Data Analysts</h3>
              <p className="text-[#666] leading-relaxed text-sm">
                Access standardized, multi-platform data without the technical overhead. Easily export clean datasets for deeper analysis.
              </p>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* How It Works - Minimalist Grid */}
      <section id="how-it-works" className="py-20 px-6 relative z-10 bg-[#fafafa] border-y border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-center mb-16 reveal-on-scroll">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e5e5e5] border border-[#e5e5e5] rounded-[2rem] overflow-hidden reveal-on-scroll shadow-[0_20px_60px_rgba(0,0,0,0.02)]">
            
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

      {/* Data Transparency & Security - Redesigned Card Layout */}
      <section className="py-32 px-6 bg-white relative z-10">
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
              <div className="p-10 rounded-[3rem] bg-blue-50/30 border border-blue-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-[#4285F4]">We use this access to:</h4>
                </div>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <PieChart className="w-3.5 h-3.5 text-[#4285F4]" />
                    </div>
                    <span className="text-[#111] font-medium leading-tight">Display your dashboard metrics and trends visually.</span>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Send className="w-3.5 h-3.5 text-[#4285F4]" />
                    </div>
                    <span className="text-[#111] font-medium leading-tight">Generate professional branded reports from your data.</span>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Database className="w-3.5 h-3.5 text-[#4285F4]" />
                    </div>
                    <span className="text-[#111] font-medium leading-tight">Keep your connected data sources updated automatically.</span>
                  </li>
                </ul>
              </div>

              {/* Negative Access Card */}
              <div className="p-10 rounded-[3rem] bg-red-50/30 border border-red-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-red-500/10 transition-colors duration-500" />
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                    <X className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-[#EA4335]">We do not:</h4>
                </div>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-3.5 h-3.5 text-[#EA4335]" />
                    </div>
                    <span className="text-[#111] font-medium leading-tight">Use connected data for any unrelated purposes.</span>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-[#EA4335]" />
                    </div>
                    <span className="text-[#111] font-medium leading-tight">Share your analytics data with third parties.</span>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Target className="w-3.5 h-3.5 text-[#EA4335]" />
                    </div>
                    <span className="text-[#111] font-medium leading-tight">Use your data for advertising or AI training models.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center p-8 bg-[#fafafa] rounded-[2rem] border border-[#e5e5e5] max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-[#111] font-medium text-lg">Manage or disconnect your integrations at any time.</p>
              <div className="flex gap-4">
                <Link to="/privacy-policy" className="text-xs font-bold uppercase tracking-widest text-[#4285F4] hover:underline">Privacy Policy</Link>
                <Link to="/cookies" className="text-xs font-bold uppercase tracking-widest text-[#4285F4] hover:underline">Cookie Policy</Link>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div id="security" className="reveal-on-scroll border-t border-[#e5e5e5] pt-24">
            <div className="grid lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-2">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-[#111] mb-8">Security and privacy by design.</h2>
                <p className="text-xl text-[#666] leading-relaxed font-light mb-10">
                  GreyCats Analytics uses authenticated access controls and encrypted data transmission to protect account and integration data. 
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/privacy-policy" className="inline-flex items-center px-6 py-3 rounded-full border border-[#e5e5e5] hover:border-[#111] text-[10px] font-bold uppercase tracking-widest transition-all">Privacy Policy</Link>
                  <Link to="/terms-of-service" className="inline-flex items-center px-6 py-3 rounded-full border border-[#e5e5e5] hover:border-[#111] text-[10px] font-bold uppercase tracking-widest transition-all">Terms of Service</Link>
                  <Link to="/contact" className="inline-flex items-center px-6 py-3 rounded-full border border-[#e5e5e5] hover:border-[#111] text-[10px] font-bold uppercase tracking-widest transition-all">Support</Link>
                </div>
              </div>
              
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "OAuth 2.0 Auth", desc: "No passwords stored for integrations.", icon: Lock, color: "#111" },
                  { title: "E2E Encryption", desc: "Data is encrypted during transmission.", icon: ShieldCheck, color: "#111" },
                  { title: "Role-Based Access", desc: "Granular control over team permissions.", icon: BarChart3, color: "#111" },
                  { title: "Regular Audits", desc: "Consistent security checks and logging.", icon: CheckCircle2, color: "#111" }
                ].map((item, idx) => (
                  <div key={idx} className="p-8 bg-[#fafafa] rounded-[2.5rem] border border-[#e5e5e5] hover:border-[#111] transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e5e5] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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

      {/* Massive CTA */}
      <section className="py-20 px-6 relative z-10 bg-[#fafafa] border-t border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#111] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden text-reveal reveal-on-scroll flex flex-col items-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.3em] mb-8">Built for teams that manage multi-channel marketing</h4>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-medium tracking-tighter mb-8 text-white max-w-4xl leading-[1.1]">
              Ready to simplify your reporting workflow?
            </h2>
            <p className="text-xl text-white/60 mb-12 max-w-3xl font-light leading-relaxed">
              Ideal for marketing agencies, in-house growth teams, performance marketers, and analysts who need reliable reporting across multiple platforms, accounts, and clients.
            </p>
            
            <div className="flex justify-center relative z-10 mt-8">
               <Link to={authed ? "/clients" : "/auth/signup"} className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full px-16 py-6 text-xl font-semibold hover:bg-gray-100 hover:scale-105 shadow-2xl border-none">
                  {authed ? "Go to Dashboard" : "Start Free Trial"}
                </Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-white text-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center">
                  <BarChart3 className="text-white w-4 h-4" />
                </div>
                <span className="font-bold tracking-tight text-[#111] text-lg">GreyCats Analytics</span>
              </div>
              <p className="text-[#666] mb-2 font-medium">Operated by Greycats Tech LLP</p>
              <a href="mailto:info@greycats.tech" className="text-[#4285F4] font-semibold hover:underline">info@greycats.tech</a>
            </div>
            
            <div>
              <h4 className="font-bold text-[#111] mb-6 uppercase tracking-widest text-xs">Legal & Support</h4>
              <ul className="space-y-4 text-[#666] font-medium">
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

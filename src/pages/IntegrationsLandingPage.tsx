import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import logoBlack from "@/assets/images/greycats-black-logo.png";
import { ArrowRight } from "lucide-react";
import { 
  SiGoogleads, 
  SiMeta, 
  SiShopify, 
  SiGoogleanalytics, 
  SiGooglesearchconsole, 
  SiYoutube, 
  SiLinkedin, 
  SiX 
} from "react-icons/si";
import { FaCartShopping } from "react-icons/fa6";
import { isAuthenticated, StorageKey } from "@/utils/storage";
import { motion } from "framer-motion";

const HoverCard = ({ integration, index }: { integration: any, index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      boxShadow: `0 20px 40px -10px ${integration.color}40`,
      borderColor: `${integration.color}50`,
      transition: "transform 0.1s ease-out, box-shadow 0.1s ease-out, border-color 0.1s ease-out"
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      borderColor: "#eaeaea",
      transition: "transform 0.5s ease-out, box-shadow 0.5s ease-out, border-color 0.5s ease-out"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className="bg-white p-8 rounded-3xl border border-[#eaeaea] shadow-sm flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity duration-300" style={{ backgroundColor: integration.color }} />
      <div 
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm border bg-white relative z-10"
        style={{ borderColor: `${integration.color}30` }}
      >
        <div className="absolute inset-0 opacity-10 rounded-2xl" style={{ backgroundColor: integration.color }} />
        {integration.icon}
      </div>
      <h3 className="text-xl font-bold mb-1 tracking-tight relative z-10">{integration.name}</h3>
      <p className="text-[#666] text-sm font-medium uppercase tracking-widest relative z-10">{integration.category}</p>
    </motion.div>
  );
};

export default function IntegrationsLandingPage() {
  const isAuth = isAuthenticated(StorageKey.ANALYTICS_TOKEN);
  const integrations = [
    { name: "Google Ads", category: "Advertising", color: "#4285F4", icon: <SiGoogleads className="w-10 h-10 text-[#4285F4]" /> },
    { name: "Meta Ads", category: "Advertising", color: "#0081FB", icon: <SiMeta className="w-10 h-10 text-[#0081FB]" /> },
    { name: "Shopify", category: "E-Commerce", color: "#96BF48", icon: <SiShopify className="w-10 h-10 text-[#96BF48]" /> },
    { name: "WooCommerce", category: "E-Commerce", color: "#96588A", icon: <FaCartShopping className="w-10 h-10 text-[#96588A]" /> },
    { name: "Google Analytics", category: "Analytics", color: "#F4B400", icon: <SiGoogleanalytics className="w-10 h-10 text-[#F4B400]" /> },
    { name: "Search Console", category: "Analytics", color: "#4285F4", icon: <SiGooglesearchconsole className="w-10 h-10 text-[#4285F4]" /> },
    { name: "YouTube", category: "Video", color: "#FF0000", icon: <SiYoutube className="w-10 h-10 text-[#FF0000]" /> },
    { name: "LinkedIn Ads", category: "Advertising", color: "#0A66C2", icon: <SiLinkedin className="w-10 h-10 text-[#0A66C2]" /> },
    { name: "X (Twitter)", category: "Social", color: "#000000", icon: <SiX className="w-10 h-10 text-[#000000]" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans text-[#111] overflow-x-hidden">
      <header className="py-6 px-6 border-b border-[#eaeaea] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img src={logoBlack} alt="GreyCats Analytics" className="h-8 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <Link to="/features" className="text-[#666] hover:text-[#111] transition-colors">Features</Link>
            <Link to="/integrations-info" className="text-[#111]">Integrations</Link>
            <Link to="/pricing" className="text-[#666] hover:text-[#111] transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            {!isAuth && (
              <Link to="/login" className="text-sm font-medium text-[#666] hover:text-[#111] transition-colors">Log In</Link>
            )}
            <Link to={isAuth ? "/clients" : "/pricing"} className="text-sm font-medium bg-[#111] text-white px-5 py-2.5 rounded-full hover:bg-[#333] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform">
              {isAuth ? "Go to Dashboard" : "Start Free Trial"}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-b from-gray-100/80 via-gray-50/50 to-transparent blur-3xl -z-10 rounded-full" />

        <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 max-w-4xl mx-auto leading-[1.1]"
          >
            Connect all your data in <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#111] via-gray-700 to-gray-500">one place.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-[#666] mb-16 max-w-2xl mx-auto leading-relaxed tracking-tight"
          >
            Greycats Analytics integrates with the tools you already use. Sync your data seamlessly and start analyzing in seconds.
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {integrations.map((integration, idx) => (
              <HoverCard key={idx} integration={integration} index={idx} />
            ))}
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 text-[#666] font-medium text-lg tracking-wide"
          >
            ...and many more coming soon!
          </motion.p>
        </section>

        <section className="py-32 px-6 bg-[#111] text-white text-center relative overflow-hidden">
          {/* Subtle dark mode background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Unify your marketing data today.</h2>
            <p className="text-gray-400 text-xl mb-10 leading-relaxed">Stop jumping between platforms. Bring it all together with Greycats Analytics.</p>
            <Link to="/pricing" className="inline-flex items-center justify-center gap-3 bg-white text-[#111] px-10 py-5 rounded-full font-bold hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] text-lg">
              Connect Your Accounts <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

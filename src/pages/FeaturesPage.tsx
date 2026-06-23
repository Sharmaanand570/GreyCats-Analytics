import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import logoBlack from "@/assets/images/greycats-black-logo.png";
import { ArrowRight, BarChart2, PieChart, TrendingUp, Zap } from "lucide-react";
import { isAuthenticated, StorageKey } from "@/utils/storage";
import { motion } from "framer-motion";

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
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`bg-white p-10 rounded-3xl border border-[#eaeaea] shadow-sm hover:shadow-2xl transition-shadow ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default function FeaturesPage() {
  const isAuth = isAuthenticated(StorageKey.ANALYTICS_TOKEN);
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans text-[#111] overflow-x-hidden">
      <header className="py-6 px-6 border-b border-[#eaeaea] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img src={logoBlack} alt="GreyCats Analytics" className="h-8 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <Link to="/features" className="text-[#111]">Features</Link>
            <Link to="/integrations-info" className="text-[#666] hover:text-[#111] transition-colors">Integrations</Link>
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
        {/* Subtle background blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-b from-blue-50/50 via-purple-50/30 to-transparent blur-3xl -z-10 rounded-full" />

        <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 max-w-4xl mx-auto leading-[1.1]"
          >
            Powerful features to simplify your <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#111] via-gray-700 to-gray-500">reporting workflow.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-[#666] mb-16 max-w-2xl mx-auto leading-relaxed tracking-tight"
          >
            Everything you need to aggregate, analyze, and automate your client reports in one place.
          </motion.p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
            <FloatingCard index={0}>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
                <BarChart2 className="w-8 h-8 text-blue-600 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Custom Dashboards</h3>
              <p className="text-[#666] leading-relaxed text-lg">
                Build beautiful, interactive dashboards tailored to your specific needs. Drag and drop widgets to track the KPIs that matter most.
              </p>
            </FloatingCard>
            
            <FloatingCard index={1}>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-purple-100 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
                <Zap className="w-8 h-8 text-purple-600 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Automated Reporting</h3>
              <p className="text-[#666] leading-relaxed text-lg">
                Schedule reports to be sent automatically to your clients via email or Slack. Save hours of manual work every week.
              </p>
            </FloatingCard>

            <FloatingCard index={2}>
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-green-100 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
                <PieChart className="w-8 h-8 text-green-600 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Multi-Platform Integration</h3>
              <p className="text-[#666] leading-relaxed text-lg">
                Connect all your data sources—Google Ads, Meta, Shopify, and more—into a single, unified view. No more logging into 10 different tools.
              </p>
            </FloatingCard>

            <FloatingCard index={3}>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-orange-100 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
                <TrendingUp className="w-8 h-8 text-orange-600 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Advanced Analytics</h3>
              <p className="text-[#666] leading-relaxed text-lg">
                Dive deep into your data with advanced filtering, cross-platform attribution, and real-time alerts for performance anomalies.
              </p>
            </FloatingCard>
          </div>
        </section>

        <section className="py-32 px-6 bg-[#111] text-white text-center relative overflow-hidden">
          {/* Subtle dark mode background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Ready to see it in action?</h2>
            <p className="text-gray-400 text-xl mb-10 leading-relaxed">Start your 14-day free trial today. No credit card required. Cancel anytime.</p>
            <Link to="/pricing" className="inline-flex items-center justify-center gap-3 bg-white text-[#111] px-10 py-5 rounded-full font-bold hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] text-lg">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

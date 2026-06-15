import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoBlack from "../assets/images/greycats-black-logo.png";
import { isAuthenticated, StorageKey } from "@/utils/storage";

// Minimal Attio-style button
const Button = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "primary" 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  className?: string, 
  variant?: "primary" | "secondary" | "ghost" 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out h-10 px-4";
  const variants = {
    primary: "bg-[#18181b] text-white hover:bg-[#27272a] shadow-sm",
    secondary: "bg-white text-[#18181b] border border-[#e4e4e7] hover:bg-[#f4f4f5]",
    ghost: "text-[#71717a] hover:text-[#18181b]"
  };
  
  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const authed = isAuthenticated(StorageKey.ANALYTICS_TOKEN);
  const [activeTab, setActiveTab] = useState("Client");

  const tabs = ["Client", "Social media", "Broadcast", "Report", "AI Suite"];

  return (
    <div className="min-h-[100dvh] bg-white text-[#18181b] font-sans selection:bg-[#f4f4f5] selection:text-[#18181b] overflow-x-hidden flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #ffffff; }
      `}</style>

      {/* Very clean minimalist Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/">
              <img src={logoBlack} alt="GreyCats" className="h-6 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/platform" className="text-sm font-medium text-[#71717a] hover:text-[#18181b] transition-colors flex items-center gap-1">Platform <span className="text-[10px]">▼</span></Link>
              <Link to="/resources" className="text-sm font-medium text-[#71717a] hover:text-[#18181b] transition-colors flex items-center gap-1">Resources <span className="text-[10px]">▼</span></Link>
              <Link to="/customers" className="text-sm font-medium text-[#71717a] hover:text-[#18181b] transition-colors">Customers</Link>
              <Link to="/pricing" className="text-sm font-medium text-[#71717a] hover:text-[#18181b] transition-colors">Pricing</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {authed ? (
              <Button onClick={() => navigate("/clients")}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/auth/login" className="text-sm font-medium text-[#71717a] hover:text-[#18181b] transition-colors">Sign in</Link>
                <Link to="/pricing">
                  <Button variant="primary">Start for free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 pt-32 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center px-4 mb-16">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-[#e4e4e7] bg-white text-xs font-medium text-[#71717a] mb-8 cursor-pointer hover:bg-[#f4f4f5] transition-colors">
            Explore AI frameworks from operators like Elena Verna <span className="ml-1">›</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[#18181b] mb-6 leading-[1.05]">
            The analytics platform <br /> engineered for scale.
          </h1>
          
          <p className="text-lg md:text-xl text-[#71717a] mb-8 max-w-2xl mx-auto leading-relaxed">
            GreyCats is the AI analytics platform that builds reports, accelerates every workflow, and compounds performance around the clock.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link to={authed ? "/clients" : "/pricing"}>
              <Button variant="primary" className="h-11 px-6 text-[15px]">
                {authed ? "Go to Dashboard" : "Start for free"}
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" className="h-11 px-6 text-[15px]">
                Talk to sales
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabbed UI Mockup */}
        <div className="w-full max-w-[1200px] mx-auto px-4">
          
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
                  <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#18181b]" />
                )}
              </button>
            ))}
          </div>

          {/* Mockup Container */}
          <div className="w-full bg-white border border-[#e4e4e7] rounded-t-xl rounded-b-none shadow-sm h-[500px] flex overflow-hidden mt-8">
            
            {/* Sidebar Mockup */}
            <div className="w-64 border-r border-[#e4e4e7] bg-[#fafafa] flex flex-col pt-4">
              <div className="px-4 pb-4 border-b border-[#e4e4e7] mb-2 flex items-center gap-2">
                 <div className="w-6 h-6 bg-[#18181b] rounded-md flex items-center justify-center text-white font-bold text-xs">G</div>
                 <span className="text-sm font-semibold text-[#18181b]">GreyCats Workspace <span>v</span></span>
              </div>
              <div className="px-3 py-1 text-xs text-[#71717a] font-medium flex justify-between items-center group cursor-pointer">
                <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-white border border-[#e4e4e7] inline-block text-center leading-[14px]">Q</span> Quick Actions</span>
              </div>
              
              <div className="mt-4 px-2 space-y-0.5">
                {["Home", "Notifications", "Tasks", "Notes", "Emails", "Reports", "Automations"].map((item, i) => (
                  <div key={item} className={`px-2 py-1.5 text-sm rounded-md cursor-pointer flex items-center gap-2 ${i === 0 ? "bg-[#e4e4e7]/50 text-[#18181b] font-medium" : "text-[#71717a] hover:bg-[#e4e4e7]/30 hover:text-[#18181b]"}`}>
                     <span className="w-4 h-4 rounded-sm border border-transparent"></span>
                     {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Mockup */}
            <div className="flex-1 bg-white p-6 relative">
              <div className="flex items-center gap-2 mb-8 text-sm">
                <span className="font-semibold">{activeTab} view</span>
                <span className="text-[#a1a1aa] px-1.5 py-0.5 border border-[#e4e4e7] rounded text-xs">⌘ K</span>
              </div>

              {activeTab === "Client" && (
                <div className="border border-[#e4e4e7] rounded-lg overflow-hidden">
                   <div className="bg-[#fafafa] border-b border-[#e4e4e7] flex px-4 py-2 text-xs font-semibold text-[#71717a]">
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
                     <div key={i} className="border-b border-[#e4e4e7] last:border-0 flex px-4 py-3 text-sm items-center">
                        <div className="w-8"><div className="w-4 h-4 border border-[#e4e4e7] rounded-sm"></div></div>
                        <div className="flex-1 font-medium flex items-center gap-2">
                           <div className="w-5 h-5 bg-[#18181b] rounded-sm flex items-center justify-center text-white text-[10px]">{row.name[0]}</div>
                           {row.name}
                        </div>
                        <div className="flex-1 text-[#4285F4] text-xs"><span className="px-2 py-1 bg-[#4285F4]/10 rounded-full">{row.domain}</span></div>
                        <div className="flex-1 text-[#71717a] text-xs flex items-center gap-1"><div className="w-4 h-4 bg-gray-200 rounded-full"></div> {row.ints} Connected</div>
                        <div className="w-32"><span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${row.color}`}>{row.status}</span></div>
                     </div>
                   ))}
                </div>
              )}

              {activeTab === "Social media" && (
                <div className="h-full flex flex-col">
                   <div className="text-[#18181b] font-medium mb-4">Post Scheduler</div>
                   <div className="flex gap-4">
                      <div className="w-64 h-64 border border-[#e4e4e7] rounded-lg p-4 bg-[#fafafa]">
                         <div className="w-1/2 h-4 bg-[#e4e4e7] rounded mb-2"></div>
                         <div className="w-full h-3 bg-[#e4e4e7] rounded mb-1"></div>
                         <div className="w-3/4 h-3 bg-[#e4e4e7] rounded"></div>
                      </div>
                      <div className="flex-1 border border-[#e4e4e7] rounded-lg p-4 bg-white flex flex-col justify-end">
                         <div className="flex justify-end gap-2">
                           <div className="px-3 py-1 bg-[#e4e4e7] rounded text-xs">Preview</div>
                           <div className="px-3 py-1 bg-[#18181b] text-white rounded text-xs">Schedule</div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === "Broadcast" && (
                <div className="flex items-center justify-center h-full text-[#a1a1aa] text-sm">
                  Broadcast audience segments and messaging workflows appear here.
                </div>
              )}
              
              {activeTab === "Report" && (
                <div className="flex items-center justify-center h-full text-[#a1a1aa] text-sm">
                  Automated generated reports and dashboards appear here.
                </div>
              )}
              
              {activeTab === "AI Suite" && (
                <div className="flex flex-col items-center justify-center h-full">
                   <div className="text-xl mb-4">✨</div>
                   <div className="px-4 py-2 bg-[#f4f4f5] text-[#71717a] rounded-full text-xs">How do I win my deal with Greenleaf?</div>
                   <div className="mt-4 text-[#a1a1aa] text-sm">Thinking...</div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Brand Logos Footer */}
        <div className="w-full py-20 mt-12 bg-white flex justify-center border-t border-[#e4e4e7]">
           <div className="flex items-center gap-12 opacity-50 grayscale">
              <span className="font-bold text-xl">granola</span>
              <span className="font-bold text-xl">Flow</span>
              <span className="font-bold text-xl">Listen</span>
              <span className="font-bold text-xl">Obvious</span>
              <span className="font-bold text-xl">Modal</span>
              <span className="font-bold text-xl">USV</span>
           </div>
        </div>
      </main>

    </div>
  );
};

export default LandingPage;

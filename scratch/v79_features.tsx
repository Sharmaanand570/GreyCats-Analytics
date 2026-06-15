import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const FEATURES_DATA = [
  {
    id: "analytics",
    title: "Analytics",
    desc: "Unify your marketing data from multiple sources. Get a crystal-clear view of your performance across all platforms in real time."
  },
  {
    id: "reports",
    title: "Reports",
    desc: "Automate client reporting and generate stunning, brandable dashboards in seconds. Say goodbye to manual spreadsheets."
  },
  {
    id: "seo",
    title: "SEO Tools",
    desc: "Monitor and optimize your search presence. Track keyword rankings and identify opportunities to climb the search results."
  },
  {
    id: "scheduler",
    title: "Scheduler",
    desc: "Plan, schedule, and publish your content across all social channels from one unified calendar."
  },
  {
    id: "broadcast",
    title: "Broadcast",
    desc: "Send personalized campaigns, alerts, and updates to your audience via Email, SMS, and WhatsApp effortlessly."
  }
];

const FeatureItem = ({ index, feature, isActive, setActiveIdx }) => {
  return (
    <div
      className={`p-6 md:p-8 rounded-2xl cursor-pointer transition-all duration-500 border ${
        isActive 
          ? "bg-white border-[#e5e5e5] shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
          : "bg-transparent border-transparent hover:bg-[#f9f9f9]"
      }`}
      onClick={() => setActiveIdx(index)}
    >
      <h3 className={`text-xl md:text-2xl font-bold mb-3 transition-colors ${isActive ? "text-[#111]" : "text-[#888]"}`}>
        {feature.title}
      </h3>
      <div className={`grid transition-all duration-500 ${isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <p className="overflow-hidden text-[#555] leading-relaxed text-sm md:text-base">
          {feature.desc}
        </p>
      </div>
    </div>
  );
};

export const FeaturesSection = () => {
  const containerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate active index based on scroll position if the user scrolls, but we also allow click.
  // Actually, the original implementation probably tracked scroll directly:
  // No(i,"change",a=>{const o=Math.min(4,Math.max(0,Math.floor(a*5)));s(o)});
  scrollYProgress.onChange((v) => {
    const idx = Math.min(FEATURES_DATA.length - 1, Math.max(0, Math.floor(v * FEATURES_DATA.length)));
    setActiveIdx(idx);
  });

  const yTransform = useTransform(
    scrollYProgress,
    [0, 0.15, 0.25, 0.4, 0.5, 0.65, 0.75, 0.9, 1],
    ["0%", "0%", "-20%", "-20%", "-40%", "-40%", "-60%", "-60%", "-80%"]
  );

  return (
    <section ref={containerRef} id="features" className="relative h-[500vh] z-20 bg-white">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden w-full relative">
        <div className="max-w-[1200px] mx-auto w-full px-6 h-full flex items-center relative z-10 pointer-events-none">
          
          {/* Left Column - Text content */}
          <div className="w-full md:w-[40%] flex flex-col gap-2 md:gap-4 lg:gap-6 py-8 pointer-events-auto">
            <div className="mb-6 md:mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#18181b] leading-tight pr-4">
                Analyze, broadcast, and rank higher.
              </h2>
            </div>
            {FEATURES_DATA.map((feature, idx) => (
              <FeatureItem 
                key={feature.id} 
                index={idx} 
                feature={feature} 
                isActive={activeIdx === idx} 
                setActiveIdx={setActiveIdx} 
              />
            ))}
          </div>
          
        </div>

        {/* Right Column - Images */}
        <div className="absolute right-0 bottom-0 w-[55vw] h-[80vh] z-0 pointer-events-none hidden md:block">
          <motion.div className="flex flex-col w-full h-[500%]" style={{ y: yTransform }}>
            {FEATURES_DATA.map((feature, idx) => (
              <div 
                key={feature.id} 
                className={`w-full h-1/5 flex items-start justify-end transition-all duration-700 pointer-events-auto ${activeIdx === idx ? "opacity-100 scale-100" : "opacity-30 scale-95"}`}
              >
                <div className="w-full h-full bg-white rounded-tl-[2rem] overflow-hidden shadow-[-10px_-10px_30px_rgba(0,0,0,0.03)] border-t border-l border-[#e5e5e5] flex items-center justify-center p-6">
                  <div className="w-full h-full rounded-[1.5rem] overflow-hidden border border-[#e5e5e5] shadow-sm">
                    {/* Render the SAME image for all of them! */}
                    <img src="/mockup.png" alt="Mockup" className="w-full h-full object-cover object-left-top" />
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

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
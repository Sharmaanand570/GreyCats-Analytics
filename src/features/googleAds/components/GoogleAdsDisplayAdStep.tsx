import { useState } from "react";
import { ChevronUp, ChevronDown, Info, HelpCircle, Image as ImageIcon, Edit2, PlaySquare, Plus, Mail, MonitorPlay, AlertTriangle, CheckSquare } from "lucide-react";

interface AdStepProps {
  onNext: () => void;
}

export default function GoogleAdsDisplayAdStep({ onNext }: AdStepProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("additional_format");
  const [activePreviewTab, setActivePreviewTab] = useState("display");

  const toggleSection = (section: string) => {
    if (expandedSection === section) setExpandedSection(null);
    else setExpandedSection(section);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[22px] font-normal text-slate-800 mb-2">Ads</h2>

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col">
        {/* Top Header of Ad Container */}
        <div className="px-6 py-4 border-b border-slate-200 text-[13px] font-medium text-slate-800">
          Ad creation
        </div>
        
        <div className="px-6 py-8 border-b border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="text-[13px] text-slate-800">In Progress</div>
          <div className="text-[14px] font-medium text-slate-800 mt-1 mb-1">Responsive display ad</div>
          <div className="text-[13px] text-blue-600 cursor-pointer hover:underline">Change</div>
        </div>

        {/* Ad Tracker Bar */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <button className="hover:text-slate-800"><ChevronDown className="w-4 h-4 rotate-90" /></button>
              <button className="hover:text-slate-800"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-slate-600">
              <div className="w-6 h-6 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center font-bold text-[12px]">!</div>
              Add a final URL
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600"></div>
              <div className="flex flex-col">
                <div className="text-[13px] font-medium text-slate-800 flex items-center gap-1">Ad strength <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></div>
                <div className="text-[12px] text-slate-500">Incomplete</div>
              </div>
            </div>
            <div className="flex gap-6 text-[12px] text-slate-600">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-slate-400"></div> Images</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-slate-400"></div> Videos</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-slate-400"></div> Headlines</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-slate-400"></div> Descriptions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex min-h-[600px]">
          
          {/* Left Form */}
          <div className="w-[50%] border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto max-h-[800px]">
            
            {/* Final URL */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-slate-800 font-medium flex items-center gap-1">Final URL <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></label>
              <input type="text" value="https://www.example.com" className="w-full border border-slate-300 rounded px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="text-[11px] text-slate-500">Required</div>
            </div>

            {/* Business Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-slate-800 font-medium flex items-center gap-1">Business name <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></label>
              <input type="text" value="Shobha Shringar" className="w-full border border-slate-300 rounded px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Required</span>
                <span>15 / 25</span>
              </div>
            </div>

            {/* Images */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-slate-800 font-medium flex items-center gap-1">Images <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></label>
              <div className="text-[12px] text-slate-500 mb-1">Add up to 15 images <a href="#" className="text-blue-600 hover:underline">Learn more</a></div>
              <div className="flex gap-4">
                <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded -ml-2">
                  <Plus className="w-4 h-4" /> Images
                </button>
                <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded">
                  <ImageIcon className="w-4 h-4" /> Generate images
                </button>
              </div>
              <div className="text-[12px] text-slate-500 mt-1">
                At least 1 landscape image is required<br/>
                At least 1 square image is required
              </div>
            </div>

            {/* Logos */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-slate-800 font-medium flex items-center gap-1">Logos <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></label>
              <div className="text-[12px] text-slate-500 mb-1">Add up to 5 logos</div>
              <div className="flex flex-col gap-2 w-max">
                <div className="w-[50px] h-[50px] bg-slate-900 rounded flex items-center justify-center overflow-hidden border border-slate-200">
                  <div className="text-white text-[8px] tracking-wider text-center px-1 font-serif">SHOBHA<br/>SHRINGAR<br/><span className="text-[5px]">JEWELLERS</span></div>
                </div>
                <button className="flex items-center gap-1 text-[12px] font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded -ml-2">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>

            {/* Videos */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-slate-800 font-medium flex items-center gap-1">Videos</label>
              <div className="text-[12px] text-slate-500 mb-1">Optional (portrait and landscape around 30 seconds work best)</div>
              <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded w-max -ml-2">
                <Plus className="w-4 h-4" /> Videos
              </button>
            </div>

            {/* Headlines */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] text-slate-800 font-medium flex items-center gap-1">Headlines <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></label>
                <div className="text-[12px] text-blue-600 cursor-pointer">More ideas</div>
              </div>
              <div className="text-[12px] text-slate-500 mb-1">Add up to 5 headlines<br/>Suggested headlines</div>
              <div className="flex items-center gap-1 text-[12px] text-slate-600 mb-2">
                <Info className="w-3.5 h-3.5 text-blue-600" /> We don't have any suggestions right now.
              </div>
              <div className="flex flex-col gap-1">
                <input type="text" placeholder="Headline" className="w-full border border-slate-300 rounded px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Required</span>
                  <span>0 / 30</span>
                </div>
              </div>
              <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded w-max -ml-2 mt-1">
                <Plus className="w-4 h-4" /> Headline
              </button>
            </div>

            {/* Long Headline */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-slate-800 font-medium flex items-center gap-1">Long headline <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></label>
              <input type="text" placeholder="Long headline" className="w-full border border-slate-300 rounded px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Required</span>
                <span>0 / 90</span>
              </div>
            </div>

            {/* Descriptions */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] text-slate-800 font-medium flex items-center gap-1">Descriptions <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></label>
                <div className="text-[12px] text-blue-600 cursor-pointer">More ideas</div>
              </div>
              <div className="text-[12px] text-slate-500 mb-1">Add up to 5 descriptions<br/>Suggested descriptions</div>
              <div className="flex items-center gap-1 text-[12px] text-slate-600 mb-2">
                <Info className="w-3.5 h-3.5 text-blue-600" /> We don't have any suggestions right now.
              </div>
              <div className="flex flex-col gap-1">
                <input type="text" placeholder="Description" className="w-full border border-slate-300 rounded px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Required</span>
                  <span>0 / 90</span>
                </div>
              </div>
              <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded w-max -ml-2 mt-1">
                <Plus className="w-4 h-4" /> Description
              </button>
            </div>

            {/* Additional format options */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <div 
                onClick={() => toggleSection("additional_format")}
                className="bg-slate-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100"
              >
                <span className="text-[13px] font-medium text-slate-800">Additional format options</span>
                {expandedSection === "additional_format" ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>
              {expandedSection === "additional_format" && (
                <div className="p-4 bg-white flex flex-col gap-4">
                  <div className="bg-[#e8f0fe] rounded p-3 flex gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-[12px] text-slate-800">Select all options to optimize your ad's reach and performance</span>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="bg-blue-600 rounded w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckSquare className="w-3 h-3 text-white bg-blue-600 rounded" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] text-slate-800 font-medium">Use asset enhancements</span>
                      <span className="text-[12px] text-slate-500">Let Google enhance your assets and optimize your ad layouts. This could improve ad performance. <a href="#" className="text-blue-600 hover:underline">Learn more</a></span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="bg-blue-600 rounded w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckSquare className="w-3 h-3 text-white bg-blue-600 rounded" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] text-slate-800 font-medium">Use auto-generated video</span>
                      <span className="text-[12px] text-slate-500">Let Google create your video ads using your headlines, descriptions and images. If you've added your own video content, then your ads won't use auto-generated video. <a href="#" className="text-blue-600 hover:underline">Learn more</a></span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="bg-blue-600 rounded w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckSquare className="w-3 h-3 text-white bg-blue-600 rounded" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] text-slate-800 font-medium">Use native formats</span>
                      <span className="text-[12px] text-slate-500">Include native formats to expand your reach to more publishers. Adding native formats might also improve ad performance. <a href="#" className="text-blue-600 hover:underline">Learn more</a></span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Ad URL options */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <div 
                onClick={() => toggleSection("url_options")}
                className="bg-white px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50"
              >
                <span className="text-[13px] font-medium text-slate-800">Ad URL options</span>
                {expandedSection === "url_options" ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>
              {expandedSection === "url_options" && (
                <div className="p-4 bg-white flex flex-col gap-4 border-t border-slate-200">
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <input type="text" placeholder="Tracking template" className="w-full border border-slate-300 rounded px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500">Example: https://www.trackingtemplate.foo/?url={"{lpurl}"}&id=5</div>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <div className="relative">
                      <input type="text" placeholder="Final URL suffix" className="w-full border border-slate-300 rounded px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500">Example: param1=value1&param2=value2</div>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[13px] text-slate-800 font-medium flex items-center gap-1">Custom parameter <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></label>
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="{_Name}" className="w-[120px] border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-slate-500">=</span>
                      <input type="text" placeholder="Value" className="w-[200px] border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
                      <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center text-blue-600 cursor-pointer">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-[13px] text-blue-600 font-medium cursor-pointer hover:underline">Test</div>

                  <label className="flex items-center gap-3 cursor-pointer mt-2">
                    <input type="checkbox" className="w-4 h-4 border-slate-300 rounded text-blue-600 focus:ring-blue-600" />
                    <span className="text-[13px] text-slate-800">Use a different final URL for mobile</span>
                  </label>
                </div>
              )}
            </div>

            <button className="flex items-center justify-between border border-slate-300 rounded px-4 py-2 w-max">
              <span className="text-[13px] text-slate-600 font-medium mr-2">More options</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            <div className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Your ads might not always include all your text and images. Some cropping or shortening may occur in some formats, and either of your custom colors may be used.
            </div>

          </div>

          {/* Right Preview */}
          <div className="flex-1 bg-[#f8f9fa] flex flex-col relative">
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 bg-white">
              <div className="text-[13px] font-medium text-slate-800">Preview</div>
              <div className="flex gap-4 text-[13px] text-blue-600 font-medium">
                <span className="cursor-pointer hover:underline">Share</span>
                <span className="cursor-pointer hover:underline">Preview ads</span>
              </div>
            </div>
            
            <div className="flex justify-center border-b border-slate-200 bg-white">
              <button 
                onClick={() => setActivePreviewTab("display")}
                className={`flex flex-col items-center gap-1 px-6 py-3 border-b-2 transition-colors ${activePreviewTab === "display" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-800"}`}
              >
                <MonitorPlay className="w-5 h-5" />
                <span className="text-[12px] font-medium">Display</span>
              </button>
              <button 
                onClick={() => setActivePreviewTab("gmail")}
                className={`flex flex-col items-center gap-1 px-6 py-3 border-b-2 transition-colors ${activePreviewTab === "gmail" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-800"}`}
              >
                <Mail className="w-5 h-5 text-red-500" />
                <span className="text-[12px] font-medium text-slate-800">Gmail</span>
              </button>
              <button 
                onClick={() => setActivePreviewTab("youtube")}
                className={`flex flex-col items-center gap-1 px-6 py-3 border-b-2 transition-colors ${activePreviewTab === "youtube" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-800"}`}
              >
                <PlaySquare className="w-5 h-5 text-red-600" />
                <span className="text-[12px] font-medium text-slate-800">YouTube</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
              <div className="relative flex items-center justify-center w-full">
                <button className="absolute left-10 p-2 rounded-full hover:bg-slate-200 text-slate-500 z-10"><ChevronDown className="w-5 h-5 rotate-90" /></button>
                
                <div className="w-[280px] h-[500px] border-[6px] border-slate-300 rounded-[2.5rem] bg-white shadow-sm overflow-hidden relative">
                  
                  {/* Mock Warning Box inside Preview */}
                  <div className="absolute inset-4 mt-6">
                    <div className="bg-orange-50 border border-orange-200 rounded p-4 flex gap-3 shadow-sm">
                      <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-2">
                        <div className="text-[12px] font-medium text-slate-800 leading-snug">To unlock this format, add the following assets:</div>
                        <ul className="list-disc pl-4 text-[11px] text-slate-700 flex flex-col gap-1">
                          <li>1 headline or long headline</li>
                          <li>1 disclaimer or description</li>
                          <li>1 horizontal image</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal lines to mimic content */}
                  <div className="absolute bottom-16 left-6 right-6 flex flex-col gap-3">
                    <div className="h-1 bg-slate-200 rounded w-full"></div>
                    <div className="h-1 bg-slate-200 rounded w-full"></div>
                    <div className="h-1 bg-slate-200 rounded w-[80%]"></div>
                    <div className="h-1 bg-slate-200 rounded w-[90%]"></div>
                    <div className="h-1 bg-slate-200 rounded w-[60%]"></div>
                  </div>

                  {/* Pagination dots at bottom */}
                  <div className="absolute bottom-6 w-full flex justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                  </div>
                </div>

                <button className="absolute right-10 p-2 rounded-full hover:bg-slate-200 text-slate-500 z-10"><ChevronDown className="w-5 h-5 -rotate-90" /></button>
              </div>

              <div className="text-[11px] text-slate-500 mt-8 text-center max-w-[360px] leading-relaxed">
                Previews shown here are examples and don't include all possible formats. You're responsible for the content of your ads. Please make sure that your provided assets don't violate any Google policies or applicable laws, either individually, or in combination.
              </div>
            </div>

          </div>

        </div>

        {/* Footer of Ad Container */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center gap-4">
          <button className="text-[13px] font-medium text-slate-400 cursor-not-allowed">Create ad</button>
          <button className="text-[13px] font-medium text-blue-600 hover:bg-blue-50 px-4 py-2 rounded">Cancel</button>
        </div>

      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
        <button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

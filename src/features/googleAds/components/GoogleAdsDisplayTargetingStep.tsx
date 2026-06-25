import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Trash2, Globe, Tag, Users } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";

interface TargetingStepProps {
  onNext: () => void;
}

export default function GoogleAdsDisplayTargetingStep({ onNext }: TargetingStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Parse existing
  const adGroup = payload.adGroups?.[0] || {} as any;
  const initialPlacements = adGroup.placements || [];
  const initialTopics = adGroup.topics || [];
  const initialDemographics = adGroup.demographics || [];

  const [placements, setPlacements] = useState<any[]>(initialPlacements);
  const [placementInput, setPlacementInput] = useState("");

  const [topics, setTopics] = useState<any[]>(initialTopics);
  const [topicInput, setTopicInput] = useState("");

  const [demographics, setDemographics] = useState<any[]>(initialDemographics);

  // Sync to payload
  useEffect(() => {
    updatePayload({
      adGroups: [{
        ...adGroup,
        placements,
        topics,
        demographics
      }] as any
    });
  }, [placements, topics, demographics]);

  const addPlacement = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && placementInput.trim()) {
      e.preventDefault();
      setPlacements([...placements, { url: placementInput.trim() }]);
      setPlacementInput("");
    }
  };

  const removePlacement = (idx: number) => {
    setPlacements(placements.filter((_, i) => i !== idx));
  };

  const addTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && topicInput.trim()) {
      e.preventDefault();
      // Expecting topic ID
      setTopics([...topics, { id: topicInput.trim() }]);
      setTopicInput("");
    }
  };

  const removeTopic = (idx: number) => {
    setTopics(topics.filter((_, i) => i !== idx));
  };

  const toggleDemographic = (id: string) => {
    if (demographics.find(d => d.id === id)) {
      setDemographics(demographics.filter(d => d.id !== id));
    } else {
      setDemographics([...demographics, { id }]);
    }
  };

  const hasDemographic = (id: string) => !!demographics.find(d => d.id === id);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="flex flex-col gap-4 max-w-[800px] pb-20">
      <h2 className="text-[22px] font-normal text-slate-800 mb-2">Targeting</h2>

      <div className="border border-slate-200 rounded-md bg-white">
        <div className="p-6 flex items-start gap-6 border-b border-slate-200">
          <div className="flex-1">
            <h3 className="text-[18px] font-normal text-slate-800 mb-2">Optimized targeting is set up for you</h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Optimized targeting helps you get more conversions by using information such as your landing page and assets. You can opt out or speed up optimization by adding targeting first. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
            </p>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-slate-200">
          
          {/* Placements */}
          <div className="flex flex-col">
            <div 
              className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
              onClick={() => toggleSection('placements')}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-[13px] text-slate-800 font-medium">Placements ({placements.length})</div>
                  <div className="text-[12px] text-slate-500">Suggest websites, videos, or apps where you'd like to show your ads</div>
                </div>
              </div>
              {expandedSection === 'placements' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
            {expandedSection === 'placements' && (
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <div className="mb-4">
                  <input 
                    type="text" 
                    value={placementInput}
                    onChange={(e) => setPlacementInput(e.target.value)}
                    onKeyDown={addPlacement}
                    placeholder="Enter a website URL and press Enter (e.g. www.youtube.com)"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {placements.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded">
                      <span className="text-[13px] text-slate-800">{p.url}</span>
                      <Trash2 className="w-4 h-4 text-slate-400 cursor-pointer hover:text-red-500" onClick={() => removePlacement(i)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Topics */}
          <div className="flex flex-col">
            <div 
              className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
              onClick={() => toggleSection('topics')}
            >
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-[13px] text-slate-800 font-medium">Topics ({topics.length})</div>
                  <div className="text-[12px] text-slate-500">Suggest webpages, apps, and videos about a certain topic using Google Ads Topic IDs</div>
                </div>
              </div>
              {expandedSection === 'topics' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
            {expandedSection === 'topics' && (
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <div className="mb-4">
                  <input 
                    type="text" 
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={addTopic}
                    placeholder="Enter a Topic ID and press Enter (e.g. 3)"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {topics.map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded">
                      <span className="text-[13px] text-slate-800">Topic ID: {t.id}</span>
                      <Trash2 className="w-4 h-4 text-slate-400 cursor-pointer hover:text-red-500" onClick={() => removeTopic(i)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Demographics */}
          <div className="flex flex-col">
            <div 
              className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
              onClick={() => toggleSection('demographics')}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-[13px] text-slate-800 font-medium">Demographics ({demographics.length} selected)</div>
                  <div className="text-[12px] text-slate-500">Suggest people based on age, gender, parental status, or household income</div>
                </div>
              </div>
              {expandedSection === 'demographics' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
            {expandedSection === 'demographics' && (
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-6">
                
                {/* Gender */}
                <div>
                  <h4 className="text-[13px] font-medium text-slate-800 mb-3">Gender</h4>
                  <div className="flex flex-wrap gap-3">
                    {['male', 'female', 'unknown'].map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border border-slate-200 rounded">
                        <input 
                          type="checkbox" 
                          checked={hasDemographic(g)}
                          onChange={() => toggleDemographic(g)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300"
                        />
                        <span className="text-[13px] text-slate-700 capitalize">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div>
                  <h4 className="text-[13px] font-medium text-slate-800 mb-3">Age</h4>
                  <div className="flex flex-wrap gap-3">
                    {['18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'unknown'].map(a => (
                      <label key={a} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border border-slate-200 rounded">
                        <input 
                          type="checkbox" 
                          checked={hasDemographic(a)}
                          onChange={() => toggleDemographic(a)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300"
                        />
                        <span className="text-[13px] text-slate-700">{a === 'unknown' ? 'Unknown' : a}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

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

import { useState } from "react";
import { ChevronRight, ChevronLeft, Download, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DimensionsSelector } from "./DimensionsSelector";
import { MetricsSelector } from "./MetricsSelector";
import { SegmentSelector } from "./SegmentSelector";

interface ReportBuilderLayoutProps {
  children: React.ReactNode;
  onRunReport: (query: string) => void;
  isRunning: boolean;
}

export function ReportBuilderLayout({ children, onRunReport, isRunning }: ReportBuilderLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("metrics");

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  const generateQuery = () => {
    const selects = [...selectedDimensions, ...selectedSegments, ...selectedMetrics];
    if (selects.length === 0) return "";
    
    // Simplistic query generation for the UI 
    return `SELECT ${selects.join(", ")} FROM campaign`;
  };

  const handleRun = () => {
    const q = generateQuery();
    if (q) onRunReport(q);
  };

  return (
    <div className="flex w-full h-full bg-white overflow-hidden">
      
      {/* ── LEFT SIDEBAR (BUILDER) ── */}
      <div 
        className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ${sidebarOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}
      >
        <div className="p-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">Report Builder</h2>
          <p className="text-xs text-slate-500 mt-1">Select fields to build your custom GAQL report.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 pt-2 border-b border-slate-200 shrink-0">
            <TabsList className="w-full bg-transparent p-0 gap-4 justify-start">
              <TabsTrigger 
                value="metrics" 
                className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=inactive]:text-slate-500"
              >
                Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="dimensions"
                className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=inactive]:text-slate-500"
              >
                Dimensions
              </TabsTrigger>
              <TabsTrigger 
                value="segments"
                className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=inactive]:text-slate-500"
              >
                Segments
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="metrics" className="m-0 h-full">
              <MetricsSelector selectedMetrics={selectedMetrics} onChange={setSelectedMetrics} />
            </TabsContent>
            <TabsContent value="dimensions" className="m-0 h-full">
              <DimensionsSelector selectedDimensions={selectedDimensions} onChange={setSelectedDimensions} />
            </TabsContent>
            <TabsContent value="segments" className="m-0 h-full">
              <SegmentSelector selectedSegments={selectedSegments} onChange={setSelectedSegments} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-4 border-t border-slate-200 shrink-0 flex items-center justify-between bg-slate-50">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => {
            setSelectedMetrics([]);
            setSelectedDimensions([]);
            setSelectedSegments([]);
          }}>
            Clear
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs" onClick={handleRun} disabled={isRunning || (selectedMetrics.length === 0 && selectedDimensions.length === 0)}>
            {isRunning ? "Running..." : "Run Report"}
          </Button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        
        {/* TOP TOOLBAR */}
        <div className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 h-8 w-8 text-slate-500 hover:bg-slate-100"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
            <h1 className="text-lg font-medium text-slate-800">Custom Report</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-2 text-slate-600">
              <Save className="w-4 h-4" /> Save
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-slate-600">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-slate-600">
              <Plus className="w-4 h-4" /> Schedule
            </Button>
          </div>
        </div>

        {/* QUERY PREVIEW BAR (Optional) */}
        {(selectedMetrics.length > 0 || selectedDimensions.length > 0 || selectedSegments.length > 0) && (
           <div className="bg-blue-50/50 border-b border-blue-100 p-3 px-6 shrink-0 text-xs text-blue-800 font-mono overflow-x-auto whitespace-nowrap">
             {generateQuery()}
           </div>
        )}

        {/* TABLE CONTENT */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden flex flex-col">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}

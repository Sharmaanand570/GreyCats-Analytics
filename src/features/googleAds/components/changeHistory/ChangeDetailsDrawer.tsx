
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../../components/ui/sheet";
import type { ChangeEvent } from "../../types/googleAds.types";
import { format } from "date-fns";
import { ArrowRight, Activity, Clock, User, Tag } from "lucide-react";

export function ChangeDetailsDrawer({ change, open, onClose }: { change: ChangeEvent; open: boolean; onClose: () => void }) {
  
  const renderJsonDiff = (oldRes: any, newRes: any) => {
    // Basic diff rendering logic
    const allKeys = Array.from(new Set([...Object.keys(oldRes || {}), ...Object.keys(newRes || {})]));

    return (
      <div className="space-y-4">
        {allKeys.map(key => {
          const oldVal = oldRes?.[key];
          const newVal = newRes?.[key];
          
          if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return null;

          return (
            <div key={key} className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
              <div className="font-medium text-slate-800 mb-2">{key}</div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-red-50 text-red-700 p-3 rounded text-sm font-mono break-all relative">
                  <div className="absolute top-1 left-2 text-[10px] uppercase font-bold text-red-400">Before</div>
                  <div className="mt-2">{oldVal !== undefined ? JSON.stringify(oldVal, null, 2) : "null"}</div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex-1 bg-green-50 text-green-700 p-3 rounded text-sm font-mono break-all relative">
                  <div className="absolute top-1 left-2 text-[10px] uppercase font-bold text-green-400">After</div>
                  <div className="mt-2">{newVal !== undefined ? JSON.stringify(newVal, null, 2) : "null"}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl flex flex-col p-0 gap-0 bg-slate-50 overflow-hidden font-['Inter']">
        <SheetHeader className="px-6 py-5 border-b border-slate-200 bg-white shrink-0">
          <SheetTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Change Details
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Date & Time</div>
                <div className="text-slate-900 font-medium mt-0.5">
                  {format(new Date(change.changeDateTime), "MMM d, yyyy 'at' h:mm:ss a")}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">User</div>
                <div className="text-slate-900 font-medium mt-0.5">{change.userEmail}</div>
                <div className="text-xs text-slate-500">{change.clientType}</div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3 col-span-2">
              <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Resource</div>
                <div className="text-slate-900 font-medium mt-0.5">{change.changeResourceName}</div>
                <div className="text-sm text-slate-600 mt-1 flex gap-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{change.changeResourceType}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    change.changeStatus === 'CREATED' ? 'bg-green-100 text-green-700' :
                    change.changeStatus === 'UPDATED' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {change.changeStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Diffs */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4">Property Changes</h3>
            
            {change.changeStatus === "CREATED" ? (
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-green-700 font-medium mb-3">Resource Created</div>
                <pre className="text-xs text-slate-700 font-mono bg-slate-50 p-4 rounded overflow-auto max-h-[400px]">
                  {JSON.stringify(change.newResource, null, 2)}
                </pre>
              </div>
            ) : change.changeStatus === "REMOVED" ? (
               <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                 <div className="text-sm text-red-700 font-medium mb-3">Resource Removed</div>
                 <pre className="text-xs text-slate-700 font-mono bg-slate-50 p-4 rounded overflow-auto max-h-[400px]">
                   {JSON.stringify(change.oldResource, null, 2)}
                 </pre>
               </div>
            ) : (
              renderJsonDiff(change.oldResource, change.newResource)
            )}
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}

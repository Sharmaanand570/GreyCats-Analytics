import React, { useState } from "react";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import { useCreateUserList } from "../hooks/useCampaignManagement";
import { toast } from "sonner";

interface CreateAudienceModalProps {
  onClose: () => void;
  clientId?: number;
}

export default function CreateAudienceModal({ onClose, clientId = 1 }: CreateAudienceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"REMARKETING" | "CUSTOM_AFFINITY" | "CUSTOM_INTENT" | "CUSTOMER_MATCH">("REMARKETING");
  const [lifespan, setLifespan] = useState("30");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const createAudience = useCreateUserList(clientId);

  // Let's use the API directly for the job upload since we get the userListId back from createAudience.
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (Max 10MB)");
      return;
    }
    setCsvFile(file);
    try {
      const text = await file.text();
      const parsedEmails = text
        .split(/[\n,;]+/)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t));
      setEmails(Array.from(new Set(parsedEmails)));
    } catch {
      toast.error("Couldn't read that file. Try a plain UTF-8 .csv");
      setCsvFile(null);
    }
  };

  const handleCreate = () => {
    if (!name) return;
    if (type === "CUSTOMER_MATCH" && emails.length === 0) {
      toast.error("Please upload a valid CSV file with emails for Customer Match");
      return;
    }

    createAudience.mutate({
      name,
      description,
      type,
      membershipLifeSpan: parseInt(lifespan) || 30
    }, {
      onSuccess: async (data) => {
        if (type === "CUSTOMER_MATCH" && data.userListId && emails.length > 0) {
          try {
            // Import api function directly
            const { createOfflineUserDataJob } = await import("../API/campaignManagementApi");
            await createOfflineUserDataJob(clientId, data.userListId, { emails });
            toast.success(`Uploaded ${emails.length} records to Customer Match list`);
          } catch (e: any) {
            toast.error(e.message || "Failed to upload customer data");
          }
        }
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-800">Create Audience</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Audience Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Visitors 30 Days"
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this audience..."
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="REMARKETING">Remarketing (Website/App visitors)</option>
              <option value="CUSTOM_AFFINITY">Custom Affinity</option>
              <option value="CUSTOM_INTENT">Custom Intent</option>
              <option value="CUSTOMER_MATCH">Customer Match (Email list)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Membership Lifespan (Days)</label>
            <input
              type="number"
              value={lifespan}
              min="1"
              max="540"
              onChange={(e) => setLifespan(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={type === "CUSTOMER_MATCH"}
            />
            <p className="text-xs text-slate-500 mt-1">Number of days a user remains in this segment (1-540). Customer match lists usually do not expire automatically.</p>
          </div>

          {type === "CUSTOMER_MATCH" && (
            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Upload Customer Data</h3>
              <p className="text-xs text-blue-800 mb-4">
                Upload a CSV file containing your customer data. Supported fields include Email, Phone Number, First Name, Last Name, Country, and Zip Code.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Choose CSV File
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFile}
                  className="hidden"
                />
                {csvFile && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{csvFile.name}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {emails.length} valid records
                    </span>
                  </div>
                )}
              </div>
              
              {csvFile && emails.length === 0 && (
                <div className="flex items-center gap-2 mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Could not find any valid email records in this file. Please ensure it's a valid CSV.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name || createAudience.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createAudience.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

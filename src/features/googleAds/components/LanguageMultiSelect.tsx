import { useState } from "react";
import { Search, X } from "lucide-react";

export const AVAILABLE_LANGUAGES = [
  "All languages", "Arabic", "Bengali", "Bulgarian", "Catalan", "Chinese (simplified)",
  "Chinese (traditional)", "Croatian", "Czech", "Danish", "Dutch", "English", "Estonian",
  "Filipino", "Finnish", "French", "German", "Greek", "Gujarati", "Hebrew", "Hindi",
  "Hungarian", "Indonesian", "Italian", "Japanese", "Kannada", "Korean", "Latvian",
  "Lithuanian", "Malay", "Malayalam", "Marathi", "Norwegian", "Persian", "Polish",
  "Portuguese", "Punjabi", "Romanian", "Russian", "Serbian", "Slovak", "Slovenian",
  "Spanish", "Swedish", "Tamil", "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu", "Vietnamese",
];

interface LanguageMultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
}

/** Reusable language multi-select used by Search/Display/Demand Gen settings. */
export default function LanguageMultiSelect({ value, onChange }: LanguageMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const toggle = (lang: string) => {
    if (lang === "All languages") {
      onChange(["All languages"]);
      return;
    }
    const withoutAll = value.filter((l) => l !== "All languages");
    onChange(withoutAll.includes(lang) ? withoutAll.filter((l) => l !== lang) : [...withoutAll, lang]);
  };

  const filtered = AVAILABLE_LANGUAGES.filter((l) => l.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="relative w-full max-w-[400px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Start typing or select a language"
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-sm text-[13px] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {open && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-lg rounded-sm max-h-[300px] overflow-y-auto z-[100] py-2">
            {filtered.map((lang) => (
              <div
                key={lang}
                onMouseDown={(e) => { e.preventDefault(); toggle(lang); setQuery(""); }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer"
              >
                <input type="checkbox" checked={value.includes(lang)} readOnly className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 pointer-events-none" />
                <span className="text-[13px] text-slate-800">{lang}</span>
              </div>
            ))}
            {filtered.length === 0 && <div className="px-4 py-3 text-[13px] text-slate-500 text-center">No languages found</div>}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {value.map((lang) => (
          <div key={lang} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-white text-[13px] text-slate-700 shadow-sm">
            {lang}
            <X className="w-3.5 h-3.5 cursor-pointer text-slate-500 hover:text-slate-700" onClick={() => onChange(value.filter((l) => l !== lang))} />
          </div>
        ))}
      </div>
    </div>
  );
}

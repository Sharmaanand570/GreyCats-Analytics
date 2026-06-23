import { ChevronRight, ChevronDown, Building2, User } from "lucide-react";
import { useState } from "react";
import type { GoogleAdsAccount } from "../../types/googleAds.types";

interface AccountHierarchyTreeProps {
  account: GoogleAdsAccount;
  level?: number;
  onSelect: (account: GoogleAdsAccount) => void;
  selectedId?: number;
}

export function AccountHierarchyTree({ account, level = 0, onSelect, selectedId }: AccountHierarchyTreeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = account.children && account.children.length > 0;
  const isSelected = selectedId === account.id;

  return (
    <div className="w-full">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-slate-100 rounded cursor-pointer ${isSelected ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        <div 
          className="w-4 h-4 flex items-center justify-center shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {hasChildren && (
            isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-1" onClick={() => onSelect(account)}>
          {account.isManager ? (
            <Building2 className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
          ) : (
            <User className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
          )}
          <span className="text-sm font-medium truncate">{account.descriptiveName}</span>
          <span className="text-xs text-slate-400 ml-auto">{account.id}</span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="w-full">
          {account.children!.map((child: GoogleAdsAccount) => (
            <AccountHierarchyTree 
              key={child.id} 
              account={child} 
              level={level + 1} 
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

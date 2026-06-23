import { useState, useMemo } from "react";
  // @ts-expect-error unused variable
import { Check, ChevronsUpDown, Building2, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAccessibleCustomers } from "../../hooks/useCampaignManagement";
  // @ts-expect-error unused variable
import type { GoogleAdsAccount } from "../../types/googleAds.types";

interface AccountSwitcherProps {
  selectedClientId?: number;
  onSelectClient: (clientId: number) => void;
}

export function AccountSwitcher({ selectedClientId, onSelectClient }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useAccessibleCustomers();

  const accounts = useMemo(() => data?.customers ?? [], [data?.customers]);
  
  const selectedAccount = useMemo(() => {
    return accounts.find(a => a.id === selectedClientId);
  }, [accounts, selectedClientId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between border-slate-200 bg-white"
        >
          {isLoading ? (
            <span className="text-slate-500">Loading accounts...</span>
          ) : selectedAccount ? (
            <div className="flex items-center gap-2 truncate">
              {selectedAccount.isManager ? (
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              ) : (
                <User className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="truncate">{selectedAccount.descriptiveName}</span>
            </div>
          ) : (
            <span className="text-slate-500">Select account...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 border-slate-200 shadow-lg">
        <Command>
          <CommandInput placeholder="Search accounts..." />
          <CommandList>
            <CommandEmpty>No account found.</CommandEmpty>
            <CommandGroup heading="Manager Accounts">
              {accounts.filter(a => a.isManager).map((account) => (
                <CommandItem
                  key={account.id}
                  value={account.descriptiveName}
                  onSelect={() => {
                    onSelectClient(account.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{account.descriptiveName}</span>
                    <span className="text-xs text-slate-500">{account.id}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedClientId === account.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Client Accounts">
              {accounts.filter(a => !a.isManager).map((account) => (
                <CommandItem
                  key={account.id}
                  value={account.descriptiveName}
                  onSelect={() => {
                    onSelectClient(account.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4 text-slate-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{account.descriptiveName}</span>
                    <span className="text-xs text-slate-500">{account.id}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedClientId === account.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

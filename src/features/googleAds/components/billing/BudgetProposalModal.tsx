import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BudgetProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; limit: number }) => void;
  isSubmitting: boolean;
}

export function BudgetProposalModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}: BudgetProposalModalProps) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");

  const handleSubmit = () => {
    if (name.trim() && limit) {
      onSubmit({ name: name.trim(), limit: parseFloat(limit) * 1000000 });
      setName("");
      setLimit("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new account budget</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Budget name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Q4 Master Budget" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="limit">Spending limit ($)</Label>
            <Input 
              id="limit" 
              type="number"
              placeholder="10000" 
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !limit || isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting ? "Submitting..." : "Submit Proposal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

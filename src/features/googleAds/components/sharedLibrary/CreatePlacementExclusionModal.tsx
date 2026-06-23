import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePlacementExclusionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
  isSubmitting: boolean;
}

export function CreatePlacementExclusionModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}: CreatePlacementExclusionModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      setName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New placement exclusion list</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">List name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Bad Performing Placements" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting ? "Creating..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

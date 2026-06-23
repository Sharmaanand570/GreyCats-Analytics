import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { MutateConversionActionPayload } from "../../types/googleAds.types";

interface CreateConversionActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: MutateConversionActionPayload & { type: string }) => void;
  isSubmitting: boolean;
}

export function CreateConversionActionModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateConversionActionModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("PURCHASE");
  const [type, setType] = useState("WEBPAGE");
  const [primaryForGoal, setPrimaryForGoal] = useState(true);

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onSubmit({
      name,
      category: category as any,
      type,
      primaryForGoal,
      status: "ENABLED",
      includeInConversionsMetric: primaryForGoal,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New conversion action</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Conversion name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Website purchases" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Goal and action optimization</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PURCHASE">Purchase</SelectItem>
                <SelectItem value="ADD_TO_CART">Add to cart</SelectItem>
                <SelectItem value="BEGIN_CHECKOUT">Begin checkout</SelectItem>
                <SelectItem value="SUBSCRIBE_PAID">Subscribe</SelectItem>
                <SelectItem value="PAGE_VIEW">Page view</SelectItem>
                <SelectItem value="SIGNUP">Sign-up</SelectItem>
                <SelectItem value="LEAD">Lead</SelectItem>
                <SelectItem value="PHONE_CALL_LEAD">Phone call lead</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Conversion source</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEBPAGE">Website</SelectItem>
                <SelectItem value="WEBSITE_CALL">Phone calls from website</SelectItem>
                <SelectItem value="STORE_VISITS">Store visits</SelectItem>
                <SelectItem value="UPLOAD_CLICKS">Import from offline (clicks)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2 mt-2">
            <Checkbox 
              id="primary" 
              checked={primaryForGoal} 
              onCheckedChange={(c) => setPrimaryForGoal(!!c)} 
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="primary" className="font-medium text-slate-700">
                Primary action for goal
              </Label>
              <p className="text-xs text-slate-500">
                Primary actions are used for bidding optimization and reported in the "Conversions" column.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting ? "Creating..." : "Create and continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { LiaFilterSolid } from "react-icons/lia";

export interface FilterGroup {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface DropDownFilterProps {
  groups?: FilterGroup[];
}

function DropDownFilter({ groups }: DropDownFilterProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-[0.5rem] p-4 py-5 font-normal" variant="outline"> <LiaFilterSolid /> Filter</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-2 bg-background border" align="end">
        {groups && groups.length > 0 ? (
          groups.map((group, index) => (
            <div key={group.id}>
              {index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={group.value} onValueChange={group.onChange}>
                {group.options.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </div>
          ))
        ) : (
          /* Legacy Fallback */
          <>
            <DropdownMenuItem>Date</DropdownMenuItem>
            <DropdownMenuItem>Status</DropdownMenuItem>
            <DropdownMenuItem>Category</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DropDownFilter;

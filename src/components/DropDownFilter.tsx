import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
 
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import { LiaFilterSolid } from "react-icons/lia";

function DropDownFilter(): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-[0.5rem] p-4 py-5 font-normal" variant="outline"> <LiaFilterSolid /> Filter</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 bg-background border">
        <DropdownMenuItem>
          Date
        </DropdownMenuItem>
        <DropdownMenuItem>
          Status
        </DropdownMenuItem>
        <DropdownMenuItem>
          Category
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DropDownFilter;

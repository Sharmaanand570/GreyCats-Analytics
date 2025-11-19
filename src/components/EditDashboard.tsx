import { FiBell, FiSearch } from "react-icons/fi";
import { Button } from "./ui/button";

import { Input } from "./ui/input";
import { memo, useCallback, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const DataSourcesSidebar = memo(
  ({
    searchQuery,
    onSearchChange,
    filteredCategories,
    expandedCategories,
    onValueChange,
    isMobile = false,
  }: {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    filteredCategories: string[];
    expandedCategories: string[];
    onValueChange: (value: string[]) => void;
    isMobile?: boolean;
  }) => {
    const sidebarContent = (
      <>
        <div className="p-3 sm:p-4 border-b sticky top-0 bg-white z-10">
          <Input
            type="text"
            placeholder="Search data sources..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-[0.5rem] focus-visible:ring-2 focus-visible:ring-primary text-sm sm:text-base"
            aria-label="Search data sources"
          />
        </div>
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="text-xs uppercase tracking-wider text-gray-500 px-2 py-2 font-medium">
            DATA SOURCES
          </div>
          {filteredCategories.length === 0 ? (
            <div className="px-2 py-4 text-sm text-gray-500 text-center">
              No data sources found
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={expandedCategories}
              onValueChange={onValueChange}
              className="w-full"
            >
              <div className="space-y-0.5">
                {filteredCategories.map((category) => (
                  <AccordionItem
                    key={category}
                    value={category}
                    className="border-none"
                  >
                    <AccordionTrigger className="px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">
                      <span className="truncate">{category}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 py-1">
                      <div className="pl-4 py-1 text-xs text-gray-600">
                        <div className="py-1 text-gray-500">No items</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </div>
            </Accordion>
          )}
        </div>
      </>
    );

    if (isMobile) {
      return sidebarContent;
    }

    return (
      <div className="w-full sm:w-[14rem] md:w-[15.5rem] bg-white border-r flex flex-col sticky top-[calc(4.8em+3.5em)] h-[calc(100vh-8.3em)] overflow-y-auto z-30">
        {sidebarContent}
      </div>
    );
  }
);
DataSourcesSidebar.displayName = "DataSourcesSidebar";

const DATA_SOURCE_CATEGORIES = [
  "SEO",
  "Analytics",
  "Social",
  "Paid Ads",
  "Call Tracking",
  "Email",
  "Local",
  "Ecommerce",
] as const;

function EditDashboard() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return [...DATA_SOURCE_CATEGORIES];
    }
    return DATA_SOURCE_CATEGORIES.filter((category) =>
      category.toLowerCase().includes(normalizedQuery)
    );
  }, [searchQuery]);

  // Handle accordion value change
  const handleAccordionValueChange = useCallback((value: string[]) => {
    setExpandedCategories(value);
  }, []);

  return (
    <div className="w-full  h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        <div className="w-full h-full relative flex flex-col">
          <div className="w-full h-[4.8em] bg-white border-b flex justify-between items-center px-5 ">
            <span className="font-medium text-xl">Edit Dashboard</span>
            <div className="flex items-center">
              <span className="mx-2 text-lg text-gray-500">
                <FiSearch />
              </span>
              <span className="mx-2 text-lg text-gray-500 ">
                {" "}
                <FiBell />
              </span>
              <span className="ml-4">
                <Button className="rounded-[0.4rem]">Save Dashboard</Button>
              </span>
            </div>
          </div>

          <div>
            <DataSourcesSidebar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              filteredCategories={filteredCategories}
              expandedCategories={expandedCategories}
              onValueChange={handleAccordionValueChange}
              isMobile={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditDashboard;

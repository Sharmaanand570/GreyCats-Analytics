import React, { useState, useMemo, useCallback, useRef, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, Sparkles, ChevronRight, Menu } from 'lucide-react';
import { FaBuilding } from 'react-icons/fa6';
import { MdOutlineBusiness } from 'react-icons/md';
import PagesEmptyPlaceHolder from '@/components/PagesEmptyPlaceHolder';
import TableComponent from '@/components/TableComponent';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

type ClientDetailRow = {
  metric: string;
  client: string;
  currentValue: string | number;
  triggerValue: string | number;
  interval: string;
  lastTriggered: string;
};

// Extract constants
const DATA_SOURCE_CATEGORIES = [
  'SEO',
  'Analytics',
  'Social',
  'Paid Ads',
  'Call Tracking',
  'Email',
  'Local',
  'Ecommerce',
] as const;

const TAB_NAMES = [
  'Dashboards',
  'Reports',
  'Client Portal',
  'Tasks',
  'Goals',
  'Benchmarks',
  'Alerts',
  'Data Sources',
  'Users',
] as const;

// Static headers array - moved outside component to avoid recreation
const TABLE_HEADERS: string[] = ['Metric', 'Client', 'Current Value', 'Trigger Value', 'Interval', 'Last Triggered'];

// Static empty placeholders props - moved outside to avoid recreation
const EMPTY_PLACEHOLDER_PROPS = {
  Header: 'No Client Details Yet!',
  subHeader: 'View detailed metrics and insights for this client.',
  pointers: ['Track performance metrics', 'Monitor client progress', 'Get detailed insights'] as string[],
  smallIcon: FaBuilding,
  bigIcon: MdOutlineBusiness,
  buttonText: 'View Dashboard',
};

// Type-safe tab type
type TabName = (typeof TAB_NAMES)[number];

// Memoized Header Component
const ClientHeader = memo(
  ({
    clientName,
    onMenuClick,
    showMenuButton,
  }: {
    clientName: string;
    onMenuClick?: () => void;
    showMenuButton?: boolean;
  }) => (
    <div className="w-full h-auto min-h-[4.8em] sm:h-[4.8em]  border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 px-3 sm:px-4 md:px-5 py-3 sm:py-0 sticky top-0 z-50">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0 sm:hidden mr-1"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <Link
          to="/clients"
          className="font-medium text-base sm:text-lg md:text-xl text-gray-700 hover:text-gray-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded shrink-0"
        >
          Clients
        </Link>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" aria-hidden="true" />
        <span className="font-medium text-base sm:text-lg md:text-xl text-gray-900 truncate">{clientName}</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-9 sm:h-10"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-9 w-9 sm:h-10 sm:w-10"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  )
);
ClientHeader.displayName = 'ClientHeader';

// Memoized Tab Button Component
const TabButton = memo(
  ({
    tab,
    isActive,
    onClick,
    onKeyDown,
    tabRef,
  }: {
    tab: TabName;
    isActive: boolean;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
    tabRef: (el: HTMLButtonElement | null) => void;
  }) => (
    <button
      ref={tabRef}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="tab"
      aria-selected={isActive}
      aria-current={isActive ? 'page' : undefined}
      tabIndex={isActive ? 0 : -1}
      className={`px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium transition-all duration-200 relative rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0 ${
        isActive ? 'text-primary bg-gray-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <span className="truncate max-w-[80px] sm:max-w-[100px] md:max-w-[120px] block">{tab}</span>
      {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"></span>}
    </button>
  )
);
TabButton.displayName = 'TabButton';

// Memoized Tab Navigation Component
const TabNavigation = memo(
  ({
    activeTab,
    onTabClick,
    onTabKeyDown,
    tabRefs,
  }: {
    activeTab: TabName;
    onTabClick: (tab: TabName) => void;
    onTabKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, tab: TabName, index: number) => void;
    tabRefs: React.MutableRefObject<{ [key: string]: HTMLButtonElement | null }>;
  }) => (
    <div className="w-full h-auto min-h-[3.5em] sm:h-[3.5em]  border-b flex items-center px-2 sm:px-3 md:px-5 overflow-x-auto sticky top-[4.8em] z-40 scrollbar-hide">
      <div className="flex items-center gap-1 sm:gap-2 min-w-max" role="tablist" aria-label="Client navigation tabs">
        {TAB_NAMES.map((tab, index) => (
          <TabButton
            key={tab}
            tab={tab}
            isActive={activeTab === tab}
            onClick={() => onTabClick(tab)}
            onKeyDown={(e) => onTabKeyDown(e, tab, index)}
            tabRef={(el) => {
              tabRefs.current[tab] = el;
            }}
          />
        ))}
      </div>
    </div>
  )
);
TabNavigation.displayName = 'TabNavigation';

// Memoized Category Item Component
const CategoryItem = memo(
  ({
    category,
    isExpanded,
    onToggle,
  }: {
    category: string;
    isExpanded: boolean;
    onToggle: () => void;
  }) => (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category} category`}
      >
        <span className="truncate">{category}</span>
        <ChevronRight
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2 ${
            isExpanded ? 'rotate-90' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      {isExpanded && (
        <div className="pl-4 py-1 text-xs text-gray-600">
          <div className="py-1 text-gray-500">No items</div>
        </div>
      )}
    </div>
  )
);
CategoryItem.displayName = 'CategoryItem';

// Memoized Data Sources Sidebar Component
const DataSourcesSidebar = memo(
  ({
    searchQuery,
    onSearchChange,
    filteredCategories,
    expandedCategories,
    onToggleCategory,
    isMobile = false,
  }: {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    filteredCategories: string[];
    expandedCategories: Set<string>;
    onToggleCategory: (category: string) => void;
    isMobile?: boolean;
  }) => {
    const sidebarContent = (
      <>
        <div className="p-3 sm:p-4 border-b sticky top-0  z-10">
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
            <div className="px-2 py-4 text-sm text-gray-500 text-center">No data sources found</div>
          ) : (
            <div className="space-y-0.5">
              {filteredCategories.map((category) => (
                <CategoryItem
                  key={category}
                  category={category}
                  isExpanded={expandedCategories.has(category)}
                  onToggle={() => onToggleCategory(category)}
                />
              ))}
            </div>
          )}
        </div>
      </>
    );

    if (isMobile) {
      return sidebarContent;
    }

    return (
      <div className="w-full sm:w-[14rem] md:w-[15.5rem]  border-r flex flex-col sticky top-[calc(4.8em+3.5em)] h-[calc(100vh-8.3em)] overflow-y-auto z-30">
        {sidebarContent}
      </div>
    );
  }
);
DataSourcesSidebar.displayName = 'DataSourcesSidebar';

// Memoized Main Content Component
const MainContent = memo(
  ({
    clientData,
    headers,
  }: {
    clientData: ClientDetailRow[];
    headers: string[];
  }) => {
    if (clientData.length === 0) {
      return (
        <div className="flex flex-1 justify-center items-center min-h-[calc(100vh-8.3em)] px-3 sm:px-4 md:px-5">
          <PagesEmptyPlaceHolder {...EMPTY_PLACEHOLDER_PROPS} />
        </div>
      );
    }
    return (
      <div className="flex-1 p-3 sm:p-4 md:p-5 min-h-0 overflow-x-auto">
        <div className="min-w-full">
          <TableComponent header={headers} bodyData={clientData} />
        </div>
      </div>
    );
  }
);
MainContent.displayName = 'MainContent';

function ClientDetailComponenet(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabName>('Dashboards');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const isMobile = useIsMobile();

  // TODO: Replace with actual data from API/state
  const clientData: ClientDetailRow[] = [];

  // Memoize client name to avoid recalculation
  const clientName = useMemo(() => id || 'Demo client', [id]);

  // Memoize showSidebar calculation
  const showSidebar = useMemo(() => activeTab === 'Dashboards', [activeTab]);

  // Optimized filtered categories with normalized search query
  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return [...DATA_SOURCE_CATEGORIES];
    }
    return DATA_SOURCE_CATEGORIES.filter((category) => category.toLowerCase().includes(normalizedQuery));
  }, [searchQuery]);

  // Keyboard navigation for tabs - memoized with stable reference
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, tab: TabName, index: number) => {
      let targetIndex = index;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          targetIndex = (index + 1) % TAB_NAMES.length;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          targetIndex = (index - 1 + TAB_NAMES.length) % TAB_NAMES.length;
          break;
        case 'Home':
          e.preventDefault();
          targetIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          targetIndex = TAB_NAMES.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          setActiveTab(tab);
          return;
        default:
          return;
      }

      const targetTab = TAB_NAMES[targetIndex];
      setActiveTab(targetTab);
      // Use requestAnimationFrame for smoother focus transitions
      requestAnimationFrame(() => {
        tabRefs.current[targetTab]?.focus();
      });
    },
    []
  );

  // Memoized tab click handler
  const handleTabClick = useCallback((tab: TabName) => {
    setActiveTab(tab);
  }, []);

  // Optimized category toggle - uses functional update for better performance
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      // Only create new Set if state actually changes
      if (prev.has(category)) {
        const newSet = new Set(prev);
        newSet.delete(category);
        return newSet;
      } else {
        const newSet = new Set(prev);
        newSet.add(category);
        return newSet;
      }
    });
  }, []);

  // Memoized search change handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle sidebar toggle for mobile
  const handleMenuClick = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  // Close sidebar when tab changes on mobile
  React.useEffect(() => {
    if (isMobile && !showSidebar) {
      setSidebarOpen(false);
    }
  }, [isMobile, showSidebar]);

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-2 sm:my-3 md:my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          <ClientHeader
            clientName={clientName}
            onMenuClick={handleMenuClick}
            showMenuButton={showSidebar && isMobile}
          />
          <TabNavigation
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onTabKeyDown={handleTabKeyDown}
            tabRefs={tabRefs}
          />
          <div className={`flex flex-1 min-h-0 ${showSidebar && !isMobile ? 'flex-row' : ''}`}>
            {showSidebar && !isMobile && (
              <DataSourcesSidebar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                filteredCategories={filteredCategories}
                expandedCategories={expandedCategories}
                onToggleCategory={toggleCategory}
                isMobile={false}
              />
            )}
            {showSidebar && isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="w-[18rem] sm:w-[20rem] p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Data Sources</SheetTitle>
                  </SheetHeader>
                  <DataSourcesSidebar
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    filteredCategories={filteredCategories}
                    expandedCategories={expandedCategories}
                    onToggleCategory={toggleCategory}
                    isMobile={true}
                  />
                </SheetContent>
              </Sheet>
            )}
            <div className="flex-1 overflow-auto min-h-0">
              <MainContent clientData={clientData} headers={TABLE_HEADERS} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDetailComponenet;

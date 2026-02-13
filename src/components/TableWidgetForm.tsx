import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

import { TableGeneralTab, DEFAULT_RECENT_POSTS_COLUMNS, DEFAULT_INSTAGRAM_MEDIA_COLUMNS, DEFAULT_META_ADS_CAMPAIGN_COLUMNS } from "./WidgetEditor/TableGeneralTab";
export { TableGeneralTab, DEFAULT_RECENT_POSTS_COLUMNS, DEFAULT_INSTAGRAM_MEDIA_COLUMNS, DEFAULT_META_ADS_CAMPAIGN_COLUMNS };
import { TableDataTab } from "./WidgetEditor/TableDataTab";

import type { TableWidgetData } from "./widgetTypes";

interface TableWidgetFormProps {
  id: string;
  data?: TableWidgetData;
  onChange?: (data: TableWidgetData) => void;
  metricKey?: string;
}

function TableWidgetForm({
  id,
  data,
  onChange,
  metricKey,
}: TableWidgetFormProps): React.JSX.Element {
  const isRecentPosts = metricKey === 'meta.facebook.recent_posts';
  const isInstagramMedia = metricKey === 'meta.instagram.recent_media';
  const isMetaAdsCampaign = metricKey === 'meta.ads.campaign_performance';
  const isDynamicTable = isRecentPosts || isInstagramMedia || isMetaAdsCampaign;

  const [localData, setLocalData] = React.useState(data);
  const lastWidgetId = React.useRef(id);

  // Sync local data when the widget being edited changes
  React.useEffect(() => {
    if (id !== lastWidgetId.current) {
      setLocalData(data);
      lastWidgetId.current = id;
    }
  }, [data, id]);

  // Debounced update to parent
  React.useEffect(() => {
    if (JSON.stringify(localData) === JSON.stringify(data)) return;

    const timer = setTimeout(() => {
      if (onChange && localData) {
        onChange(localData);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localData, onChange, data]);

  const handleChange = (updates: Partial<TableWidgetData>) => {
    setLocalData((prev) => ({ ...prev, ...updates } as TableWidgetData));
  };

  const columns = data?.columns ?? [];

  // Check for generic defaults ("Name", "Value") which indicate uninitialized state
  const isGenericDefault = columns.length === 2 &&
    columns[0].name === "Name" &&
    columns[1].name === "Value";

  // Auto-populate defaults for dynamic tables
  React.useEffect(() => {
    if (onChange && data) {
      let newCols = null;
      if (isRecentPosts && (columns.length === 0 || isGenericDefault)) {
        newCols = DEFAULT_RECENT_POSTS_COLUMNS;
      } else if (isInstagramMedia && (columns.length === 0 || isGenericDefault)) {
        newCols = DEFAULT_INSTAGRAM_MEDIA_COLUMNS;
      } else if (isMetaAdsCampaign && (columns.length === 0 || isGenericDefault)) {
        newCols = DEFAULT_META_ADS_CAMPAIGN_COLUMNS;
      }

      if (newCols) {
        onChange({ ...data, columns: newCols });
      }
    }
  }, [metricKey, columns.length, isGenericDefault, isRecentPosts, isInstagramMedia, isMetaAdsCampaign]);

  // Note: useEffect might trigger an update.

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Table
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="general" className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="general">Settings</TabsTrigger>
              <TabsTrigger value="data" disabled={!!isDynamicTable}>Rows</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-4 pb-4">
            <TabsContent value="general" className="mt-0">
              <TableGeneralTab
                data={localData}
                onChange={handleChange}
                metricKey={metricKey}
              />
            </TabsContent>

            <TabsContent value="data" className="mt-0">
              <TableDataTab
                data={localData}
                onChange={handleChange}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default TableWidgetForm;

import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

import { MetricGeneralTab } from "./WidgetEditor/MetricGeneralTab";
import { MetricDataTab } from "./WidgetEditor/MetricDataTab";
import { MetricDisplayTab } from "./WidgetEditor/MetricDisplayTab";

import type { MetricWidgetData } from "./widgetTypes";
import type { ReportWidgetDefinition } from "../features/reports/api/types";
import type { ReportWidgetType } from "./reportTypes";

interface MetricWidgetFormProps {
  data?: MetricWidgetData;
  onChange?: (data: MetricWidgetData) => void;
  isIntegration?: boolean;
  metricConfig?: ReportWidgetDefinition;
  onTypeChange?: (type: ReportWidgetType) => void;
}

function MetricWidgetForm({
  data,
  onChange,
  isIntegration,
  metricConfig,
  onTypeChange,
}: MetricWidgetFormProps): React.JSX.Element {
  const [localData, setLocalData] = React.useState(data);
  const lastWidgetId = React.useRef(metricConfig?.id);

  // Sync local data when the widget being edited changes (e.g. user selects another widget)
  React.useEffect(() => {
    if (metricConfig?.id !== lastWidgetId.current) {
      setLocalData(data);
      lastWidgetId.current = metricConfig?.id;
    }
  }, [data, metricConfig?.id]);

  // Debounced update to parent
  React.useEffect(() => {
    // Only trigger if localData has actually changed from what parent currently has
    if (JSON.stringify(localData) === JSON.stringify(data)) return;

    const timer = setTimeout(() => {
      if (onChange && localData) {
        onChange(localData);
      }
    }, 500); // 500ms debounce is a good balance between responsiveness and protection

    return () => clearTimeout(timer);
  }, [localData, onChange, data]);

  const handleChange = (updates: Partial<MetricWidgetData>) => {
    setLocalData((prev) => ({ ...prev, ...updates } as MetricWidgetData));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Stat
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="general" className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-4 pb-4">
            <TabsContent value="general" className="mt-0">
              <MetricGeneralTab
                data={localData}
                onChange={handleChange}
                isIntegration={isIntegration}
                metricConfig={metricConfig}
                onTypeChange={onTypeChange}
              />
            </TabsContent>

            <TabsContent value="data" className="mt-0">
              <MetricDataTab
                data={localData}
                onChange={handleChange}
                isIntegration={isIntegration}
                metricConfig={metricConfig}
              />
            </TabsContent>

            <TabsContent value="display" className="mt-0">
              <MetricDisplayTab
                data={localData}
                onChange={handleChange}
                isIntegration={isIntegration}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default MetricWidgetForm;

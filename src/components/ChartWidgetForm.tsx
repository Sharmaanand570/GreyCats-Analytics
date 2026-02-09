import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

import { ChartGeneralTab } from "./WidgetEditor/ChartGeneralTab";
import { ChartDisplayTab } from "./WidgetEditor/ChartDisplayTab";

import type { ChartWidgetData } from "./widgetTypes";
import type { ReportWidgetDefinition } from "../features/reports/api/types";
import type { ReportWidgetType } from "./reportTypes";

interface ChartWidgetFormProps {
  data?: ChartWidgetData;
  onChange?: (data: ChartWidgetData) => void;
  isIntegration?: boolean;
  metricConfig?: ReportWidgetDefinition;
  onTypeChange?: (type: ReportWidgetType) => void;
}

function ChartWidgetForm({ data, onChange, isIntegration, metricConfig, onTypeChange }: ChartWidgetFormProps): React.JSX.Element {
  const [localData, setLocalData] = React.useState(data);
  const lastWidgetId = React.useRef(metricConfig?.id);

  // Sync local data when the widget being edited changes
  React.useEffect(() => {
    if (metricConfig?.id !== lastWidgetId.current) {
      setLocalData(data);
      lastWidgetId.current = metricConfig?.id;
    }
  }, [data, metricConfig?.id]);

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

  const handleChange = (updates: Partial<ChartWidgetData>) => {
    setLocalData((prev) => ({ ...prev, ...updates } as ChartWidgetData));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Widget
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="general" className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-4 pb-4">
            <TabsContent value="general" className="mt-0">
              <ChartGeneralTab
                data={localData}
                onChange={handleChange}
                isIntegration={isIntegration}
                metricConfig={metricConfig}
                onTypeChange={onTypeChange}
              />
            </TabsContent>

            <TabsContent value="display" className="mt-0">
              <ChartDisplayTab
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

export default ChartWidgetForm;



import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { TitleDisplayTab } from "./WidgetEditor/TitleDisplayTab";
import type { TitleWidgetData } from "./widgetTypes";

interface TitleWidgetFormProps {
  id: string;
  data?: TitleWidgetData;
  onChange?: (data: TitleWidgetData) => void;
}

function TitleWidgetForm({ id, data, onChange }: TitleWidgetFormProps): React.JSX.Element {
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

  const handleChange = (updates: Partial<TitleWidgetData>) => {
    setLocalData((prev) => ({ ...prev, ...updates } as TitleWidgetData));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Widget
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="display" className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-1">
              <TabsTrigger value="display">Display</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-4 pb-4">
            <TabsContent value="display" className="mt-0">
              <TitleDisplayTab
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

export default TitleWidgetForm;



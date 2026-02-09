import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { CustomGeneralTab } from "./WidgetEditor/CustomGeneralTab";
import { CustomDisplayTab } from "./WidgetEditor/CustomDisplayTab";
import type { CustomWidgetData } from "./widgetTypes";

interface CustomWidgetFormProps {
  id: string;
  data?: CustomWidgetData;
  onChange?: (data: CustomWidgetData) => void;
}

function CustomWidgetForm({
  id,
  data,
  onChange,
}: CustomWidgetFormProps): React.JSX.Element {
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

  const handleChange = (updates: Partial<CustomWidgetData>) => {
    setLocalData((prev) => ({ ...prev, ...updates } as CustomWidgetData));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Content
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="general" className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="general">Settings</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-4 pb-4">
            <TabsContent value="general" className="mt-0">
              <CustomGeneralTab
                data={localData}
                onChange={handleChange}
              />
            </TabsContent>

            <TabsContent value="display" className="mt-0">
              <CustomDisplayTab
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

export default CustomWidgetForm;



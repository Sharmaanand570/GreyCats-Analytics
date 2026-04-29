import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { ImageDisplayTab } from "./WidgetEditor/ImageDisplayTab";
import type { ImageWidgetData } from "./widgetTypes";

interface ImageWidgetFormProps {
  id: string;
  data?: ImageWidgetData;
  onChange?: (data: ImageWidgetData) => void;
}

function ImageWidgetForm({ id, data, onChange }: ImageWidgetFormProps): React.JSX.Element {
  const handleChange = (updates: Partial<ImageWidgetData>) => {
    if (!onChange) return;
    onChange({ ...(data || {}), ...updates } as ImageWidgetData);
  };
  void id;

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
              <ImageDisplayTab
                data={data}
                onChange={handleChange}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default ImageWidgetForm;


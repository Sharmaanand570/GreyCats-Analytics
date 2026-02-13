import { type ReportWidgetType } from "@/components/reportTypes";
import type { WidgetData } from "@/components/widgetTypes";

export interface WidgetFormState {
  slideId: number;
  widgetId: string;
  widgetType: ReportWidgetType | "";
  data?: WidgetData;
  i?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface ReportBuilderProps {
  readOnly?: boolean;
  providedReportId?: number;
  shareToken?: string;
  initialData?: any;
}

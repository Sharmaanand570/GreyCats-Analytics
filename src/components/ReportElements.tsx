import { SiBaremetrics } from "react-icons/si";
import {  LuGauge, LuPlug, LuTarget } from "react-icons/lu";
import { MdOutlineBrokenImage } from "react-icons/md";
import { ImEmbed2 } from "react-icons/im";

import { TbLetterCase } from "react-icons/tb";
import type { IconType } from "react-icons";

import { type ReportWidgetType } from "./reportTypes";
import type { WidgetFormState } from "./ReportBuilder";

type ReportElementDefinition = {
  id: string;
  label: string;
  icon: IconType;
  widgetType: ReportWidgetType;
};

const reportElements: ReportElementDefinition[] = [
  {
    id: "integrations",
    label: "Integrations",
    icon: LuPlug,
    widgetType: "custom",
  },

  {
    id: "content-blocks",
    label: "Content Blocks",
    icon: TbLetterCase,
    widgetType: "custom",
  },

  {
    id: "images",
    label: "Images",
    icon: MdOutlineBrokenImage,
    widgetType: "image",
  },

  { id: "embeds", label: "Embeds", icon: ImEmbed2, widgetType: "embed" },

  {
    id: "custom-metrics",
    label: "Custom Metrics",
    icon: SiBaremetrics,
    widgetType: "metric",
  },
  {
    id: "benchmarks",
    label: "Benchmarks",
    icon: LuGauge,
    widgetType: "custom",
  },
  { id: "goals", label: "Goals", icon: LuTarget, widgetType: "custom" },
];

type ReportElementsType = {
  setRightPanelTitle: React.Dispatch<React.SetStateAction<string>>;
  setWidgetFormState: React.Dispatch<React.SetStateAction<WidgetFormState>>;
};

function ReportElements({ setRightPanelTitle, setWidgetFormState }: ReportElementsType) {


  return (
    <div className="w-16 md:w-20 lg:w-24 h-full border-l">
      {reportElements.map(({ id, label, icon: Icon, widgetType }) => (
        <div
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();

              setWidgetFormState({
                slideId: 0,
                widgetId: "",
                widgetType: "",
              });
              setRightPanelTitle((prev) => (prev === label ? "" : label));
              
            }
          }}
          onClick={() => {
            setWidgetFormState({
              slideId: 0,
              widgetId: "",
              widgetType: "",
            });
            setRightPanelTitle((prev) => {
              if (prev === label) return "";
              return label;
            });
          }}
          key={id}
          role="button"
          tabIndex={0}
          aria-label={`Drag ${label} widget to dashboard`}
          className="flex flex-col text-xs items-center justify-center text-center p-1.5 md:p-2 my-2 md:my-4 text-wrap gap-0.5 md:gap-1 cursor-pointer active:cursor-grabbing text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Icon className="text-lg md:text-xl" aria-hidden="true" />
          <span className="text-[10px] md:text-xs text-gray-500 leading-tight">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default ReportElements;
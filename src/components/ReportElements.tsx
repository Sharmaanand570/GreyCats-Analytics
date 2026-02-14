import { SiBaremetrics } from "react-icons/si";
import { LuPlug } from "react-icons/lu";
import { MdOutlineBrokenImage } from "react-icons/md";
import { ImEmbed2 } from "react-icons/im";

import { TbLetterCase } from "react-icons/tb";
import type { IconType } from "react-icons";

import { type ReportWidgetType } from "./reportTypes";
import type { WidgetFormState } from "../pages/ReportBuilder";

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
];

type ReportElementsType = {
  setRightPanelTitle: React.Dispatch<React.SetStateAction<string>>;
  setWidgetFormState: React.Dispatch<React.SetStateAction<WidgetFormState>>;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
};

function ReportElements({ setRightPanelTitle, setWidgetFormState, orientation = "vertical", disabled = false }: ReportElementsType) {


  return (
    <div className={orientation === "vertical"
      ? "w-16 md:w-20 lg:w-24 h-full border-l"
      : "w-full h-auto flex flex-row justify-around items-center border-t py-2"
    }>
      {reportElements.map(({ id, label, icon: Icon }) => (
        <div
          onKeyDown={(e) => {
            if (disabled) return;
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
            if (disabled) return;
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

          className={`flex flex-col text-xs items-center justify-center text-center p-1.5 md:p-2 gap-0.5 md:gap-1 transition-colors ${disabled
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "cursor-pointer active:cursor-grabbing text-gray-600 hover:bg-gray-50"
            } ${orientation === "vertical"
            ? "my-2 md:my-4 text-wrap"
            : "mx-1"
            }`}
        >
          <Icon className="text-lg md:text-xl" aria-hidden="true" />
          <span className="text-[10px] md:text-xs text-gray-500 leading-tight">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default ReportElements;
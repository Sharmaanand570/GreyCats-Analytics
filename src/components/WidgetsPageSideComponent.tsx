import { IoIosMenu } from "react-icons/io";
import React from "react";

const pages = [
  {
    label: "google Analytics",
    pages: [
      {
        innerlabel: "google Analytics clicks",
        sublabel: "total clicks",
      },
      {
        innerlabel: "Google spends",
        sublabel: "total ads spends",
      },
    ],
  },
  {
    label: "Facebook Ads",
    pages: [
      {
        innerlabel: "facebook post",
        sublabel: "Empaded spacif post",
      },
    ],
  },
];

type WidgetsPageSideComponentType = {
  reftype: React.RefObject<(HTMLDivElement | null)[]>;
};

function WidgetsPageSideComponent({ reftype }: WidgetsPageSideComponentType) {
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  React.useEffect(() => {
    const slideEls = reftype.current?.filter(Boolean) as HTMLDivElement[] | undefined;
    if (!slideEls || slideEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry with greatest intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (visible?.target) {
          const idx = slideEls.indexOf(visible.target as HTMLDivElement);
          if (idx !== -1) setActiveIndex(idx);
        }
      },
      {
        root: null, // viewport
        threshold: [0.25, 0.5, 0.75, 1],
      }
    );

    slideEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reftype]);

  const scrollToSlide = (index: number) => {
    const slide = reftype.current[index];
    if (slide) {
      slide.scrollIntoView({
        behavior: "smooth",
        block: "center", // aligns the top of the slide with the top of the container
        inline: "nearest", // optional, for horizontal layout
      });
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full px-3 md:px-4 py-2 md:py-3 font-medium text-sm md:text-base">Pages</div>

      <div className="w-full p-2 md:p-3 lg:p-4">
        {pages.map((p, i) => (
          <div
            key={i}
            className={`flex flex-col gap-1.5 md:gap-2 ${i === 0 ? "" : "my-3 md:my-4"}`}
          >
            <div>
              <span className="text-[10px] md:text-xs text-gray-500 font-medium w-full">
                {p.label}
              </span>
            </div>
            {p.pages.map((ps, i) => (
              <div
                onClick={() => scrollToSlide(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    scrollToSlide(i);
                  }
                }}
                key={i}
                className={`w-full gap-1.5 md:gap-2 border rounded-lg md:rounded-[0.6rem] p-2.5 md:p-3 lg:p-4 flex items-center cursor-pointer transition-colors ${
                  activeIndex === i ? "bg-gray-100 border-gray-400" : "hover:bg-gray-50"
                }`}
                role="button"
                tabIndex={0}
              >
                <div>
                  <IoIosMenu className="text-xl md:text-2xl text-gray-500" />
                </div>
                <div className="flex flex-col gap-[0.1rem] md:gap-[0.2rem] min-w-0 flex-1">
                  <span className={`font-medium text-xs md:text-sm truncate ${activeIndex === i ? "text-gray-900" : ""}`}>
                    {ps.innerlabel}
                  </span>
                  <span className="font-normal text-[10px] md:text-xs text-gray-600 line-clamp-1">
                    {ps.sublabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WidgetsPageSideComponent;

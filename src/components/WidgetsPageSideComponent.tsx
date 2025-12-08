import { IoIosMenu } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import React from "react";
import { useIntegrations } from "@/features/DataSources/hooks/useIntegrations";
import { getPlatformConfig } from "@/utils/platformMapping";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type WidgetsPageSideComponentType = {
  reftype: React.RefObject<(HTMLDivElement | null)[]>;
  customPages?: Array<{ id: number; name: string; subtitle?: string }>;
  pageOrder?: number[];
  /**
   * Optional slide metadata (titles/subtitles/source) for each logical page,
   * coming from the report template. When provided, this is the primary source
   * of truth for page labels in the sidebar.
   */
  slidesMeta?: Array<{
    id: number;
    title: string;
    subtitle?: string;
    source?: "integration" | "custom";
  }>;
  onAddPage?: (name: string, subtitle?: string) => void;
  onReorderPages?: (fromIndex: number, toIndex: number) => void;
  onDeletePage?: (slideId: number) => void;
  onRenamePage?: (slideId: number, newName: string) => void;
};

function WidgetsPageSideComponent({
  reftype,
  customPages = [],
  pageOrder,
  slidesMeta,
  onAddPage,
  onReorderPages,
  onDeletePage,
  onRenamePage,
}: WidgetsPageSideComponentType) {
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const [isAddPageOpen, setIsAddPageOpen] = React.useState(false);
  const [pageName, setPageName] = React.useState("");
  const [pageSubtitle, setPageSubtitle] = React.useState("");
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const { data: integrationsData, isLoading } = useIntegrations();
  const [editingSlideId, setEditingSlideId] = React.useState<number | null>(
    null
  );
  const [editingName, setEditingName] = React.useState<string>("");

  React.useEffect(() => {
    const slideEls = reftype.current?.filter(Boolean) as
      | HTMLDivElement[]
      | undefined;
    if (!slideEls || slideEls.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry with greatest intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          )[0];
        if (visible?.target) {
          const element = visible.target as HTMLDivElement;
          // Extract slide ID from the element's id attribute (e.g., "slide-0" -> 0)
          const slideId = element.id?.match(/slide-(\d+)/)?.[1];
          if (slideId !== undefined) {
            const parsedId = parseInt(slideId, 10);
            setActiveIndex(parsedId);
          }
        }
      },
      {
        root: null, // viewport
        threshold: [0.25, 0.5, 0.75, 1],
      }
    );

    slideEls.forEach((el) => {
      if (el) {
        observer.observe(el);
      }
    });
    return () => {
      observer.disconnect();
    };
  }, [reftype, customPages, integrationsData]);

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

  const handleAddPage = () => {
    if (!pageName.trim()) return;

    if (onAddPage) {
      onAddPage(pageName.trim(), pageSubtitle.trim() || undefined);
    }

    // Reset form
    setPageName("");
    setPageSubtitle("");
    setIsAddPageOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (onReorderPages) {
      onReorderPages(draggedIndex, dropIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Transform integrations data into pages format
  const pages = React.useMemo(() => {
    const integrations = integrationsData?.integrations || [];

    // If we have slide metadata from the template, use that as the primary source
    // of truth for page labels. This keeps integration pages from being treated
    // as "Untitled" or "Custom" just because their slide IDs don't match indices.
    if (slidesMeta && slidesMeta.length > 0) {
      const combined: {
        label: string;
        integrationId: string | number;
        slideIndex: number;
        isCustom: boolean;
        pages: { innerlabel: string; sublabel: string }[];
      }[] = [];

      // Map integration slides (source === "integration") to actual integrations
      const integrationSlides = slidesMeta.filter(
        (s) => s.source === "integration"
      );
      integrationSlides.forEach((slide, idx) => {
        const integration = integrations[idx];
        const platformConfig = integration
          ? getPlatformConfig(integration.platform)
          : undefined;

        combined.push({
          label: platformConfig?.name || integration?.platform || "Integration",
          integrationId: integration
            ? integration.id
            : `integration-${slide.id}`,
          slideIndex: slide.id,
          isCustom: false,
          pages: [
            {
              innerlabel: slide.title,
              sublabel:
                slide.subtitle ||
                integration?.accountName ||
                "Integration page",
            },
          ],
        });
      });

      // Map custom slides (source === "custom") to "Custom" group
      const customSlides = slidesMeta.filter(
        (s) => s.source === "custom" || !s.source
      );
      customSlides.forEach((slide) => {
        combined.push({
          label: "Custom",
          integrationId: `custom-${slide.id}`,
          slideIndex: slide.id,
          isCustom: true,
          pages: [
            {
              innerlabel: slide.title,
              sublabel: slide.subtitle || "Custom page",
            },
          ],
        });
      });

      const pageMap = new Map<number, (typeof combined)[number]>();
      combined.forEach((entry) => {
        pageMap.set(entry.slideIndex, entry);
      });

      const orderSource =
        pageOrder && pageOrder.length > 0
          ? pageOrder
          : combined.map((entry) => entry.slideIndex);

      // Always produce a page entry for every slide id in orderSource, even if
      // we don't yet have complete metadata. This prevents the Pages list from
      // going empty right after a save while data is re-syncing.
      const orderedPages = orderSource.map((id) => {
        const existing = pageMap.get(id);
        if (existing) return existing;

        return {
          label: "Page",
          integrationId: `page-${id}`,
          slideIndex: id,
          isCustom: true,
          pages: [
            {
              innerlabel: "Untitled page",
              sublabel: "Custom layout",
            },
          ],
        };
      });

      return orderedPages;
    }

    // Legacy behaviour: fall back to integration + custom pages only when we
    // don't have slide metadata from the template.
    const integrationPages = integrations.map((integration, idx) => {
      const platformConfig = getPlatformConfig(integration.platform);
      const baseName = platformConfig?.name || integration.platform;
      const fullTitle = integration.accountName
        ? `${baseName} - ${integration.accountName}`
        : baseName;

      return {
        label: baseName,
        integrationId: integration.id,
        slideIndex: idx,
        isCustom: false,
        pages: [
          {
            // Make the Pages sidebar label match the slide header title
            innerlabel: fullTitle,
            sublabel: integration.accountName || "",
          },
        ],
      };
    });

    // Add custom pages defined in ReportBuilder - these are *only* user-added
    // pages and should be the ones that display the "Custom" badge.
    const customPagesFormatted = customPages.map((customPage) => ({
      label: "Custom",
      integrationId: `custom-${customPage.id}`,
      slideIndex: customPage.id,
      isCustom: true,
      pages: [
        {
          innerlabel: customPage.name,
          sublabel: customPage.subtitle || "Custom page",
        },
      ],
    }));

    const combined = [...integrationPages, ...customPagesFormatted];

    // Derive all known slide IDs: either from pageOrder (dashboards) or from combined pages
    const allSlideIds =
      pageOrder && pageOrder.length > 0
        ? pageOrder
        : combined.map((entry) => entry.slideIndex);

    // Ensure we have a page entry for every slideId coming from dashboards/template
    const knownIds = new Set(combined.map((entry) => entry.slideIndex));
    allSlideIds.forEach((id, index) => {
      if (!knownIds.has(id)) {
        combined.push({
          label: "Page",
          integrationId: `slide-${id}`,
          slideIndex: id,
          isCustom: true,
          pages: [
            {
              innerlabel: `Untitled page`,
              sublabel: "Custom layout",
            },
          ],
        });
      }
    });

    if (combined.length === 0) return combined;

    const pageMap = new Map<number, (typeof combined)[number]>();
    combined.forEach((entry) => {
      pageMap.set(entry.slideIndex, entry);
    });

    const orderSource =
      pageOrder && pageOrder.length > 0
        ? pageOrder
        : combined.map((entry) => entry.slideIndex);

    const orderedPages = orderSource
      .map((id) => pageMap.get(id))
      .filter((entry): entry is (typeof combined)[number] => Boolean(entry));

    return orderedPages;
  }, [integrationsData, customPages, pageOrder, slidesMeta]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full px-3 md:px-4 py-2 md:py-3 font-medium text-sm md:text-base flex items-center justify-between">
        <span>Pages</span>
        <Dialog open={isAddPageOpen} onOpenChange={setIsAddPageOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Add Page"
            >
              <FiPlus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Page</DialogTitle>
              <DialogDescription>
                Create a custom page for your report. You can add widgets to it
                later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="page-name">Page Name *</Label>
                <Input
                  id="page-name"
                  placeholder="e.g., Executive Summary"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && pageName.trim()) {
                      handleAddPage();
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="page-subtitle">Subtitle (Optional)</Label>
                <Input
                  id="page-subtitle"
                  placeholder="e.g., Monthly Overview"
                  value={pageSubtitle}
                  onChange={(e) => setPageSubtitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && pageName.trim()) {
                      handleAddPage();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddPageOpen(false);
                  setPageName("");
                  setPageSubtitle("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPage} disabled={!pageName.trim()}>
                Add Page
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto w-full p-2 md:p-3 lg:p-4">
        {isLoading ? (
          <div className="text-center text-xs md:text-sm text-gray-500 py-4">
            Loading pages...
          </div>
        ) : pages.length > 0 || (pageOrder && pageOrder.length > 0) ? (
          pages.map((p, groupIndex) => (
            <div
              key={p.integrationId}
              className={`flex flex-col gap-1.5 md:gap-2 ${
                groupIndex === 0 ? "" : "my-3 md:my-4"
              }`}
            >
              <div>
                <span className="text-[10px] md:text-xs text-gray-500 font-medium w-full">
                  {p.label}
                </span>
              </div>
              {p.pages.map((ps, pageIndex) => {
                const slideIdx = p.slideIndex;
                const isDragging = draggedIndex === groupIndex;
                const isDragOver = dragOverIndex === groupIndex;

                return (
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, groupIndex)}
                    onDragOver={(e) => handleDragOver(e, groupIndex)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, groupIndex)}
                    onDragEnd={handleDragEnd}
                    onClick={() => scrollToSlide(slideIdx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        scrollToSlide(slideIdx);
                      }
                    }}
                    key={pageIndex}
                    className={`w-full gap-1.5 md:gap-2 border rounded-lg md:rounded-[0.6rem] p-2.5 md:p-3 lg:p-4 flex items-center cursor-move transition-all ${
                      isDragging ? "opacity-50 scale-95" : ""
                    } ${
                      isDragOver ? "border-blue-500 border-2 bg-blue-50" : ""
                    } ${
                      activeIndex === slideIdx
                        ? "bg-gray-100 border-gray-400"
                        : "hover:bg-gray-50"
                    }`}
                    role="button"
                    tabIndex={0}
                  >
                    <div>
                      <IoIosMenu className="text-xl md:text-2xl text-gray-500" />
                    </div>
                    <div className="flex flex-col gap-[0.1rem] md:gap-[0.2rem] min-w-0 flex-1">
                      {editingSlideId === slideIdx ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-7 px-2 text-xs"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (onRenamePage && editingName.trim()) {
                                  onRenamePage(slideIdx, editingName.trim());
                                }
                                setEditingSlideId(null);
                              } else if (e.key === "Escape") {
                                e.preventDefault();
                                setEditingSlideId(null);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="text-[10px] text-gray-500 hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSlideId(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`font-medium text-xs md:text-sm truncate ${
                              activeIndex === slideIdx ? "text-gray-900" : ""
                            }`}
                          >
                            {ps.innerlabel}
                          </span>
                          <span className="font-normal text-[10px] md:text-xs text-gray-600 line-clamp-1">
                            {ps.sublabel}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="flex items-center gap-1">
                      {p.isCustom && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                          Custom
                        </span>
                      )}
                      {onRenamePage && editingSlideId !== slideIdx && (
                        <button
                          type="button"
                          className="ml-1 text-[10px] text-gray-500 hover:text-gray-700"
                          aria-label="Rename page"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSlideId(slideIdx);
                            setEditingName(ps.innerlabel);
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {p.isCustom && onDeletePage && (
                        <button
                          type="button"
                          className="ml-1 text-[10px] text-red-500 hover:text-red-700"
                          aria-label="Remove page"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePage(slideIdx);
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8 px-4">
            <p className="text-xs md:text-sm font-medium mb-2">No pages yet</p>
            <p className="text-[10px] md:text-xs mb-4">
              Connect an integration to create report pages
            </p>
            <Link to="/data-sources">
              <Button variant="outline" size="sm" className="text-xs">
                Connect Integration
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default WidgetsPageSideComponent;

import { IoIosMenu } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import React from "react";
import { useIntegrations } from "@/features/DataSources/hooks/useIntegrations";
import { getPlatformConfig } from "@/utils/platformMapping";
import { Link, useParams } from "react-router-dom";
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
import type { ReportSlideMeta } from "@/features/reports/api/types";

type WidgetsPageSideComponentType = {
  activeSlideId?: number | null;
  onSlideClick?: (slideId: number) => void;
  customPages?: Array<{ id: number; name: string; subtitle?: string }>;
  pageOrder?: number[];
  /**
   * Optional slide metadata (titles/subtitles/source) for each logical page,
   * coming from the report template. When provided, this is the primary source
   * of truth for page labels in the sidebar.
   */
  slidesMeta?: ReportSlideMeta[];
  onAddPage?: (name: string, subtitle?: string) => void;
  onReorderPages?: (fromIndex: number, toIndex: number) => void;
  onDeletePage?: (slideId: number) => void;
  onRenamePage?: (slideId: number, newName: string) => void;
  onAddIntegrationPage?: (integrationIndex: number) => void;
  availableIntegrations?: { index: number; platform: string; accountName?: string }[];
};

function WidgetsPageSideComponent({
  activeSlideId,
  onSlideClick,
  customPages = [],
  pageOrder,
  slidesMeta,
  onAddPage,
  onReorderPages,
  onDeletePage,
  onRenamePage,
  onAddIntegrationPage,
  availableIntegrations = [],
}: WidgetsPageSideComponentType) {
  const [isAddPageOpen, setIsAddPageOpen] = React.useState(false);
  const [addPageType, setAddPageType] = React.useState<"custom" | "integration">("custom");
  const [selectedIntegrationIndex, setSelectedIntegrationIndex] = React.useState<string>("");
  const [pageName, setPageName] = React.useState("");
  const [pageSubtitle, setPageSubtitle] = React.useState("");
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  // Extract clientId from URL params
  const params = useParams<{ clientId: string }>();
  const parsedClientId = params.clientId ? parseInt(params.clientId) : null;

  const { data: integrationsData, isLoading } = useIntegrations(parsedClientId);


  const [editingSlideId, setEditingSlideId] = React.useState<number | null>(
    null
  );
  const [editingName, setEditingName] = React.useState<string>("");

  const scrollToSlide = (index: number) => {
    if (onSlideClick) {
      onSlideClick(index);
    }
  };

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dropPosition, setDropPosition] = React.useState<"top" | "bottom" | null>(null);

  const handleAddPage = () => {
    if (addPageType === "custom") {
      if (!pageName.trim()) return;

      if (onAddPage) {
        onAddPage(pageName.trim(), pageSubtitle.trim() || undefined);
      }
    } else {
      if (!selectedIntegrationIndex) return;
      if (onAddIntegrationPage) {
        onAddIntegrationPage(parseInt(selectedIntegrationIndex, 10));
      }
    }

    // Reset form
    setPageName("");
    setPageSubtitle("");
    setAddPageType("custom");
    setSelectedIntegrationIndex("");
    setIsAddPageOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    // Transparent drag image or default
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedIndex === null || draggedIndex === index) {
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }

    setDragOverIndex(index);

    // Calculate drop position (top or bottom half of the target)
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (e.clientY < midpoint) {
      setDropPosition("top");
    } else {
      setDropPosition("bottom");
    }

    // Auto-scroll logic
    if (containerRef.current) {
      const container = containerRef.current;
      const { top, bottom } = container.getBoundingClientRect();
      const scrollZoneHeight = 50; // px
      const mouseY = e.clientY;

      if (mouseY < top + scrollZoneHeight) {
        // Scroll up
        container.scrollTop -= 5;
      } else if (mouseY > bottom - scrollZoneHeight) {
        // Scroll down
        container.scrollTop += 5;
      }
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }

    // Index-based logic as requested
    let targetIndex = dropIndex;

    // Adjust target based on drop position relative to the item
    if (dropPosition === "bottom") {
      targetIndex = dropIndex + 1;
    }

    // Adjust for the shift that occurs when the dragged item is removed
    // If we drag an item from above the target, removing it shifts the target index down by 1.
    if (draggedIndex < targetIndex) {
      targetIndex = targetIndex - 1;
    }

    if (onReorderPages) {
      onReorderPages(draggedIndex, targetIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  // Transform integrations data into pages format
  const pages = React.useMemo(() => {
    const integrations = integrationsData?.integrations || [];

    // If we have slide metadata from the template, use that as the primary source
    // of truth for page labels. This keeps integration pages from being treated
    // as "Untitled" or "Custom" just because their slide IDs don't match indices.
    if (slidesMeta) {
      const combined: {
        label: string;
        integrationId: string | number;
        slideIndex: number;
        isCustom: boolean;
        pages: { innerlabel: string; sublabel: string }[];
      }[] = [];

      // 1. Process explicit integration slides (source === "integration")
      // OR any slide that has ID < 1000 (Self-Healing for corrupted "custom" slides)
      const integrationSlides = slidesMeta.filter(
        (s) => s.source === "integration" || Number(s.id) < 1000
      );

      // Track processed IDs so we don't duplicate them in the Custom pass
      const processedIds = new Set(integrationSlides.map(s => Number(s.id)));

      integrationSlides.forEach((slide) => {
        // Use integrationIndex if available, otherwise fallback to slide id
        // Ensure index is valid for lookups
        const numId = Number(slide.id);
        const idxToUse = slide.integrationIndex !== undefined ? slide.integrationIndex : numId;

        const integration = integrations[idxToUse];
        const platformConfig = integration
          ? getPlatformConfig(integration.platform)
          : undefined;

        // Determine effective title
        const effectiveTitle = (slide.title && !slide.title.startsWith("Untitled"))
          ? slide.title
          : (platformConfig?.name || integration?.platform || "Integration");

        combined.push({
          label: platformConfig?.name || integration?.platform || (slide.title && !slide.title.startsWith("Untitled") ? slide.title : "Integration"),
          integrationId: integration
            ? integration.id
            : `integration-${slide.id}`,
          slideIndex: numId,
          isCustom: false, // FORCE FALSE for integration-like slides
          pages: [
            {
              innerlabel: effectiveTitle,
              sublabel:
                slide.subtitle ||
                integration?.accountName ||
                "Integration page",
            },
          ],
        });
      });

      // 2. Map custom slides (source === "custom") 
      // EXCLUDING any that we already treated as integration slides (IDs < 1000)
      const customSlides = slidesMeta.filter(
        (s) => (s.source === "custom" || !s.source) && !processedIds.has(Number(s.id))
      );
      customSlides.forEach((slide) => {
        combined.push({
          label: "Custom",
          integrationId: `custom-${slide.id}`,
          slideIndex: Number(slide.id),
          isCustom: true,
          pages: [
            {
              innerlabel: slide.title || "Untitled page",
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
          ? pageOrder.map(Number)
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

    console.log('[Sidebar] IntegrationPages len:', integrationPages.length);
    console.log('[Sidebar] Combined len:', combined.length);

    // Derive all known slide IDs: either from pageOrder (dashboards) or from combined pages
    const allSlideIds =
      pageOrder && pageOrder.length > 0
        ? pageOrder
        : combined.map((entry) => entry.slideIndex);

    // Ensure we have a page entry for every slideId coming from dashboards/template
    const knownIds = new Set(combined.map((entry) => entry.slideIndex));
    allSlideIds.forEach((id) => {
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

  console.log('[Sidebar] Rendering pages count:', pages.length);

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
                Add a new page to your report. You can create a blank custom page or restore a missing integration page.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-2 mb-4 border-b pb-2">
              <button
                className={`text-sm pb-1 px-2 ${addPageType === "custom"
                  ? "font-medium border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setAddPageType("custom")}
              >
                Custom Page
              </button>
              <button
                className={`text-sm pb-1 px-2 ${addPageType === "integration"
                  ? "font-medium border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setAddPageType("integration")}
              >
                Integration Page
              </button>
            </div>

            {addPageType === "custom" ? (
              <div className="grid gap-4 py-2">
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
            ) : (
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Select Integration</Label>
                  {availableIntegrations.length === 0 ? (
                    <div className="text-sm text-gray-500 italic p-2 border rounded bg-gray-50">
                      All connected integrations are already in the report.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto border rounded p-2">
                      {availableIntegrations.map((integ) => (
                        <label
                          key={integ.index}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
                        >
                          <input
                            type="radio"
                            name="integration-select"
                            value={integ.index}
                            checked={selectedIntegrationIndex === String(integ.index)}
                            onChange={(e) => setSelectedIntegrationIndex(e.target.value)}
                            className="text-blue-600"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {getPlatformConfig(integ.platform)?.name || integ.platform}
                            </div>
                            {integ.accountName && (
                              <div className="text-xs text-gray-500">
                                {integ.accountName}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddPageOpen(false);
                  setPageName("");
                  setPageSubtitle("");
                  setAddPageType("custom");
                  setSelectedIntegrationIndex("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPage}
                disabled={
                  addPageType === "custom"
                    ? !pageName.trim()
                    : !selectedIntegrationIndex
                }
              >
                {addPageType === "custom" ? "Add Page" : "Add Integration"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto w-full p-2 md:p-3 lg:p-4"
      >
        {isLoading ? (
          <div className="text-center text-xs md:text-sm text-gray-500 py-4">
            Loading pages...
          </div>
        ) : pages.length > 0 || (pageOrder && pageOrder.length > 0) ? (
          pages.map((p, groupIndex) => (
            <div
              key={groupIndex}
              className={`flex flex-col gap-1.5 md:gap-2 ${groupIndex === 0 ? "" : "my-3 md:my-4"
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

                // Visual drop indicator classes
                const dropIndicatorClass = isDragOver
                  ? dropPosition === "top"
                    ? "border-t-4 border-t-blue-500"
                    : "border-b-4 border-b-blue-500"
                  : "";

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
                    className={`w-full gap-1.5 md:gap-2 border rounded-lg md:rounded-[0.6rem] p-2.5 md:p-3 lg:p-4 flex items-center cursor-move transition-all ${isDragging ? "opacity-50 scale-95" : ""
                      } ${activeSlideId === slideIdx
                        ? "bg-gray-100 border-gray-400"
                        : "hover:bg-gray-50"
                      } ${dropIndicatorClass}`}
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
                                // ... existing ...
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
                            className={`font-medium text-xs md:text-sm truncate ${activeSlideId === slideIdx ? "text-gray-900" : ""
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
                      {onDeletePage && pages.length > 1 && (
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

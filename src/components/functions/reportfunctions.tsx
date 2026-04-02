import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Convert all oklch() and oklab() colors in cloned DOM to RGB
function convertModernColorsInClonedDom(clonedDoc: Document) {
  // Add pdf-safe class to cloned document root
  if (clonedDoc.documentElement) {
    clonedDoc.documentElement.classList.add("pdf-safe");
  }

  // Also inject CSS that overrides all known modern colors with RGB
  const style = clonedDoc.createElement("style");
  style.textContent = `
    .pdf-safe, .pdf-safe * {
      color: rgb(36, 36, 36) !important;
      background-color: rgb(255, 255, 255) !important;
      border-color: rgb(235, 235, 235) !important;
    }
  `;
  clonedDoc.head.appendChild(style);

  // Walk through all elements and convert computed oklch()/oklab() to RGB
  const allElements = clonedDoc.querySelectorAll("*");

  allElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const computedStyle = clonedDoc.defaultView?.getComputedStyle(htmlElement);

    if (!computedStyle) return;

    const colorProps = [
      "color",
      "backgroundColor",
      "borderColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "outlineColor",
      "textDecorationColor",
      "columnRuleColor",
    ];

    colorProps.forEach((prop) => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && (value.includes("oklch") || value.includes("oklab"))) {
        // Simple fallback mechanism:
        // If we detect these modern color spaces, we force a safe RGB value.
        // We do simplistic parsing to try and preserve lightness if possible,
        // but robust conversion is complex. 
        // Focus is on PREVENTING CRASH primarily.

        let gray = 200; // Default fallback

        // Try to extract lightness L value (first number) from oklch(L C H) or oklab(L a b)
        const match = value.match(/okl(ch|ab)\(([^)]+)\)/);
        if (match && match[2]) {
          const parts = match[2].trim().split(/\s+/);
          const lStr = parts[0];
          let l = parseFloat(lStr);

          if (!isNaN(l)) {
            // L is usually 0..1 or 0%..100%
            if (lStr.includes('%')) l = l / 100;
            // Clamp to 0..1
            l = Math.max(0, Math.min(1, l));
            gray = Math.round(l * 255);
          }
        }

        htmlElement.style.setProperty(
          prop,
          `rgb(${gray}, ${gray}, ${gray})`,
          "important"
        );
      }
    });
  });
}

// Apply inline RGB overrides to live DOM elements to prevent html2canvas from encountering modern colors
function applyInlineRGBOverrides(element: HTMLElement): Map<HTMLElement, Map<string, string>> {
  const originalStyles = new Map<HTMLElement, Map<string, string>>();

  const colorProps = [
    "color",
    "backgroundColor",
    "borderColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
  ];

  const allElements = element.querySelectorAll("*");
  const elementsToProcess = [element, ...Array.from(allElements)];

  elementsToProcess.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);
    const elementOriginalStyles = new Map<string, string>();

    colorProps.forEach((prop) => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && (value.includes("oklch") || value.includes("oklab"))) {
        // Store original inline style value (if any)
        const originalValue = htmlEl.style.getPropertyValue(prop);
        elementOriginalStyles.set(prop, originalValue);

        // Convert to safe RGB
        let gray = 200;
        const match = value.match(/okl(ch|ab)\(([^)]+)\)/);
        if (match && match[2]) {
          const parts = match[2].trim().split(/\s+/);
          const lStr = parts[0];
          let l = parseFloat(lStr);
          if (!isNaN(l)) {
            if (lStr.includes('%')) l = l / 100;
            l = Math.max(0, Math.min(1, l));
            gray = Math.round(l * 255);
          }
        }

        // Apply inline RGB override
        htmlEl.style.setProperty(prop, `rgb(${gray}, ${gray}, ${gray})`, "important");
      }
    });

    if (elementOriginalStyles.size > 0) {
      originalStyles.set(htmlEl, elementOriginalStyles);
    }
  });

  return originalStyles;
}

// Restore original inline styles
function restoreInlineStyles(originalStyles: Map<HTMLElement, Map<string, string>>) {
  originalStyles.forEach((propsMap, element) => {
    propsMap.forEach((originalValue, prop) => {
      if (originalValue) {
        element.style.setProperty(prop, originalValue);
      } else {
        element.style.removeProperty(prop);
      }
    });
  });
}

export async function exportAllSlidesToPDF(
  slideRefs: (HTMLDivElement | null | undefined)[],
  pageOrder?: number[]
) {
  // Filter only valid DOM elements; guard against undefined holes in the array.
  let validSlides = (slideRefs || []).filter(
    (ref): ref is HTMLDivElement => ref instanceof HTMLDivElement
  );

  // If pageOrder is provided, reorder slides to match the visual order
  if (pageOrder && pageOrder.length > 0) {
    const orderedSlides: HTMLDivElement[] = [];
    pageOrder.forEach((slideId) => {
      const slide = slideRefs[slideId];
      if (slide instanceof HTMLDivElement) {
        orderedSlides.push(slide);
      }
    });
    validSlides = orderedSlides;
  }

  if (validSlides.length === 0) return;

  // 🧩 1️⃣ Temporarily force RGB theme to avoid oklch()/oklab() color error
  // Add pdf-safe class and wait for CSS to apply globally
  document.documentElement.classList.add("pdf-safe");

  // Force style recalculation by accessing computed styles
  window.getComputedStyle(document.documentElement).getPropertyValue('--background');

  // Wait longer for CSS propagation (300ms to ensure all styles are applied)
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Convert pixels to mm (assuming 96 DPI: 1px = 0.264583mm)
  const pxToMm = 0.264583;

  // First, measure all slides to get their dimensions
  const slideDimensions: Array<{ width: number; height: number }> = [];
  for (const slideElement of validSlides) {
    slideElement.style.transform = "scale(1)";
    slideElement.style.opacity = "1";
    slideElement.style.display = "block";
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const slideRect = slideElement.getBoundingClientRect();
    const slideWidth = slideElement.scrollWidth || slideRect.width;
    const slideHeight = slideElement.scrollHeight || slideRect.height;
    slideDimensions.push({ width: slideWidth, height: slideHeight });
  }

  // Create PDF with custom page size matching first slide
  const firstWidth = slideDimensions[0].width;
  const firstHeight = slideDimensions[0].height;
  const pdf = new jsPDF({
    orientation: firstWidth > firstHeight ? "landscape" : "portrait",
    unit: "mm",
    format: [firstWidth * pxToMm, firstHeight * pxToMm],
  });

  try {
    for (let i = 0; i < validSlides.length; i++) {
      const slideElement = validSlides[i];
      if (!slideElement) continue;

      const { width: slideWidth, height: slideHeight } = slideDimensions[i];

      // 🧩 2️⃣ Apply inline RGB overrides to prevent html2canvas from seeing modern colors
      const originalStyles = applyInlineRGBOverrides(slideElement);

      try {
        // 🧩 3️⃣ Render canvas with safe options and convert oklch in cloned DOM
        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: slideWidth,
          height: slideHeight,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            // Remove text truncation on widget header titles so they render fully in PDF
            clonedDoc.querySelectorAll(".truncate").forEach((el) => {
              const h = el as HTMLElement;
              h.classList.remove("truncate");
              h.style.overflow = "visible";
              h.style.textOverflow = "clip";
              h.style.whiteSpace = "normal";
              h.style.wordBreak = "break-word";
              h.style.fontSize = "11px";
              h.style.lineHeight = "1.3";
            });

            // Ensure slide header h1 descenders (g, y, p) are not clipped
            clonedDoc.querySelectorAll("h1").forEach((el) => {
              el.style.overflow = "visible";
              el.style.paddingBottom = "4px";
              el.style.lineHeight = "1.4";
            });

            // Make table columns auto-size so headers aren't cramped
            clonedDoc.querySelectorAll("table.table-fixed").forEach((el) => {
              (el as HTMLElement).style.tableLayout = "auto";
              el.classList.remove("table-fixed");
            });

            // Fix table header cells — remove fixed height so wrapped text isn't clipped
            clonedDoc.querySelectorAll("th").forEach((th) => {
              const h = th as HTMLElement;
              h.style.height = "auto";
              h.style.minHeight = "40px";
              h.style.paddingTop = "8px";
              h.style.paddingBottom = "8px";
              h.style.whiteSpace = "normal";
              h.style.overflow = "visible";
            });

            // Force visible borders on table cells directly
            // html2canvas cannot resolve CSS custom properties used by Tailwind border colors
            // Applying to td/th directly is more reliable than tr borders
            clonedDoc.querySelectorAll("table").forEach((table) => {
              const t = table as HTMLElement;
              t.style.borderCollapse = "collapse";
            });
            clonedDoc.querySelectorAll("td").forEach((td) => {
              const h = td as HTMLElement;
              h.style.borderBottom = "1px solid #e5e7eb";
            });
            clonedDoc.querySelectorAll("th").forEach((th) => {
              const h = th as HTMLElement;
              h.style.borderBottom = "2px solid #d1d5db";
            });

            // Convert all oklch() and oklab() colors to RGB in the cloned document
            convertModernColorsInClonedDom(clonedDoc);

            // Replace iframe-based embed widgets with a static card so they render in PDF
            const embeds = clonedDoc.querySelectorAll(".embed-widget");
            embeds.forEach((container) => {
              const el = container as HTMLElement;
              const title = el.getAttribute("data-embed-title") || "Embedded content";
              const url = el.getAttribute("data-embed-url") || "";

              const iframe = el.querySelector("iframe");
              if (iframe) {
                iframe.remove();
              }

              el.innerHTML = `
                <div style="width: 100%; border-radius: 8px; border: 1px solid #d4d4d8; background: #f9fafb; padding: 8px 10px; box-sizing: border-box; text-align: left;">
                  <div style="font-size: 12px; font-weight: 600; color: #111827; margin-bottom: 4px;">
                    ${title}
                  </div>
                  <div style="font-size: 11px; color: #4b5563; word-break: break-all;">
                    ${url}
                  </div>
                </div>
              `;
            });
          },
        });

        const imgData = canvas.toDataURL("image/png", 1.0);

        // 🧩 4️⃣ Add each slide to PDF with custom page size
        if (i !== 0) {
          // Create new page with dimensions matching this slide
          const pageWidthMm = slideWidth * pxToMm;
          const pageHeightMm = slideHeight * pxToMm;
          pdf.addPage([pageWidthMm, pageHeightMm],
            slideWidth > slideHeight ? "landscape" : "portrait"
          );
        }

        // Use slide's actual dimensions in mm
        const finalWidth = slideWidth * pxToMm;
        const finalHeight = slideHeight * pxToMm;

        // Add image at full size, starting from top-left corner
        pdf.addImage(
          imgData,
          "PNG",
          0,
          0,
          finalWidth,
          finalHeight,
          undefined,
          "FAST"
        );
      } finally {
        // Restore original styles after capturing this slide
        restoreInlineStyles(originalStyles);
      }
    }

    pdf.save("Report-Slides.pdf");
  } finally {
    // 🧩 5️⃣ Restore normal theme
    document.documentElement.classList.remove("pdf-safe");
  }
}
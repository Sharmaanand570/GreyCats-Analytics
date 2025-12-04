import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Convert all oklch() colors in cloned DOM to RGB
function convertOklchInClonedDom(clonedDoc: Document) {
  // Add pdf-safe class to cloned document root
  if (clonedDoc.documentElement) {
    clonedDoc.documentElement.classList.add("pdf-safe");
  }

  // Also inject CSS that overrides all oklch() with RGB
  const style = clonedDoc.createElement("style");
  style.textContent = `
    .pdf-safe, .pdf-safe * {
      color: rgb(36, 36, 36) !important;
      background-color: rgb(255, 255, 255) !important;
      border-color: rgb(235, 235, 235) !important;
    }
  `;
  clonedDoc.head.appendChild(style);

  // Walk through all elements and convert computed oklch() to RGB
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
      if (value && value.includes("oklch")) {
        // Convert oklch to RGB - simplified for grayscale
        const match = value.match(/oklch\(([^)]+)\)/);
        if (match) {
          const values = match[1].split(/\s+/).map((v) => parseFloat(v.trim()));
          if (values.length >= 1) {
            // For grayscale (chroma < 0.01), convert lightness to RGB
            if (values.length >= 2 && values[1] < 0.01) {
              const gray = Math.round(values[0] * 255);
              htmlElement.style.setProperty(
                prop,
                `rgb(${gray}, ${gray}, ${gray})`,
                "important"
              );
            } else {
              // For colored oklch, approximate to a safe RGB
              const gray = Math.round(values[0] * 255);
              htmlElement.style.setProperty(
                prop,
                `rgb(${gray}, ${gray}, ${gray})`,
                "important"
              );
            }
          }
        }
      }
    });
  });
}

export async function exportAllSlidesToPDF(
  slideRefs: (HTMLDivElement | null | undefined)[]
) {
  // Filter only valid DOM elements; guard against undefined holes in the array.
  const validSlides = (slideRefs || []).filter(
    (ref): ref is HTMLDivElement => ref instanceof HTMLDivElement
  );

  if (validSlides.length === 0) return;

  // 🧩 1️⃣ Temporarily force RGB theme to avoid oklch() color error
  // Add pdf-safe class and wait for CSS to apply
  document.documentElement.classList.add("pdf-safe");
  await new Promise((resolve) => setTimeout(resolve, 100)); // Longer delay for CSS

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

  for (let i = 0; i < validSlides.length; i++) {
    const slideElement = validSlides[i];
    if (!slideElement) continue;

    const { width: slideWidth, height: slideHeight } = slideDimensions[i];

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
        // Convert all oklch() colors to RGB in the cloned document
        convertOklchInClonedDom(clonedDoc);

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
  }

  // 🧩 5️⃣ Restore normal theme
  document.documentElement.classList.remove("pdf-safe");

  pdf.save("Report-Slides.pdf");
}
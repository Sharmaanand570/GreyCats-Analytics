import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type {
  TitleWidgetData,
  TableWidgetData,
  ChartWidgetData,
  MapWidgetData,
  MetricWidgetData,
  ImageWidgetData,
  EmbedWidgetData,
  CustomWidgetData,
  WidgetData,
} from "../widgetTypes";
import type { ReportWidgetType } from "../reportTypes";
import { reportTableRows } from "../reportConstants";
import { getReportStatusBadgeClass } from "../../utils/statusColors";

// PDF Styles
const styles = StyleSheet.create({
  widgetContainer: {
    padding: 8,
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: "100%",
    height: "100%",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Helvetica", // Use built-in font
  },
  tableContainer: {
    margin: 8,
    width: "100%",
    height: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    fontFamily: "Helvetica", // Use built-in font
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableCell: {
    fontSize: 9,
    color: "#374151",
    fontFamily: "Helvetica", // Use built-in font
  },
  metricContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    width: "100%",
    height: "100%",
  },
  metricValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    fontFamily: "Helvetica", // Use built-in font
  },
  metricUnit: {
    fontSize: 18,
    color: "#4b5563",
    marginLeft: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 8,
    fontFamily: "Helvetica", // Use built-in font
  },
  placeholderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  placeholderText: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "Helvetica", // Use built-in font
  },
  imageContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    fontSize: 8,
    padding: "4px 8px",
    borderRadius: 12,
    borderWidth: 1,
  },
});

// Helper to get status badge color for PDF
function getStatusBadgeColor(status: string | undefined): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  if (!status) return { backgroundColor: "#f3f4f6", color: "#374151", borderColor: "#6b7280" };
  const badgeClass = getReportStatusBadgeClass(status as any);

  // Map Tailwind classes to PDF colors
  if (badgeClass.includes("bg-green")) {
    return { backgroundColor: "#d1fae5", color: "#065f46", borderColor: "#10b981" };
  } else if (badgeClass.includes("bg-yellow")) {
    return { backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#f59e0b" };
  } else if (badgeClass.includes("bg-gray")) {
    return { backgroundColor: "#f3f4f6", color: "#374151", borderColor: "#6b7280" };
  }
  return { backgroundColor: "#f3f4f6", color: "#374151", borderColor: "#6b7280" };
}

// PDF Widget Components
export function PDFTitleWidget({ data }: { data?: TitleWidgetData }) {
  const text = data?.text ?? "Demo title";
  const fontSize = data?.fontSize ?? "2xl";
  const align = data?.align ?? "center";

  // Map fontSize to PDF font sizes
  const fontSizeMap: Record<string, number> = {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  };

  const pdfFontSize = fontSizeMap[fontSize] ?? 24;

  const justifyContent =
    align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

  return (
    <View
      style={[
        styles.titleContainer,
        {
          justifyContent,
          backgroundColor: data?.backgroundColor ?? "#ffffff",
        },
      ]}
    >
      <Text
        style={[
          styles.titleText,
          {
            fontSize: pdfFontSize,
            color: data?.color ?? "#111827",
            fontFamily: "Helvetica", // Ensure font is set
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

export function PDFTableWidget({ data }: { data?: TableWidgetData }) {
  const rows = data?.rows ?? reportTableRows;
  const title = data?.title ?? "Scheduled Reports";
  const caption = data?.caption ?? "Queue of report deliveries.";
  const columns = data?.columns ?? [
    { name: "Report", width: "35%" },
    { name: "Audience" },
    { name: "Status" },
    { name: "Last Run" },
    { name: "Next Send" },
  ];

  // Calculate column widths (PDF uses percentages)
  const columnWidths = columns.map((col) => {
    if (col.width) {
      const widthValue = parseFloat(col.width);
      return `${widthValue}%`;
    }
    // Distribute remaining space equally
    const remainingCols = columns.filter((c) => !c.width).length;
    return `${(100 - columns.filter((c) => c.width).reduce((sum, c) => sum + parseFloat(c.width || "0"), 0)) / remainingCols}%`;
  });

  return (
    <View style={styles.tableContainer}>
      <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
        {title}
      </Text>
      <View style={styles.tableHeader}>
        {columns.map((col, index) => (
          <Text
            key={col.name}
            style={[
              styles.tableHeaderCell,
              { width: columnWidths[index] },
            ]}
          >
            {col.name}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.tableRow}>
          {columns.map((col, colIndex) => {
            const cellValue =
              col.name === "Report"
                ? row.name
                : col.name === "Audience"
                  ? row.audience
                  : col.name === "Status"
                    ? row.status
                    : col.name === "Last Run"
                      ? row.lastRun
                      : col.name === "Next Send"
                        ? row.nextSend
                        : "";

            if (col.name === "Status") {
              const badgeColors = getStatusBadgeColor(row.status);
              return (
                <View
                  key={colIndex}
                  style={[
                    {
                      width: columnWidths[colIndex],
                      padding: 4,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: badgeColors.backgroundColor,
                        color: badgeColors.color,
                        borderColor: badgeColors.borderColor,
                        alignSelf: "flex-start",
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 8, color: badgeColors.color }}>
                      {String(cellValue)}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <Text
                key={colIndex}
                style={[
                  styles.tableCell,
                  {
                    width: columnWidths[colIndex],
                    fontWeight: colIndex === 0 ? "bold" : "normal",
                  },
                ]}
              >
                {String(cellValue)}
              </Text>
            );
          })}
        </View>
      ))}
      {caption && (
        <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 8 }}>
          {caption}
        </Text>
      )}
    </View>
  );
}

export function PDFMetricWidget({ data }: { data?: MetricWidgetData }) {
  // If widget image URL is provided (from html2canvas conversion), render it
  if (data?.widgetImageUrl) {
    return (
      <View style={styles.imageContainer}>
        <Image
          src={data.widgetImageUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </View>
    );
  }

  // Fallback: render metric as text
  const value = data?.value ?? 0;
  const unit = data?.unit;
  const label = data?.label;

  return (
    <View style={styles.metricContainer}>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text style={styles.metricValue}>{String(value)}</Text>
        {unit && <Text style={styles.metricUnit}>{unit}</Text>}
      </View>
      {label && <Text style={styles.metricLabel}>{label}</Text>}
    </View>
  );
}

export function PDFImageWidget({ data }: { data?: ImageWidgetData }) {
  if (!data?.src) {
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>Image Placeholder</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.imageContainer,
        {
          backgroundColor: data.backgroundColor ?? "#ffffff",
        },
      ]}
    >
      <Image
        src={data.src}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: data.imageFit ?? "contain",
        }}
      />
    </View>
  );
}

export function PDFChartWidget({ data }: { data?: ChartWidgetData }) {
  // If chart image URL is provided (from html2canvas conversion), render it
  if (data?.chartImageUrl) {
    return (
      <View style={styles.imageContainer}>
        <Image
          src={data.chartImageUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </View>
    );
  }

  // Fallback placeholder if no image available
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Chart</Text>
    </View>
  );
}

export function PDFMapWidget({ data }: { data?: MapWidgetData }) {
  // If widget image URL is provided (from html2canvas conversion), render it
  if (data?.widgetImageUrl) {
    return (
      <View style={styles.imageContainer}>
        <Image
          src={data.widgetImageUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </View>
    );
  }

  // Fallback placeholder if no image available
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>
        {data?.location ? `Map: ${data.location}` : "Map Placeholder"}
      </Text>
    </View>
  );
}

export function PDFEmbedWidget({ data }: { data?: EmbedWidgetData }) {
  // Embeds (iframes) cannot be rendered in PDF - show placeholder
  return (
    <View
      style={[
        styles.placeholderContainer,
        {
          backgroundColor: data?.backgroundColor ?? "#f9fafb",
        },
      ]}
    >
      <Text style={styles.placeholderText}>
        {data?.url ? `Embed: ${data.url}` : "Embed Placeholder"}
      </Text>
      <Text style={[styles.placeholderText, { fontSize: 10, marginTop: 4 }]}>
        (Embeds cannot be rendered in PDF)
      </Text>
    </View>
  );
}

export function PDFCustomWidget({ data }: { data?: CustomWidgetData }) {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>
        {data?.content ?? "Custom Placeholder"}
      </Text>
    </View>
  );
}

// Main widget renderer
export function PDFWidgetRenderer({
  widgetType,
  data,
}: {
  widgetType: ReportWidgetType;
  data?: WidgetData;
}) {
  switch (widgetType) {
    case "title":
      return <PDFTitleWidget data={data as TitleWidgetData} />;
    case "table":
      return <PDFTableWidget data={data as TableWidgetData} />;
    case "metric":
      return <PDFMetricWidget data={data as MetricWidgetData} />;
    case "image":
      return <PDFImageWidget data={data as ImageWidgetData} />;
    case "chart":
      return <PDFChartWidget data={data as ChartWidgetData} />;
    case "map":
      return <PDFMapWidget data={data as MapWidgetData} />;
    case "embed":
      return <PDFEmbedWidget data={data as EmbedWidgetData} />;
    case "custom":
      return <PDFCustomWidget data={data as CustomWidgetData} />;
    default:
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Unknown widget type: {widgetType}
          </Text>
        </View>
      );
  }
}


import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAY_LABELS } from "./types";
import type { AdScheduleBlock } from "../../API/googleAdsManagerApi";

type Props = {
  schedule: AdScheduleBlock[];
  onChange: (next: AdScheduleBlock[]) => void;
};

// ─── Grid helpers ────────────────────────────────────────────────────────────

// Convert schedule blocks into a flat 7×24 boolean coverage matrix.
function buildCoverage(schedule: AdScheduleBlock[]): boolean[][] {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(false) as boolean[]);
  schedule.forEach((b) => {
    for (const d of b.days) {
      for (let h = b.startHour; h < b.endHour; h++) {
        if (d >= 0 && d < 7 && h >= 0 && h < 24) grid[d][h] = true;
      }
    }
  });
  return grid;
}

// Convert a 7×24 boolean matrix back into a compact set of AdScheduleBlocks.
// Adjacent hours on the same day are merged; days sharing identical hour
// coverage are grouped into the same block.
function matrixToSchedule(grid: boolean[][]): AdScheduleBlock[] {
  // For each day, extract hour runs.
  type DayRuns = { startHour: number; endHour: number }[];
  const dayRuns: DayRuns[] = grid.map((row) => {
    const runs: DayRuns = [];
    let runStart: number | null = null;
    for (let h = 0; h <= 24; h++) {
      const active = h < 24 && row[h];
      if (active && runStart === null) {
        runStart = h;
      } else if (!active && runStart !== null) {
        runs.push({ startHour: runStart, endHour: h });
        runStart = null;
      }
    }
    return runs;
  });

  // Group days that have identical runs.
  const blocks: AdScheduleBlock[] = [];
  const used = new Set<number>();

  dayRuns.forEach((runs, d) => {
    if (used.has(d) || runs.length === 0) return;
    // For simplicity: one block per run per day-group.
    runs.forEach((run) => {
      const sameDays = dayRuns.reduce<number[]>((acc, r2, d2) => {
        if (
          !used.has(d2) &&
          r2.some(
            (r) => r.startHour === run.startHour && r.endHour === run.endHour
          )
        ) {
          acc.push(d2);
        }
        return acc;
      }, []);
      blocks.push({ days: sameDays, startHour: run.startHour, endHour: run.endHour });
    });
    used.add(d);
  });

  return blocks;
}

function formatHour(h: number) {
  if (h === 0 || h === 24) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

// ─── DaypartingGrid ──────────────────────────────────────────────────────────

export function DaypartingGrid({ schedule, onChange }: Props) {
  // Derive coverage grid from schedule.
  const coverage = useMemo(() => buildCoverage(schedule), [schedule]);

  // Drag state — track which cells are being toggled in the current gesture.
  const dragging = useRef(false);
  const dragMode = useRef<boolean>(true); // true = setting, false = clearing
  const [hoverCell, setHoverCell] = useState<{ d: number; h: number } | null>(null);

  // Working copy of the coverage grid during a drag gesture.
  const draftGrid = useRef<boolean[][] | null>(null);

  const commitDraft = useCallback(() => {
    if (!draftGrid.current) return;
    onChange(matrixToSchedule(draftGrid.current));
    draftGrid.current = null;
    dragging.current = false;
  }, [onChange]);

  // Global mouseup to end drag even if cursor leaves the grid.
  useEffect(() => {
    const up = () => {
      if (dragging.current) commitDraft();
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, [commitDraft]);

  const handleMouseDown = (d: number, h: number) => {
    // Deep-copy the coverage matrix as our working draft.
    draftGrid.current = coverage.map((row) => [...row]);
    dragMode.current = !draftGrid.current[d][h]; // toggle direction
    draftGrid.current[d][h] = dragMode.current;
    dragging.current = true;
    // Force a re-render by calling onChange with the current draft.
    onChange(matrixToSchedule(draftGrid.current));
  };

  const handleMouseEnter = (d: number, h: number) => {
    setHoverCell({ d, h });
    if (!dragging.current || !draftGrid.current) return;
    draftGrid.current[d][h] = dragMode.current;
    onChange(matrixToSchedule(draftGrid.current));
  };

  const allCovered = schedule.length === 0;
  const blocksCount = schedule.length;

  // Hour labels — show every 3 hours.
  const hourLabels = Array.from({ length: 24 }, (_, h) =>
    h % 3 === 0 ? formatHour(h) : ""
  );

  return (
    <div className="space-y-4" onMouseLeave={() => setHoverCell(null)}>
      {/* Status */}
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        <Clock className="w-3.5 h-3.5" />
        {allCovered
          ? "Running 24 / 7 — click cells below to restrict hours"
          : `${blocksCount} schedule block${blocksCount === 1 ? "" : "s"} active`}
      </div>

      {/* Interactive 7×24 grid */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 overflow-x-auto select-none">
        <div className="min-w-[520px]">
          {/* Hour axis */}
          <div className="grid gap-px mb-1" style={{ gridTemplateColumns: "36px repeat(24, 1fr)" }}>
            <div /> {/* empty corner */}
            {hourLabels.map((label, h) => (
              <div
                key={h}
                className="text-center text-[8px] font-mono text-slate-400 leading-none"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Rows */}
          {DAY_LABELS.map((dayLabel, d) => (
            <div
              key={d}
              className="grid gap-[2px] mb-[2px]"
              style={{ gridTemplateColumns: "36px repeat(24, 1fr)" }}
            >
              {/* Day label */}
              <div className="text-[10px] font-bold text-slate-500 pr-1 text-right self-center">
                {dayLabel}
              </div>
              {/* Hour cells */}
              {Array.from({ length: 24 }, (_, h) => {
                const active = coverage[d][h];
                const isHover =
                  hoverCell?.d === d && hoverCell?.h === h;
                return (
                  <div
                    key={h}
                    onMouseDown={() => handleMouseDown(d, h)}
                    onMouseEnter={() => handleMouseEnter(d, h)}
                    className={cn(
                      "h-5 rounded-[3px] cursor-pointer transition-colors border",
                      active
                        ? "bg-[#1A73E8] border-[#1A73E8] hover:bg-[#1557B0]"
                        : allCovered
                          ? "bg-emerald-100 border-emerald-200 hover:bg-emerald-200"
                          : isHover
                            ? "bg-slate-200 border-slate-300"
                            : "bg-white border-slate-200 hover:bg-slate-100"
                    )}
                    title={`${dayLabel} ${formatHour(h)}–${formatHour(h + 1)}: ${active ? "on" : "off"}`}
                  />
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-3 h-3 rounded-sm bg-[#1A73E8]" />
              Ad runs
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-3 h-3 rounded-sm bg-white border border-slate-300" />
              Ad paused
            </div>
            <span className="text-[10px] text-slate-400 ml-auto">
              Click or drag to toggle hours
            </span>
          </div>
        </div>
      </div>

      {/* Active blocks list */}
      {schedule.length > 0 && (
        <div className="space-y-2">
          {schedule.map((b, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                <span className="font-bold">
                  {b.days.map((d) => DAY_LABELS[d]).join(", ")}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-slate-600">
                  {formatHour(b.startHour)} – {formatHour(b.endHour)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  // Clear the cells for this block in the coverage grid and recommit.
                  const next = coverage.map((row) => [...row]);
                  b.days.forEach((d) => {
                    for (let h = b.startHour; h < b.endHour; h++) {
                      next[d][h] = false;
                    }
                  });
                  onChange(matrixToSchedule(next));
                }}
                className="text-slate-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

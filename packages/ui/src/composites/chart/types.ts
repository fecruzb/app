import type { ChartConfig } from "./chart";

/** Theme chart tokens — cycle when a chart has more series than colors. */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export type ChartDataPoint = Record<string, string | number>;

export type CartesianChartProps = {
  data: ChartDataPoint[];
  /** Category axis key (X for vertical bar/line). */
  index: string;
  /** Numeric keys to plot as series. */
  series: string[];
  /** Display labels for series keys. Defaults to the key itself. */
  seriesLabel?: Record<string, string>;
  /** Override series colors (defaults to `--chart-1`…`5`). */
  colors?: string[];
  className?: string;
  /** Defaults to true when there is more than one series. */
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  /** Format Y-axis / tooltip numbers. */
  valueFormatter?: (value: number) => string;
};

export function chartColorAt(index: number, colors?: string[]): string {
  const palette = colors?.length ? colors : CHART_COLORS;
  return palette[index % palette.length]!;
}

export function buildSeriesConfig(
  series: string[],
  seriesLabel?: Record<string, string>,
  colors?: string[],
): ChartConfig {
  const config: ChartConfig = {};
  for (const [i, key] of series.entries()) {
    config[key] = {
      label: seriesLabel?.[key] ?? key,
      color: chartColorAt(i, colors),
    };
  }
  return config;
}

export function formatTick(value: number, valueFormatter?: (value: number) => string): string {
  return valueFormatter ? valueFormatter(value) : value.toLocaleString();
}

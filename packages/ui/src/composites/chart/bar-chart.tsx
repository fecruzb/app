import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { cn } from "../../lib/utils";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";
import { buildSeriesConfig, formatTick, type CartesianChartProps } from "./types";

export type BarChartProps = CartesianChartProps & {
  /** Stack series on top of each other. */
  stacked?: boolean;
  /** Horizontal bars (`layout="vertical"` in Recharts). */
  layout?: "horizontal" | "vertical";
};

/** Simple bar chart — pass `data`, an `index` key, and one or more `series` keys. */
export function BarChart({
  data,
  index,
  series,
  seriesLabel,
  colors,
  className,
  showLegend,
  showGrid = true,
  showTooltip = true,
  stacked = false,
  layout = "horizontal",
  valueFormatter,
}: BarChartProps) {
  const config = buildSeriesConfig(series, seriesLabel, colors);
  const legend = showLegend ?? series.length > 1;
  const isVertical = layout === "vertical";

  return (
    <ChartContainer config={config} className={cn("aspect-auto h-[280px] w-full", className)}>
      <RechartsBarChart
        accessibilityLayer
        data={data}
        layout={isVertical ? "vertical" : "horizontal"}
        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
      >
        {showGrid ? <CartesianGrid vertical={!isVertical} horizontal={isVertical} /> : null}
        {isVertical ? (
          <>
            <YAxis
              dataKey={index}
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={72}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => formatTick(Number(v), valueFormatter)}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={index} tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
              tickFormatter={(v) => formatTick(Number(v), valueFormatter)}
            />
          </>
        )}
        {showTooltip ? <ChartTooltip cursor={false} content={<ChartTooltipContent />} /> : null}
        {legend ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {series.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={4}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}

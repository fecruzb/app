import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from "recharts";
import { cn } from "../../lib/utils";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";
import { buildSeriesConfig, formatTick, type CartesianChartProps } from "./types";

export type LineChartProps = CartesianChartProps & {
  /** Line interpolation. */
  curve?: "monotone" | "linear" | "step";
  /** Show dots on data points. */
  showDots?: boolean;
};

/** Simple line chart — same data shape as `BarChart`. */
export function LineChart({
  data,
  index,
  series,
  seriesLabel,
  colors,
  className,
  showLegend,
  showGrid = true,
  showTooltip = true,
  curve = "monotone",
  showDots = false,
  valueFormatter,
}: LineChartProps) {
  const config = buildSeriesConfig(series, seriesLabel, colors);
  const legend = showLegend ?? series.length > 1;

  return (
    <ChartContainer config={config} className={cn("aspect-auto h-[280px] w-full", className)}>
      <RechartsLineChart
        accessibilityLayer
        data={data}
        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
      >
        {showGrid ? <CartesianGrid vertical={false} /> : null}
        <XAxis dataKey={index} tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={40}
          tickFormatter={(v) => formatTick(Number(v), valueFormatter)}
        />
        {showTooltip ? (
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        ) : null}
        {legend ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {series.map((key) => (
          <Line
            key={key}
            dataKey={key}
            type={curve}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={showDots}
            activeDot={{ r: 4 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}

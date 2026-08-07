import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";
import { cn } from "../../lib/utils";
import type { ChartConfig } from "./chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";
import { chartColorAt, type ChartDataPoint } from "./types";

export type PieChartProps = {
  data: ChartDataPoint[];
  /** Slice label key. Defaults to `"name"`. */
  nameKey?: string;
  /** Slice value key. Defaults to `"value"`. */
  valueKey?: string;
  /** Optional label for the value series (tooltip/legend header). */
  valueLabel?: string;
  colors?: string[];
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  /** Set for a donut (e.g. `60`). */
  innerRadius?: number;
};

/** Simple pie / donut chart — `{ name, value }` rows by default. */
export function PieChart({
  data,
  nameKey = "name",
  valueKey = "value",
  valueLabel,
  colors,
  className,
  showLegend = true,
  showTooltip = true,
  innerRadius = 0,
}: PieChartProps) {
  const config: ChartConfig = {
    [valueKey]: { label: valueLabel ?? valueKey },
  };
  for (const [i, item] of data.entries()) {
    const name = String(item[nameKey] ?? i);
    config[name] = {
      label: name,
      color: chartColorAt(i, colors),
    };
  }

  return (
    <ChartContainer
      config={config}
      className={cn("mx-auto aspect-square h-[280px] w-full max-w-[280px]", className)}
    >
      <RechartsPieChart accessibilityLayer>
        {showTooltip ? (
          <ChartTooltip content={<ChartTooltipContent nameKey={nameKey} hideLabel />} />
        ) : null}
        {showLegend ? <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} /> : null}
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius={innerRadius}
          strokeWidth={2}
        >
          {data.map((item, i) => {
            const name = String(item[nameKey] ?? i);
            return <Cell key={name} fill={chartColorAt(i, colors)} />;
          })}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
}

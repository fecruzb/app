import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../lib/utils";

export type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root>;

/**
 * Accessible range slider (single or multi-thumb). Controlled via `value` /
 * `defaultValue` as number arrays — e.g. `value={[40]}` or `value={[20, 80]}`.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderProps) {
  const thumbCount = React.useMemo(() => {
    if (Array.isArray(value)) return value.length;
    if (Array.isArray(defaultValue)) return defaultValue.length;
    return 1;
  }, [value, defaultValue]);

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full bg-primary/20",
          "data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute rounded-full bg-primary",
            "data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            "block size-5 shrink-0 rounded-full border-2 border-primary bg-background shadow-sm",
            "ring-ring/40 transition-[color,box-shadow]",
            "hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };

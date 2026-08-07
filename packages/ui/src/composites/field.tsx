import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Label } from "../primitives/label";

/**
 * Layout wrapper for a form control + label.
 * - `vertical` — label above control (default for Input / Textarea / Combobox)
 * - `horizontal` — control + label in one row, fixed `h-9` so it lines up with Input
 */
const fieldVariants = cva("group/field flex gap-2", {
  variants: {
    orientation: {
      vertical:
        "w-full flex-col " +
        "[&_[data-slot=input]]:w-full [&_[data-slot=textarea]]:w-full " +
        "[&_[data-slot=combobox-trigger]]:w-full",
      horizontal:
        // Match Input `h-9` so rows with `items-center` / `items-end` line up.
        "h-9 w-auto flex-row items-center gap-2 " +
        "[&_[data-slot=checkbox]]:shrink-0 [&_[data-slot=radio-group-item]]:shrink-0 [&_[data-slot=switch]]:shrink-0",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

function Field({
  className,
  orientation = "vertical",
  ...props
}: ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "flex w-full flex-col gap-4",
        "has-[[data-orientation=horizontal]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "w-fit leading-none",
        "group-data-[orientation=horizontal]/field:font-normal",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Field, FieldGroup, FieldLabel, FieldDescription, fieldVariants };

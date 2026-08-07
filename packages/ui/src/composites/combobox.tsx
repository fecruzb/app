import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { cn } from "../lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../primitives/command";
import { Popover, PopoverContent, PopoverTrigger } from "../primitives/popover";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Optional leading icon (or any node). */
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Extra strings matched by the typeahead filter. */
  keywords?: string[];
  /** When set, options with the same group share a heading. */
  group?: string;
};

type ComboboxBaseProps = {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Trigger placeholder when nothing is selected — caller supplies i18n. */
  placeholder: string;
  /** Search field placeholder inside the panel — caller supplies i18n. */
  searchPlaceholder: string;
  /** Shown when the filter yields no options — caller supplies i18n. */
  emptyMessage: string;
  /** Hide the search field (plain picker). Defaults to `true` (typeahead on). */
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Accessible name when no visible label is associated. */
  "aria-label"?: string;
  /** Width of the popover — defaults to match the trigger. */
  contentClassName?: string;
};

/** `clearLabel` is required when the clear control is shown. */
export type ComboboxProps =
  | (ComboboxBaseProps & { clearable?: false; clearLabel?: never })
  | (ComboboxBaseProps & { clearable: true; clearLabel: string });

/**
 * Searchable select that matches Input/Textarea chrome. Pass i18n strings for
 * placeholders / empty state from the app layer.
 */
function Combobox(props: ComboboxProps) {
  const {
    options,
    value: valueProp,
    defaultValue = "",
    onValueChange,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    searchable = true,
    disabled = false,
    className,
    id,
    "aria-label": ariaLabel,
    contentClassName,
  } = props;
  const [open, setOpen] = React.useState(false);
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolled;

  const selected = options.find((option) => option.value === value);

  const setValue = (next: string) => {
    if (valueProp === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  const groups = React.useMemo(() => {
    const map = new Map<string | undefined, ComboboxOption[]>();
    for (const option of options) {
      const key = option.group;
      const list = map.get(key);
      if (list) list.push(option);
      else map.set(key, [option]);
    }
    return map;
  }, [options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          data-slot="combobox-trigger"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            className,
          )}
        >
          {selected?.icon ? <span className="text-muted-foreground">{selected.icon}</span> : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-left",
              !selected && "text-muted-foreground",
            )}
          >
            {selected?.label ?? placeholder}
          </span>
          {props.clearable === true && selected ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label={props.clearLabel}
              className="rounded-sm opacity-60 hover:opacity-100"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setValue("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  setValue("");
                }
              }}
            >
              <XIcon />
            </span>
          ) : (
            <ChevronsUpDownIcon className="opacity-50" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)] p-0", contentClassName)}
        align="start"
      >
        <Command>
          {searchable ? <CommandInput placeholder={searchPlaceholder} /> : null}
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {[...groups.entries()].map(([heading, items]) => (
              <CommandGroup key={heading ?? "__default"} heading={heading}>
                {items.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label, ...(option.keywords ?? [])]}
                    disabled={option.disabled}
                    onSelect={() => {
                      setValue(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.icon ? (
                      <span className="text-muted-foreground">{option.icon}</span>
                    ) : null}
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    <CheckIcon
                      className={cn(
                        "ml-auto size-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { Combobox };

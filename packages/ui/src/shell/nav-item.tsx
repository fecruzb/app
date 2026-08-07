import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const navItemVariants = cva(
  "inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        /** Compact text link for site headers. */
        header: "px-3 py-1.5",
        /** Icon + label row for app / admin sidebars. */
        sidebar: "w-full px-3 py-2",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "header",
        active: true,
        className: "bg-muted font-medium text-foreground",
      },
      {
        variant: "header",
        active: false,
        className: "text-muted-foreground hover:text-foreground",
      },
      {
        variant: "sidebar",
        active: true,
        className: "bg-primary/10 text-primary",
      },
      {
        variant: "sidebar",
        active: false,
        className: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      },
    ],
    defaultVariants: {
      variant: "sidebar",
      active: false,
    },
  },
);

type NavItemProps = React.ComponentProps<"span"> &
  VariantProps<typeof navItemVariants> & {
    icon?: React.ReactNode;
    asChild?: boolean;
  };

/**
 * Single nav entry. Drive `active` from the router (`NavLink` render prop) and
 * pass icons as nodes so the package stays router-agnostic.
 */
function NavItem({
  className,
  variant,
  active,
  icon,
  asChild = false,
  children,
  ...props
}: NavItemProps) {
  const Comp = asChild ? Slot : "span";
  const isActive = Boolean(active);
  return (
    <Comp className={cn(navItemVariants({ variant, active: isActive }), className)} {...props}>
      {icon ? (
        <span className={cn("[&_svg]:size-4 [&_svg]:shrink-0", isActive && variant === "sidebar" && "text-primary")}>
          {icon}
        </span>
      ) : null}
      {children}
    </Comp>
  );
}

export { NavItem, navItemVariants };

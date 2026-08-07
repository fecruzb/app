import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Avatar, AvatarFallback } from "../primitives/avatar";
import { cn } from "../lib/utils";

/**
 * User-menu trigger — avatar + name + email. Wrap with a dropdown trigger via
 * `asChild` (or nest this as the child of `DropdownMenuTrigger asChild`).
 */
function UserMenuButton({
  className,
  name,
  email,
  initials,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  name: string;
  email?: string;
  initials: string;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : "button"}
      className={cn(
        "flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-accent",
        className,
      )}
      {...props}
    >
      <Avatar>
        <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{name}</span>
        {email ? (
          <span className="block truncate text-xs text-muted-foreground">{email}</span>
        ) : null}
      </span>
    </Comp>
  );
}

export { UserMenuButton };

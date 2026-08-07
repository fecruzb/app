import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../primitives/card";
import { cn } from "../lib/utils";

/**
 * Centered auth chrome: brand above a single card (title / description / body)
 * and an optional footer under it. Login, register, recovery screens.
 */
function AuthShell({
  brand,
  title,
  description,
  footer,
  children,
  className,
}: {
  brand: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12",
        className,
      )}
    >
      <div className="mb-6">{brand}</div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {footer ? <div className="mt-4 text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  );
}

export { AuthShell };

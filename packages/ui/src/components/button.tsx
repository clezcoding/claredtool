import * as React from "react";
import { cn } from "../lib/utils";

function Button({
  className,
  variant: _variant,
  size: _size,
  asChild: _asChild,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: string;
  size?: string;
  asChild?: boolean;
}) {
  return (
    <button
      data-slot="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Button };

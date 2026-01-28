import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function FileManagerHeader({
  children,
  className
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-4 flex md:flex-row gap-2', className)}>
      {children}
    </div>
  );
}

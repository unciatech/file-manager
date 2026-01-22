import { ReactNode } from "react";

export function FileManagerHeader({ children }: { children?: ReactNode }) {
  return (

    <div className="p-4 hidden md:flex md:flex-row gap-2">
      {children}
    </div>
  );
}

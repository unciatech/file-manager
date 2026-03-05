"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CrossIcon } from "@/components/icons";
import { forwardRef } from "react";

export interface CloseButtonProps extends Omit<React.ComponentProps<typeof Button>, "children"> {
    iconClassName?: string;
    label?: string;
}

const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
    ({ className, iconClassName, label = "Close", ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant="outline"
                size="icon"
                radius="full"
                type="button"
                className={cn(
                    "border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400",
                    "hover:text-red-600 hover:border-red-300 hover:bg-red-50",
                    "dark:hover:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-900/40",
                    "active:scale-95 transition-all duration-200",
                    className
                )}
                {...props}
            >
                <CrossIcon className={cn("size-5 transition-colors text-inherit", iconClassName)} />
                <span className="sr-only">{label}</span>
            </Button>
        );
    }
);
CloseButton.displayName = "CloseButton";

export { CloseButton };

import * as react_jsx_runtime from 'react/jsx-runtime';
import * as class_variance_authority_types from 'class-variance-authority/types';
import * as React from 'react';
import { VariantProps } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';
import { AlertDialog as AlertDialog$1 } from 'radix-ui';
import { ClassValue } from 'clsx';

declare const buttonVariants: (props?: ({
    variant?: "primary" | "mono" | "destructive" | "secondary" | "outline" | "dashed" | "ghost" | "dim" | "foreground" | "inverse" | null | undefined;
    appearance?: "ghost" | "default" | null | undefined;
    underline?: "dashed" | "solid" | null | undefined;
    underlined?: "dashed" | "solid" | null | undefined;
    size?: "lg" | "md" | "sm" | "xs" | "icon" | null | undefined;
    autoHeight?: boolean | null | undefined;
    radius?: "md" | "full" | null | undefined;
    mode?: "default" | "icon" | "link" | "input" | null | undefined;
    placeholder?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
    /** When true, the button's children will be rendered in a Slot for composition */
    asChild?: boolean;
    /** When true, renders the button in a selected/active state */
    selected?: boolean;
}
/**
 * A versatile button component with multiple variants, sizes, and modes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="outline" mode="icon"><Icon /></Button>
 * <Button asChild><a href="/link">Link Button</a></Button>
 * ```
 */
declare function Button({ className, selected, variant, radius, appearance, mode, size, autoHeight, underlined, underline, asChild, placeholder, ...props }: ButtonProps): react_jsx_runtime.JSX.Element;
interface ButtonArrowProps extends React.SVGProps<SVGSVGElement> {
    /** Custom icon component to use instead of the default ChevronDown */
    icon?: LucideIcon;
}
/**
 * An arrow indicator for dropdown buttons.
 *
 * @example
 * ```tsx
 * <Button>
 *   Select option
 *   <ButtonArrow />
 * </Button>
 * ```
 */
declare function ButtonArrow({ icon: Icon, className, ...props }: ButtonArrowProps): react_jsx_runtime.JSX.Element;

declare function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialog$1.Root>): react_jsx_runtime.JSX.Element;
declare function AlertDialogTrigger({ ...props }: React.ComponentProps<typeof AlertDialog$1.Trigger>): react_jsx_runtime.JSX.Element;
declare function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialog$1.Portal>): react_jsx_runtime.JSX.Element;
declare function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialog$1.Overlay>): react_jsx_runtime.JSX.Element;
declare function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialog$1.Content>): react_jsx_runtime.JSX.Element;
declare const AlertDialogHeader: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => react_jsx_runtime.JSX.Element;
declare const AlertDialogFooter: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => react_jsx_runtime.JSX.Element;
declare function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialog$1.Title>): react_jsx_runtime.JSX.Element;
declare function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialog$1.Description>): react_jsx_runtime.JSX.Element;
interface AlertDialogActionProps extends React.ComponentProps<typeof AlertDialog$1.Action>, VariantProps<typeof buttonVariants> {
}
declare function AlertDialogAction({ className, variant, ...props }: AlertDialogActionProps): react_jsx_runtime.JSX.Element;
declare function AlertDialogCancel({ className, ...props }: React.ComponentProps<typeof AlertDialog$1.Cancel>): react_jsx_runtime.JSX.Element;

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
declare function cn(...inputs: ClassValue[]): string;

export { AlertDialog, AlertDialogAction, type AlertDialogActionProps, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger, Button, ButtonArrow, type ButtonArrowProps, type ButtonProps, buttonVariants, cn };

# @uncia/file-manager

A modern, accessible UI component library built with React, Radix UI, and Tailwind CSS.

## Features

- 🎨 **Beautiful Design** - Modern, clean components with smooth animations
- 🌙 **Dark Mode** - Built-in light and dark theme support
- ♿ **Accessible** - Built on Radix UI primitives for full accessibility
- 📦 **Tree Shakeable** - Only import what you need
- 🔧 **Customizable** - Easily customize with Tailwind CSS variables
- 📱 **Responsive** - Mobile-first responsive design
- 🎯 **TypeScript** - Full TypeScript support with exported types

## Installation

```bash
# npm
npm install @uncia/file-manager

# pnpm
pnpm add @uncia/file-manager

# yarn
yarn add @uncia/file-manager
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
pnpm add react react-dom tailwindcss
```

## Setup

### 1. Import the styles

Add the styles to your application's entry point or global CSS:

```tsx
// In your app's entry file (e.g., layout.tsx, _app.tsx, main.tsx)
import '@uncia/file-manager/styles.css';
```

Or in your CSS file:

```css
@import '@uncia/file-manager/styles.css';
```

### 2. Configure Tailwind CSS (if customizing)

The library uses CSS variables for theming. You can customize them in your CSS:

```css
:root {
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  /* ... other variables */
}

.dark {
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  /* ... other variables */
}
```

## Usage

### Button

```tsx
import { Button, ButtonArrow } from '@uncia/file-manager';

function App() {
  return (
    <>
      {/* Basic buttons */}
      <Button>Click me</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="ghost">Ghost</Button>

      {/* Sizes */}
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>

      {/* With icon */}
      <Button mode="icon">
        <IconComponent />
      </Button>

      {/* As link */}
      <Button asChild>
        <a href="/somewhere">Link Button</a>
      </Button>

      {/* Dropdown button with arrow */}
      <Button>
        Select option
        <ButtonArrow />
      </Button>
    </>
  );
}
```

### Alert Dialog

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@uncia/file-manager';

function App() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Components

| Component | Description |
|-----------|-------------|
| `Button` | A versatile button with multiple variants, sizes, and modes |
| `ButtonArrow` | Arrow indicator for dropdown buttons |
| `AlertDialog` | A modal dialog for confirmations and alerts |

## Utilities

### `cn()`

A utility function for merging Tailwind CSS classes:

```tsx
import { cn } from '@uncia/file-manager';

<div className={cn('base-class', condition && 'conditional-class', className)} />
```

## Theming

The library uses CSS variables for theming. Here are the available variables:

| Variable | Description |
|----------|-------------|
| `--background` | Background color |
| `--foreground` | Text color |
| `--primary` | Primary brand color |
| `--primary-foreground` | Text on primary color |
| `--secondary` | Secondary color |
| `--secondary-foreground` | Text on secondary |
| `--muted` | Muted/subtle color |
| `--muted-foreground` | Muted text color |
| `--accent` | Accent/highlight color |
| `--accent-foreground` | Text on accent |
| `--destructive` | Destructive/error color |
| `--destructive-foreground` | Text on destructive |
| `--border` | Border color |
| `--input` | Input border color |
| `--ring` | Focus ring color |
| `--radius` | Base border radius |

## TypeScript

All components are fully typed. Import types as needed:

```tsx
import type { ButtonProps, AlertDialogActionProps } from '@uncia/file-manager';
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Uncia](https://github.com/uncia)

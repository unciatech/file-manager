# Contributing to @uncia/file-manager

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+

### Getting Started

1. Fork and clone the repository:

```bash
git clone https://github.com/uncia/file-manager.git
cd file-manager
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the library:

```bash
cd packages/ui
pnpm build
```

4. Start development mode:

```bash
pnpm dev
```

## Project Structure

```
packages/ui/
├── src/
│   ├── components/     # UI components
│   │   ├── Button/
│   │   └── AlertDialog/
│   ├── lib/            # Utilities
│   └── index.ts        # Main exports
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

## Adding a New Component

1. Create a new folder in `src/components/`:

```
src/components/MyComponent/
├── MyComponent.tsx
└── index.ts
```

2. Implement the component with proper TypeScript types and JSDoc comments:

```tsx
import * as React from 'react';
import { cn } from '../../lib/utils';

export interface MyComponentProps extends React.ComponentProps<'div'> {
  /** Description of the prop */
  variant?: 'default' | 'alternate';
}

/**
 * Description of the component.
 *
 * @example
 * ```tsx
 * <MyComponent variant="default">Content</MyComponent>
 * ```
 */
export function MyComponent({ className, variant = 'default', ...props }: MyComponentProps) {
  return (
    <div
      data-slot="my-component"
      className={cn('base-styles', className)}
      {...props}
    />
  );
}
```

3. Export from the index file:

```ts
// src/components/MyComponent/index.ts
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

4. Add to main exports:

```ts
// src/index.ts
export * from './components/MyComponent';
```

## Code Style

- Use TypeScript for all code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use `cn()` for className merging
- Add `data-slot` attributes for styling hooks

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Ensure all tests pass and the build succeeds
4. Update documentation if needed
5. Submit a pull request with a clear description

## Commit Messages

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

## Questions?

Open an issue for any questions or concerns!

'use client';

import * as React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Badge, BadgeButton } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CrossIcon } from '../icons';
import { Command as CommandPrimitive } from 'cmdk';

type TagInputProps = {
  tags: string[];
  setTags: (nextTags: string[]) => void;
  allTags: string[];
  inputId?: string;
  placeholder?: string;
  className?: string;
  emptyText?: string;
};

export function TagInput({
  tags,
  setTags,
  allTags,
  inputId,
  placeholder = 'Add tag',
  className,
  emptyText = 'No tags found.',
}: TagInputProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const filteredTags = allTags.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.some((selected) => selected.toLowerCase() === tag.toLowerCase()),
  );

  const addTag = (nextTag: string) => {
    const trimmed = nextTag.trim();
    if (!trimmed) {
      return;
    }

    const exists = tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setTags([...tags, trimmed]);
    }

    setInputValue('');
    setOpen(true);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleBackspace = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      event.preventDefault();
      setTags(tags.slice(0, tags.length - 1));
    }

    if (event.key === 'Enter' && inputValue.trim() && filteredTags.length === 0) {
      event.preventDefault();
      addTag(inputValue);
    }
  };

  const handleSelect = (selectedTag: string) => {
    addTag(selectedTag);
  };

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      <Command className="rounded-md border border-input bg-background shadow-xs">
        <div
          className="flex w-full flex-wrap items-center gap-2 rounded-md p-2"
          onClick={() => inputRef.current?.focus()}
        >
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" appearance="light" size="sm" className="gap-1 pe-1">
              <span>{tag}</span>
              <BadgeButton asChild>
                <button type="button" aria-label={`Remove ${tag} tag`} onClick={() => removeTag(tag)}>
                  <CrossIcon className="size-3" />
                </button>
              </BadgeButton>
            </Badge>
          ))}
          <div className="flex min-w-[120px] flex-1 items-center">
            <CommandPrimitive.Input
              ref={inputRef}
              id={inputId}
              value={inputValue}
              onValueChange={(value) => {
                setInputValue(value);
                setOpen(true);
              }}
              onKeyDown={handleBackspace}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        {open && (
          <div className="w-full">
            <CommandList className="max-h-40 w-full rounded-md bg-primary-foreground">
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem key={tag} value={tag} onSelect={() => handleSelect(tag)} className="cursor-pointer">
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}

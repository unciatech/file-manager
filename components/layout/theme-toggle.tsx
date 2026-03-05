"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "@/components/icons/theme";

/**
 * Toggles dark mode by adding/removing the `.dark` class on <html>.
 * - On mount: reads system preference (prefers-color-scheme) and any
 *   previously saved manual override from localStorage.
 * - On click: toggles dark class and persists the choice.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Determine initial state: localStorage override or system preference
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved ? saved === "dark" : prefersDark;

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      radius="full"
      onClick={toggle}
      className="border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunIcon className="size-4 text-yellow-500" />
      ) : (
        <MoonIcon className="size-4 text-gray-700 dark:text-zinc-300" />
      )}
    </Button>
  );
}

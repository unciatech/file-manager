"use client"

import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Blocking script: applies .dark before first paint to prevent flash in all browsers including Safari */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var saved = localStorage.getItem('theme');
              if (saved === 'dark') {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={cn("text-base antialiased bg-background text-foreground", inter.className)} suppressHydrationWarning>
        <div className="isolate">{children}</div>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}


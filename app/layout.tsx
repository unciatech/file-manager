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
      <body className={cn("text-base antialiased", inter.className)} suppressHydrationWarning>
        <div className="isolate">{children}</div>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}


"use client"

import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={cn("text-base antialiased", inter.className)}>
        <div className="isolate">{children}</div>
      </body>
    </html>
  );
}

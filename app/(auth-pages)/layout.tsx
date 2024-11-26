"use client";

import { ResponsiveProvider } from "@/components/all/ResponsiveContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ResponsiveProvider>{children}</ResponsiveProvider>;
}

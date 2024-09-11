"use client";

import { ResponsiveProvider } from "@/components/all/ResponsiveContext";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveProvider>{children}</ResponsiveProvider>;
}

"use client";
import React from "react";
import { GlobalProvider } from "@/contexts/global-context";

export default function ClientGlobalProvider({ children }: { children: React.ReactNode }) {
  return <GlobalProvider>{children}</GlobalProvider>;
}

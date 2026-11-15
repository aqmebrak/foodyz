"use client";

import { useEffect } from "react";

import { registerServiceWorker } from "@/lib/sw-client";

export function SwRegister() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);
  return null;
}

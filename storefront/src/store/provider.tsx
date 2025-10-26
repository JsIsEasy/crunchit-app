"use client";

import { type ReactNode, createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { type CrunchItStore, createCrunchItStore } from "./crunchItStore";

export interface CrunchItProviderProps {
  children: ReactNode;
}

export type CrunchItStoreApi = ReturnType<typeof createCrunchItStore>;

export const CrunchItStoreContext = createContext<CrunchItStoreApi | undefined>(undefined);

export const CrunchItProvider = ({ children }: CrunchItProviderProps) => {
  const storeRef = useRef<CrunchItStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createCrunchItStore();
  };
  return <CrunchItStoreContext.Provider value={storeRef.current}>{children}</CrunchItStoreContext.Provider>;
};

export const useCrunchItStore = <T,>(selector: (store: CrunchItStore) => T) => {
  const crunchItStoreContext = useContext(CrunchItStoreContext);

  if (!crunchItStoreContext) {
    throw new Error(`useCrunchItStore must be used within CrunchItStoreProvider`);
  }

  return useStore(crunchItStoreContext, selector);
};

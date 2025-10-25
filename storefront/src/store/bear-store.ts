import { createStore } from "zustand/vanilla";

export type CrunchItState = {
  files: ArrayBuffer[];
};

export type CrunchItActions = {
  setFiles: (file: ArrayBuffer) => void;
};

export type CrunchItStore = CrunchItState & CrunchItActions;

export const defaultCrunchItState: CrunchItState = {
  files: [],
};

export const createCrunchItStore = (initState: CrunchItState = defaultCrunchItState) => {
  return createStore<CrunchItStore>((set) => ({
    ...initState,
    setFiles: (file: ArrayBuffer) => set((state) => ({ files: state.files.concat(file) })),
  }));
};

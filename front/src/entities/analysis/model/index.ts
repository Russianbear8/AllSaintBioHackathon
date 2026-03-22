export * from "./schemas";
import { createStore } from "effector";
import { AnalysisData } from "./schemas";

export const $analysis = createStore<AnalysisData | null>(null, {
  name: "rection table elements store",
});

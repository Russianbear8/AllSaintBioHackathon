export * from "./schemas";
import { createEffect, createEvent, sample } from "effector";
import { requestAnalysis } from "../api";

import axios from "axios";
import { notification } from "antd";
import { getI18n } from "react-i18next";
import { $analysis } from "@/entities/analysis";
import { UploadFormOutput } from "./schemas";

export const fetchAnalysis = createEvent<UploadFormOutput>({
  name: "fetch analysis",
});

export const fetchAnalysisFx = createEffect({
  name: "fetch analysis fx",
  handler: requestAnalysis,
});

sample({
  clock: fetchAnalysis,
  source: fetchAnalysisFx.inFlight,
  filter: (inFlight) => inFlight == 0,
  fn: (_, props) => props,
  target: fetchAnalysisFx,
});

fetchAnalysisFx.failData.watch((error: Error) => {
  console.log(error);
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 400) {
      notification.error({
        title: getI18n().t("mainApp.notification.fileSubmitError"),
        duration: 5,
      });
    }
    if (error.response?.status === 500) {
      notification.error({
        title: getI18n().t("mainApp.notification.serverError"),
        duration: 5,
      });
    }
  }
});

$analysis.on(fetchAnalysisFx.doneData, (_, res) => {
  return res;
});

import { httpClient } from "@/shared";
import { UploadFormOutput } from "../model";
import { AnalysisData, AnalysisDataSchema } from "@/entities/analysis";

export const requestAnalysis = async (
  props: UploadFormOutput,
): Promise<AnalysisData> => {
  const formData = new FormData();
  formData.append("biomass_start", String(props.biomass_start));
  formData.append("xmlCarvme", String(props.xmlCarvme));
  formData.append("hours", String(props.hours));
  if (props.genome_name) {
    formData.append("genome_name", String(props.genome_name));
  }
  if (props.EX_glc__D_e) {
    formData.append("EX_glc__D_e", String(props.EX_glc__D_e));
  }

  if (props.EX_nh4_e) {
    formData.append("EX_nh4_e", String(props.EX_nh4_e));
  }

  if (props.EX_pi_e) {
    formData.append("EX_pi_e", String(props.EX_pi_e));
  }

  if (props.EX_o2_e) {
    formData.append("EX_o2_e", String(props.EX_o2_e));
  }

  if (props.EX_so4_e) {
    formData.append("EX_so4_e", String(props.EX_so4_e));
  }

  if (props.EX_h2o_e) {
    formData.append("EX_h2o_e", String(props.EX_h2o_e));
  }

  if (props.EX_h_e) {
    formData.append("EX_h_e", String(props.EX_h_e));
  }

  if (props.EX_k_e) {
    formData.append("EX_k_e", String(props.EX_k_e));
  }

  if (props.EX_na1_e) {
    formData.append("EX_na1_e", String(props.EX_na1_e));
  }

  if (props.EX_mg2_e) {
    formData.append("EX_mg2_e", String(props.EX_mg2_e));
  }

  if (props.EX_ca2_e) {
    formData.append("EX_ca2_e", String(props.EX_ca2_e));
  }
  if (props.zip) formData.append("zip", props.zip);
  const { data } = await httpClient.post("/upload-zip", formData);

  return await AnalysisDataSchema.parseAsync(data);
};

import { TFunction } from "i18next";
import { z } from "zod";

export const UploadPropsSchema = (t: TFunction) => {
  return z
    .object({
      biomass_start: z
        .number({ message: t("mainApp.errors.requiredField") })
        .nullable()
        .refine((v) => v != null, {
          message: t("mainApp.errors.requiredField"),
        }),
      hours: z
        .number({ message: t("mainApp.errors.requiredField") })
        .nullable()
        .refine((v) => v != null, {
          message: t("mainApp.errors.requiredField"),
        }),
      zip: z
        .instanceof(File, {
          message: t("mainApp.pages.features.uploadFile.selectError"),
        })
        .refine((file) => !!file && file.name.toLowerCase().endsWith(".zip"), {
          message: t("mainApp.pages.features.uploadFile.selectError"),
        })
        .nullable()
        .refine((val) => !!val, {
          message: t("mainApp.pages.features.uploadFile.selectError"),
        }),
      xmlCarvme: z.boolean(),
      genome_name: z
        .string({ message: t("mainApp.errors.requiredField") })
        .nullable(),
      EX_glc__D_e: z.number().nullable(),
      EX_nh4_e: z.number().nullable(),
      EX_pi_e: z.number().nullable(),
      EX_o2_e: z.number().nullable(),
      EX_so4_e: z.number().nullable(),
      EX_h2o_e: z.number().nullable(),
      EX_h_e: z.number().nullable(),
      EX_k_e: z.number().nullable(),
      EX_na1_e: z.number().nullable(),
      EX_mg2_e: z.number().nullable(),
      EX_ca2_e: z.number().nullable(),
    })
    .superRefine((data, ctx) => {
      if (!data.xmlCarvme && !data.genome_name) {
        ctx.addIssue({
          path: ["genome_name"],
          code: "custom",
          message: t("mainApp.errors.requiredField"),
        });
      }
    });
};

export type UploadFormInput = z.input<ReturnType<typeof UploadPropsSchema>>;
export type UploadFormOutput = z.output<ReturnType<typeof UploadPropsSchema>>;

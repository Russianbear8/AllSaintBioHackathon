import z from "zod";

export const biomassSchema = z.object({
  t: z.array(z.number().transform((v) => v.toFixed(2))),
  biomass: z.array(z.number()),
});

export const mediumsSchema = z
  .object({
    time_h: z.array(z.number().transform((v) => Number(v.toFixed(2)))),
  })
  .catchall(z.array(z.number()));

export const AnalysisDataSchema = z.object({
  mediums: mediumsSchema,
  biomass: biomassSchema,
});

export type AnalysisData = z.infer<typeof AnalysisDataSchema>;

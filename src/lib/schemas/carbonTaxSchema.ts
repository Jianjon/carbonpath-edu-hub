
import * as z from 'zod';

export const carbonTaxFormSchema = z.object({
  annualEmissions: z.coerce.number().min(0, "年排放量不能為負數").default(50000),
  isHighLeakageRisk: z.boolean().default(false),
});

export type CarbonTaxFormValues = z.infer<typeof carbonTaxFormSchema>;

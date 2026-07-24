import { z } from "zod";

export const withdrawalAmountSchema = z.object({
  amount: z.coerce.number().positive(),
});
export type WithdrawalAmountValues = z.infer<typeof withdrawalAmountSchema>;

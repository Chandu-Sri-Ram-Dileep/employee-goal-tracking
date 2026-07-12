import { z } from "zod";
export const goalSchema = z.object({
  goals: z
    .array(
      z.object({
        title: z.string().min(3),
        description: z.string().min(5),
        thrustArea: z.string().min(1),
        uom: z.string(),
        target: z.string().min(1),
        weightage: z.number().min(10),
      })
    )
    .max(8, "Maximum 8 goals allowed"),
});
export type GoalFormData = z.infer<typeof goalSchema>;
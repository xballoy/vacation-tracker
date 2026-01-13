import { z } from "zod";

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

export const projectResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;

export const timeEntrySchema = z.object({
  description: z.string(),
  timeInterval: z.object({
    start: z.string(),
    end: z.string(),
    duration: z.number(),
  }),
  projectId: z.string().nullable(),
  projectName: z.string().nullable(),
});

export type TimeEntry = z.infer<typeof timeEntrySchema>;

export const detailedReportResponseSchema = z.object({
  timeentries: z.array(timeEntrySchema),
  totals: z
    .array(
      z.object({
        totalTime: z.number(),
        entriesCount: z.number(),
      })
    )
    .nullable(),
});

export type DetailedReportResponse = z.infer<typeof detailedReportResponseSchema>;

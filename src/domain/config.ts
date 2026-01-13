import { z } from 'zod';

export const configSchema = z.object({
  clockifyApiKey: z.string().min(1),
  clockifyWorkspaceId: z.string().min(1),
  congeMobileDays: z.coerce.number().int().positive(),
  vacancesDays: z.coerce.number().int().positive(),
  vacancesBankCad: z.coerce.number().nonnegative(),
  hourlyRateCad: z.coerce.number().positive(),
  congeMobileProjectName: z.string().default('Congé mobile'),
  vacancesProjectName: z.string().default('Vacances'),
  verbose: z.coerce.boolean().default(false),
});

export type Config = z.infer<typeof configSchema>;

export const loadConfigFromEnv = (): Config =>
  configSchema.parse({
    clockifyApiKey: process.env['CLOCKIFY_API_KEY'],
    clockifyWorkspaceId: process.env['CLOCKIFY_WORKSPACE_ID'],
    congeMobileDays: process.env['CONGE_MOBILE_DAYS'],
    vacancesDays: process.env['VACANCES_DAYS'],
    vacancesBankCad: process.env['VACANCES_BANK_CAD'],
    hourlyRateCad: process.env['HOURLY_RATE_CAD'],
    congeMobileProjectName: process.env['CONGE_MOBILE_PROJECT_NAME'],
    vacancesProjectName: process.env['VACANCES_PROJECT_NAME'],
    verbose: process.env['VERBOSE'],
  });

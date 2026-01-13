import 'dotenv/config';
import { ZodError } from 'zod';
import { loadConfigFromEnv } from './domain/config.ts';
import { calculateVacationSummary } from './domain/vacation.ts';
import {
  convertTimeEntries,
  findVacationProjects,
} from './infrastructure/clockify/adapter.ts';
import { ClockifyClient } from './infrastructure/clockify/client.ts';
import { formatOutput, parseCliArgs } from './presentation/cli.ts';

const main = async (): Promise<void> => {
  const cliArgs = parseCliArgs();
  const config = loadConfigFromEnv();

  const verbose = cliArgs.verbose || config.verbose;

  const client = new ClockifyClient({
    apiKey: config.clockifyApiKey,
    verbose,
  });

  const user = await client.getCurrentUser();
  const projects = await client.getProjects(config.clockifyWorkspaceId);

  const { congeMobileId, vacancesId } = findVacationProjects({
    projects,
    congeMobileProjectName: config.congeMobileProjectName,
    vacancesProjectName: config.vacancesProjectName,
  });

  if (congeMobileId === null && vacancesId === null) {
    console.error(
      `Error: Could not find '${config.congeMobileProjectName}' or '${config.vacancesProjectName}' projects in Clockify`,
    );
    process.exit(1);
  }

  const projectIds = [congeMobileId, vacancesId].filter(
    (id): id is string => id !== null,
  );

  const startDate = new Date(cliArgs.year, 0, 1);
  const endDate = new Date(cliArgs.year, 11, 31, 23, 59, 59);

  const timeEntries = await client.getDetailedReport({
    workspaceId: config.clockifyWorkspaceId,
    userId: user.id,
    projectIds,
    startDate,
    endDate,
  });

  const vacationEntries = convertTimeEntries({
    entries: timeEntries,
    congeMobileProjectId: congeMobileId,
    vacancesProjectId: vacancesId,
  });

  const summary = calculateVacationSummary({
    entries: vacationEntries,
    congeMobileAllocation: config.congeMobileDays,
    vacancesAllocation: config.vacancesDays,
    vacancesBankCad: config.vacancesBankCad,
    hourlyRate: config.hourlyRateCad,
    year: cliArgs.year,
  });

  const output = formatOutput({
    year: cliArgs.year,
    config,
    summary,
  });
  console.log(output);
};

main().catch((error: unknown) => {
  if (error instanceof ZodError) {
    console.error('Configuration error:');
    for (const issue of error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  console.error('An unexpected error occurred');
  process.exit(1);
});

import "dotenv/config";
import { ZodError } from "zod";
import { loadConfigFromEnv } from "./domain/config.js";
import { calculateVacationSummary } from "./domain/vacation.js";
import { ClockifyClient } from "./infrastructure/clockify/client.js";
import {
  findVacationProjects,
  convertTimeEntries,
} from "./infrastructure/clockify/adapter.js";
import { parseCliArgs, formatOutput } from "./presentation/cli.js";

async function main(): Promise<void> {
  const { year } = parseCliArgs();
  const config = loadConfigFromEnv();

  const client = new ClockifyClient(config.clockifyApiKey);

  const user = await client.getCurrentUser();
  const projects = await client.getProjects(config.clockifyWorkspaceId);

  const { congeMobileId, vacancesId } = findVacationProjects(projects);

  if (congeMobileId === null && vacancesId === null) {
    console.error(
      "Error: Could not find 'Congé mobile' or 'Vacances' projects in Clockify"
    );
    process.exit(1);
  }

  const projectIds = [congeMobileId, vacancesId].filter(
    (id): id is string => id !== null
  );

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const timeEntries = await client.getDetailedReport(
    config.clockifyWorkspaceId,
    user.id,
    projectIds,
    startDate,
    endDate
  );

  const vacationEntries = convertTimeEntries(
    timeEntries,
    congeMobileId,
    vacancesId
  );

  const summary = calculateVacationSummary(
    vacationEntries,
    config.congeMobileDays,
    config.vacancesDays,
    config.vacancesBankCad,
    config.hourlyRateCad,
    year
  );

  const output = formatOutput(year, config, summary);
  console.log(output);
}

main().catch((error: unknown) => {
  if (error instanceof ZodError) {
    console.error("Configuration error:");
    for (const issue of error.issues) {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  console.error("An unexpected error occurred");
  process.exit(1);
});

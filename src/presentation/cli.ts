import { parseArgs } from "node:util";
import type { Config } from "../domain/config.js";
import {
  type VacationSummary,
  bankCadToHours,
  bankCadToDays,
  WORK_DAY_HOURS,
} from "../domain/vacation.js";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function parseCliArgs(): { year: number } {
  const { values } = parseArgs({
    options: {
      year: {
        type: "string",
        short: "y",
      },
    },
  });

  const year = values.year ? parseInt(values.year, 10) : new Date().getFullYear();

  if (isNaN(year)) {
    throw new Error("Invalid year provided");
  }

  return { year };
}

function formatHoursAndDays(hours: number): string {
  const days = hours / WORK_DAY_HOURS;
  return `${hours.toFixed(2)}h (${days.toFixed(2)}d)`;
}

function formatDays(days: number): string {
  return days.toFixed(2);
}

export function formatConfiguration(config: Config): string {
  const bankHours = bankCadToHours(config.vacancesBankCad, config.hourlyRateCad);
  const bankDays = bankCadToDays(config.vacancesBankCad, config.hourlyRateCad);
  const totalVacances = config.vacancesDays + bankDays;

  const lines = [
    "Configuration:",
    `  Congé mobile allocation: ${config.congeMobileDays} days`,
    `  Vacances allocation: ${config.vacancesDays} days`,
    `  Vacances bank: ${config.vacancesBankCad} CAD (${formatDays(bankHours)}h / ${formatDays(bankDays)} days @ ${config.hourlyRateCad} CAD/h)`,
    `  Total vacances available: ${formatDays(totalVacances)} days`,
  ];

  return lines.join("\n");
}

export function formatMonthlyTable(summary: VacationSummary): string {
  const colWidths = {
    month: 9,
    congeMobile: 16,
    vacances: 16,
  };

  const horizontalLine = (left: string, mid: string, right: string, fill: string) =>
    left +
    fill.repeat(colWidths.month + 2) +
    mid +
    fill.repeat(colWidths.congeMobile + 2) +
    mid +
    fill.repeat(colWidths.vacances + 2) +
    right;

  const row = (month: string, congeMobile: string, vacances: string) =>
    "│ " +
    month.padEnd(colWidths.month) +
    " │ " +
    congeMobile.padEnd(colWidths.congeMobile) +
    " │ " +
    vacances.padEnd(colWidths.vacances) +
    " │";

  const lines = [
    "Monthly Breakdown:",
    horizontalLine("┌", "┬", "┐", "─"),
    row("Month", "Congé mobile", "Vacances"),
    horizontalLine("├", "┼", "┤", "─"),
  ];

  for (const breakdown of summary.monthlyBreakdown) {
    const monthName = MONTHS[breakdown.month - 1] ?? "";
    lines.push(
      row(
        monthName,
        formatHoursAndDays(breakdown.congeMobileHours),
        formatHoursAndDays(breakdown.vacancesHours)
      )
    );
  }

  lines.push(horizontalLine("└", "┴", "┘", "─"));

  return lines.join("\n");
}

export function formatSummary(summary: VacationSummary): string {
  const { congeMobile, vacances } = summary;

  const lines = [
    "Summary:",
    `  Congé mobile: ${formatDays(congeMobile.remaining)}/${formatDays(congeMobile.allocated)} days remaining (${formatDays(congeMobile.used)} used)`,
    `  Vacances: ${formatDays(vacances.remaining)}/${formatDays(vacances.totalAvailable)} days remaining (${formatDays(vacances.used)} used)`,
  ];

  return lines.join("\n");
}

export function formatOutput(
  year: number,
  config: Config,
  summary: VacationSummary
): string {
  const sections = [
    `Vacation Tracker - ${year}`,
    "",
    formatConfiguration(config),
    "",
    formatMonthlyTable(summary),
    "",
    formatSummary(summary),
  ];

  return sections.join("\n");
}

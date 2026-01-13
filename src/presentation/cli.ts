import { parseArgs } from 'node:util';
import type { Config } from '../domain/config.ts';
import {
  type BankConversionParams,
  bankCadToDays,
  bankCadToHours,
  type VacationSummary,
  WORK_DAY_HOURS,
} from '../domain/vacation.ts';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export type CliArgs = {
  year: number;
  verbose: boolean;
};

export const parseCliArgs = (): CliArgs => {
  const { values } = parseArgs({
    options: {
      year: {
        type: 'string',
        short: 'y',
      },
      verbose: {
        type: 'boolean',
        short: 'v',
        default: false,
      },
    },
    allowPositionals: true,
  });

  const year = values.year
    ? parseInt(values.year, 10)
    : new Date().getFullYear();

  if (Number.isNaN(year)) {
    throw new Error('Invalid year provided');
  }

  return { year, verbose: values.verbose ?? false };
};

const formatHoursAndDays = (hours: number): string => {
  const days = hours / WORK_DAY_HOURS;
  return `${hours.toFixed(2)}h (${days.toFixed(2)}d)`;
};

const formatDays = (days: number): string => days.toFixed(2);

export const formatConfiguration = (config: Config): string => {
  const bankParams: BankConversionParams = {
    bankCad: config.vacancesBankCad,
    hourlyRate: config.hourlyRateCad,
  };
  const bankHours = bankCadToHours(bankParams);
  const bankDays = bankCadToDays(bankParams);
  const totalVacances = config.vacancesDays + bankDays;

  const lines = [
    'Configuration:',
    `  Congé mobile allocation: ${config.congeMobileDays} days`,
    `  Vacances allocation: ${config.vacancesDays} days`,
    `  Vacances bank: ${config.vacancesBankCad} CAD (${formatDays(bankHours)}h / ${formatDays(bankDays)} days @ ${config.hourlyRateCad} CAD/h)`,
    `  Total vacances available: ${formatDays(totalVacances)} days`,
  ];

  return lines.join('\n');
};

export const formatMonthlyTable = (summary: VacationSummary): string => {
  const colWidths = {
    month: 9,
    congeMobile: 16,
    vacances: 16,
  };

  const horizontalLine = (
    left: string,
    mid: string,
    right: string,
    fill: string,
  ) =>
    left +
    fill.repeat(colWidths.month + 2) +
    mid +
    fill.repeat(colWidths.congeMobile + 2) +
    mid +
    fill.repeat(colWidths.vacances + 2) +
    right;

  const row = (month: string, congeMobile: string, vacances: string) =>
    '│ ' +
    month.padEnd(colWidths.month) +
    ' │ ' +
    congeMobile.padEnd(colWidths.congeMobile) +
    ' │ ' +
    vacances.padEnd(colWidths.vacances) +
    ' │';

  const lines = [
    'Monthly Breakdown:',
    horizontalLine('┌', '┬', '┐', '─'),
    row('Month', 'Congé mobile', 'Vacances'),
    horizontalLine('├', '┼', '┤', '─'),
  ];

  for (const breakdown of summary.monthlyBreakdown) {
    const monthName = MONTHS[breakdown.month - 1] ?? '';
    lines.push(
      row(
        monthName,
        formatHoursAndDays(breakdown.congeMobileHours),
        formatHoursAndDays(breakdown.vacancesHours),
      ),
    );
  }

  lines.push(horizontalLine('└', '┴', '┘', '─'));

  return lines.join('\n');
};

export const formatSummary = (summary: VacationSummary): string => {
  const { congeMobile, vacances } = summary;

  const lines = [
    'Summary:',
    `  Congé mobile: ${formatDays(congeMobile.remaining)}/${formatDays(congeMobile.allocated)} days remaining (${formatDays(congeMobile.used)} used)`,
    `  Vacances: ${formatDays(vacances.remaining)}/${formatDays(vacances.totalAvailable)} days remaining (${formatDays(vacances.used)} used)`,
  ];

  return lines.join('\n');
};

export type FormatOutputParams = {
  year: number;
  config: Config;
  summary: VacationSummary;
};

export const formatOutput = ({
  year,
  config,
  summary,
}: FormatOutputParams): string => {
  const sections = [
    `Vacation Tracker - ${year}`,
    '',
    formatConfiguration(config),
    '',
    formatMonthlyTable(summary),
    '',
    formatSummary(summary),
  ];

  return sections.join('\n');
};

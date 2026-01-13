export const WORK_DAY_HOURS = 7.5;

export type VacationType = "conge_mobile" | "vacances";

export interface VacationEntry {
  date: Date;
  type: VacationType;
  hours: number;
  description: string;
}

export interface MonthlyBreakdown {
  month: number;
  congeMobileHours: number;
  vacancesHours: number;
}

export interface VacationSummary {
  year: number;
  congeMobile: {
    allocated: number;
    used: number;
    remaining: number;
  };
  vacances: {
    allocated: number;
    bankDays: number;
    totalAvailable: number;
    used: number;
    remaining: number;
  };
  monthlyBreakdown: MonthlyBreakdown[];
}

export function hoursToDays(hours: number): number {
  return hours / WORK_DAY_HOURS;
}

export function daysToHours(days: number): number {
  return days * WORK_DAY_HOURS;
}

export function bankCadToHours(bankCad: number, hourlyRate: number): number {
  return bankCad / hourlyRate;
}

export function bankCadToDays(bankCad: number, hourlyRate: number): number {
  return hoursToDays(bankCadToHours(bankCad, hourlyRate));
}

export function calculateVacationSummary(
  entries: VacationEntry[],
  congeMobileAllocation: number,
  vacancesAllocation: number,
  vacancesBankCad: number,
  hourlyRate: number,
  year: number
): VacationSummary {
  const yearEntries = entries.filter(
    (e) => e.date.getFullYear() === year
  );

  const congeMobileUsedHours = yearEntries
    .filter((e) => e.type === "conge_mobile")
    .reduce((sum, e) => sum + e.hours, 0);

  const vacancesUsedHours = yearEntries
    .filter((e) => e.type === "vacances")
    .reduce((sum, e) => sum + e.hours, 0);

  const bankDays = bankCadToDays(vacancesBankCad, hourlyRate);
  const totalVacancesAvailable = vacancesAllocation + bankDays;

  const monthlyBreakdown: MonthlyBreakdown[] = Array.from(
    { length: 12 },
    (_, i) => {
      const month = i + 1;
      const monthEntries = yearEntries.filter(
        (e) => e.date.getMonth() + 1 === month
      );
      return {
        month,
        congeMobileHours: monthEntries
          .filter((e) => e.type === "conge_mobile")
          .reduce((sum, e) => sum + e.hours, 0),
        vacancesHours: monthEntries
          .filter((e) => e.type === "vacances")
          .reduce((sum, e) => sum + e.hours, 0),
      };
    }
  );

  return {
    year,
    congeMobile: {
      allocated: congeMobileAllocation,
      used: hoursToDays(congeMobileUsedHours),
      remaining: congeMobileAllocation - hoursToDays(congeMobileUsedHours),
    },
    vacances: {
      allocated: vacancesAllocation,
      bankDays,
      totalAvailable: totalVacancesAvailable,
      used: hoursToDays(vacancesUsedHours),
      remaining: totalVacancesAvailable - hoursToDays(vacancesUsedHours),
    },
    monthlyBreakdown,
  };
}

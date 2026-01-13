export const WORK_DAY_HOURS = 7.5;

export type VacationType = "conge_mobile" | "vacances";

export type VacationEntry = {
  date: Date;
  type: VacationType;
  hours: number;
  description: string;
};

export type MonthlyBreakdown = {
  month: number;
  congeMobileHours: number;
  vacancesHours: number;
};

export type VacationSummary = {
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
};

export const hoursToDays = (hours: number): number => hours / WORK_DAY_HOURS;

export const daysToHours = (days: number): number => days * WORK_DAY_HOURS;

export type BankConversionParams = {
  bankCad: number;
  hourlyRate: number;
};

export const bankCadToHours = ({
  bankCad,
  hourlyRate,
}: BankConversionParams): number => bankCad / hourlyRate;

export const bankCadToDays = (params: BankConversionParams): number =>
  hoursToDays(bankCadToHours(params));

export type CalculateVacationSummaryParams = {
  entries: VacationEntry[];
  congeMobileAllocation: number;
  vacancesAllocation: number;
  vacancesBankCad: number;
  hourlyRate: number;
  year: number;
};

export const calculateVacationSummary = ({
  entries,
  congeMobileAllocation,
  vacancesAllocation,
  vacancesBankCad,
  hourlyRate,
  year,
}: CalculateVacationSummaryParams): VacationSummary => {
  const yearEntries = entries.filter((e) => e.date.getFullYear() === year);

  const congeMobileUsedHours = yearEntries
    .filter((e) => e.type === "conge_mobile")
    .reduce((sum, e) => sum + e.hours, 0);

  const vacancesUsedHours = yearEntries
    .filter((e) => e.type === "vacances")
    .reduce((sum, e) => sum + e.hours, 0);

  const bankDays = bankCadToDays({ bankCad: vacancesBankCad, hourlyRate });
  const totalVacancesAvailable = vacancesAllocation + bankDays;

  const monthlyBreakdown: MonthlyBreakdown[] = Array.from(
    { length: 12 },
    (_, i) => {
      const month = i + 1;
      const monthEntries = yearEntries.filter(
        (e) => e.date.getMonth() + 1 === month,
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
    },
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
};

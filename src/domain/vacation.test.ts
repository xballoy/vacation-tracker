import { describe, expect, it } from "vitest";
import {
  bankCadToDays,
  bankCadToHours,
  calculateVacationSummary,
  daysToHours,
  hoursToDays,
  type VacationEntry,
  WORK_DAY_HOURS,
} from "./vacation.ts";

describe("WORK_DAY_HOURS", () => {
  it("should be 7.5", () => {
    expect(WORK_DAY_HOURS).toBe(7.5);
  });
});

describe("hoursToDays", () => {
  it("should convert hours to days", () => {
    expect(hoursToDays(7.5)).toBe(1);
    expect(hoursToDays(15)).toBe(2);
    expect(hoursToDays(0)).toBe(0);
  });

  it("should handle fractional days", () => {
    expect(hoursToDays(3.75)).toBe(0.5);
  });
});

describe("daysToHours", () => {
  it("should convert days to hours", () => {
    expect(daysToHours(1)).toBe(7.5);
    expect(daysToHours(2)).toBe(15);
    expect(daysToHours(0)).toBe(0);
  });

  it("should handle fractional days", () => {
    expect(daysToHours(0.5)).toBe(3.75);
  });
});

describe("bankCadToHours", () => {
  it("should convert CAD bank to hours", () => {
    expect(bankCadToHours({ bankCad: 600, hourlyRate: 60 })).toBe(10);
    expect(bankCadToHours({ bankCad: 0, hourlyRate: 60 })).toBe(0);
  });

  it("should handle different hourly rates", () => {
    expect(bankCadToHours({ bankCad: 1000, hourlyRate: 100 })).toBe(10);
    expect(bankCadToHours({ bankCad: 1000, hourlyRate: 50 })).toBe(20);
  });
});

describe("bankCadToDays", () => {
  it("should convert CAD bank to days", () => {
    expect(bankCadToDays({ bankCad: 450, hourlyRate: 60 })).toBe(1);
    expect(bankCadToDays({ bankCad: 900, hourlyRate: 60 })).toBe(2);
  });
});

describe("calculateVacationSummary", () => {
  const createEntry = (
    date: Date,
    type: "conge_mobile" | "vacances",
    hours: number,
  ): VacationEntry => ({
    date,
    type,
    hours,
    description: "test",
  });

  it("should return empty summary when no entries", () => {
    const summary = calculateVacationSummary({
      entries: [],
      congeMobileAllocation: 3,
      vacancesAllocation: 25,
      vacancesBankCad: 0,
      hourlyRate: 60,
      year: 2025,
    });

    expect(summary.year).toBe(2025);
    expect(summary.congeMobile.allocated).toBe(3);
    expect(summary.congeMobile.used).toBe(0);
    expect(summary.congeMobile.remaining).toBe(3);
    expect(summary.vacances.allocated).toBe(25);
    expect(summary.vacances.used).toBe(0);
    expect(summary.vacances.remaining).toBe(25);
  });

  it("should calculate used and remaining days correctly", () => {
    const entries: VacationEntry[] = [
      createEntry(new Date(2025, 0, 15), "conge_mobile", 7.5),
      createEntry(new Date(2025, 1, 10), "vacances", 15),
    ];

    const summary = calculateVacationSummary({
      entries,
      congeMobileAllocation: 3,
      vacancesAllocation: 25,
      vacancesBankCad: 0,
      hourlyRate: 60,
      year: 2025,
    });

    expect(summary.congeMobile.used).toBe(1);
    expect(summary.congeMobile.remaining).toBe(2);
    expect(summary.vacances.used).toBe(2);
    expect(summary.vacances.remaining).toBe(23);
  });

  it("should include bank days in total available", () => {
    const summary = calculateVacationSummary({
      entries: [],
      congeMobileAllocation: 3,
      vacancesAllocation: 25,
      vacancesBankCad: 450,
      hourlyRate: 60,
      year: 2025,
    });

    expect(summary.vacances.bankDays).toBe(1);
    expect(summary.vacances.totalAvailable).toBe(26);
    expect(summary.vacances.remaining).toBe(26);
  });

  it("should filter entries by year", () => {
    const entries: VacationEntry[] = [
      createEntry(new Date(2024, 5, 15), "vacances", 7.5),
      createEntry(new Date(2025, 5, 15), "vacances", 7.5),
      createEntry(new Date(2026, 5, 15), "vacances", 7.5),
    ];

    const summary = calculateVacationSummary({
      entries,
      congeMobileAllocation: 3,
      vacancesAllocation: 25,
      vacancesBankCad: 0,
      hourlyRate: 60,
      year: 2025,
    });

    expect(summary.vacances.used).toBe(1);
  });

  it("should calculate monthly breakdown correctly", () => {
    const entries: VacationEntry[] = [
      createEntry(new Date(2025, 0, 15), "vacances", 7.5),
      createEntry(new Date(2025, 0, 16), "vacances", 7.5),
      createEntry(new Date(2025, 5, 10), "conge_mobile", 7.5),
    ];

    const summary = calculateVacationSummary({
      entries,
      congeMobileAllocation: 3,
      vacancesAllocation: 25,
      vacancesBankCad: 0,
      hourlyRate: 60,
      year: 2025,
    });

    expect(summary.monthlyBreakdown[0]?.vacancesHours).toBe(15);
    expect(summary.monthlyBreakdown[0]?.congeMobileHours).toBe(0);
    expect(summary.monthlyBreakdown[5]?.congeMobileHours).toBe(7.5);
    expect(summary.monthlyBreakdown[5]?.vacancesHours).toBe(0);
  });

  it("should have 12 months in breakdown", () => {
    const summary = calculateVacationSummary({
      entries: [],
      congeMobileAllocation: 3,
      vacancesAllocation: 25,
      vacancesBankCad: 0,
      hourlyRate: 60,
      year: 2025,
    });

    expect(summary.monthlyBreakdown).toHaveLength(12);
    expect(summary.monthlyBreakdown[0]?.month).toBe(1);
    expect(summary.monthlyBreakdown[11]?.month).toBe(12);
  });
});

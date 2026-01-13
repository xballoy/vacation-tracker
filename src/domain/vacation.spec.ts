import { describe, expect, it } from 'vitest';
import {
  bankCadToDays,
  bankCadToHours,
  calculateVacationSummary,
  hoursToDays,
  type VacationEntry,
  WORK_DAY_HOURS,
} from './vacation.ts';

describe('hoursToDays', () => {
  it.each([
    { hours: 0, expected: 0 },
    { hours: WORK_DAY_HOURS, expected: 1 },
    { hours: WORK_DAY_HOURS * 2, expected: 2 },
    { hours: WORK_DAY_HOURS / 2, expected: 0.5 },
  ])('converts $hours hours to $expected days', ({ hours, expected }) => {
    expect(hoursToDays(hours)).toBe(expected);
  });
});

describe('bankCadToHours', () => {
  it.each([
    { bankCad: 0, hourlyRate: 60, expected: 0 },
    { bankCad: 600, hourlyRate: 60, expected: 10 },
    { bankCad: 1000, hourlyRate: 100, expected: 10 },
    { bankCad: 1000, hourlyRate: 50, expected: 20 },
  ])('converts $bankCad CAD at $hourlyRate/h to $expected hours', ({
    bankCad,
    hourlyRate,
    expected,
  }) => {
    expect(bankCadToHours({ bankCad, hourlyRate })).toBe(expected);
  });
});

describe('bankCadToDays', () => {
  it.each([
    { bankCad: 0, hourlyRate: 60, expected: 0 },
    { bankCad: 450, hourlyRate: 60, expected: 1 },
    { bankCad: 900, hourlyRate: 60, expected: 2 },
  ])('converts $bankCad CAD at $hourlyRate/h to $expected days', ({
    bankCad,
    hourlyRate,
    expected,
  }) => {
    expect(bankCadToDays({ bankCad, hourlyRate })).toBe(expected);
  });
});

describe('calculateVacationSummary', () => {
  const baseParams = {
    entries: [] as VacationEntry[],
    congeMobileAllocation: 3,
    vacancesAllocation: 25,
    vacancesBankCad: 0,
    hourlyRate: 60,
    year: 2025,
  };

  const createEntry = (
    month: number,
    type: 'conge_mobile' | 'vacances',
    days: number,
  ): VacationEntry => ({
    date: new Date(2025, month - 1, 15),
    type,
    hours: days * WORK_DAY_HOURS,
    description: 'test',
  });

  it('returns full allocation when no time is used', () => {
    const summary = calculateVacationSummary(baseParams);

    expect(summary.congeMobile.remaining).toBe(3);
    expect(summary.vacances.remaining).toBe(25);
  });

  it('subtracts used time from allocation', () => {
    const summary = calculateVacationSummary({
      ...baseParams,
      entries: [
        createEntry(1, 'conge_mobile', 1),
        createEntry(2, 'vacances', 2),
      ],
    });

    expect(summary.congeMobile.remaining).toBe(2);
    expect(summary.vacances.remaining).toBe(23);
  });

  it('adds bank CAD to vacation allocation', () => {
    const summary = calculateVacationSummary({
      ...baseParams,
      vacancesBankCad: 450,
    });

    expect(summary.vacances.totalAvailable).toBe(26);
    expect(summary.vacances.remaining).toBe(26);
  });

  it('only counts entries from the specified year', () => {
    const summary = calculateVacationSummary({
      ...baseParams,
      entries: [
        { ...createEntry(6, 'vacances', 1), date: new Date(2024, 5, 15) },
        createEntry(6, 'vacances', 1),
        { ...createEntry(6, 'vacances', 1), date: new Date(2026, 5, 15) },
      ],
    });

    expect(summary.vacances.used).toBe(1);
  });

  it('breaks down usage by month', () => {
    const summary = calculateVacationSummary({
      ...baseParams,
      entries: [
        createEntry(1, 'vacances', 2),
        createEntry(6, 'conge_mobile', 1),
      ],
    });

    expect(summary.monthlyBreakdown[0]?.vacancesHours).toBe(15);
    expect(summary.monthlyBreakdown[5]?.congeMobileHours).toBe(7.5);
    expect(summary.monthlyBreakdown).toHaveLength(12);
  });
});

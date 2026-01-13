import type { VacationEntry, VacationType } from "../../domain/vacation.ts";
import type { ProjectResponse, TimeEntry } from "./types.ts";

export type FindVacationProjectsParams = {
  projects: ProjectResponse[];
  congeMobileProjectName: string;
  vacancesProjectName: string;
};

export type VacationProjectIds = {
  congeMobileId: string | null;
  vacancesId: string | null;
};

export const findVacationProjects = ({
  projects,
  congeMobileProjectName,
  vacancesProjectName,
}: FindVacationProjectsParams): VacationProjectIds => {
  const congeMobile = projects.find((p) => p.name === congeMobileProjectName);
  const vacances = projects.find((p) => p.name === vacancesProjectName);

  return {
    congeMobileId: congeMobile?.id ?? null,
    vacancesId: vacances?.id ?? null,
  };
};

export type TimeEntryToVacationEntryParams = {
  entry: TimeEntry;
  congeMobileProjectId: string | null;
  vacancesProjectId: string | null;
};

export const timeEntryToVacationEntry = ({
  entry,
  congeMobileProjectId,
  vacancesProjectId,
}: TimeEntryToVacationEntryParams): VacationEntry | null => {
  let type: VacationType | null = null;

  if (entry.projectId === congeMobileProjectId) {
    type = "conge_mobile";
  } else if (entry.projectId === vacancesProjectId) {
    type = "vacances";
  }

  if (type === null) {
    return null;
  }

  const durationSeconds = entry.timeInterval.duration;
  const hours = durationSeconds / 3600;

  return {
    date: new Date(entry.timeInterval.start),
    type,
    hours,
    description: entry.description,
  };
};

export type ConvertTimeEntriesParams = {
  entries: TimeEntry[];
  congeMobileProjectId: string | null;
  vacancesProjectId: string | null;
};

export const convertTimeEntries = ({
  entries,
  congeMobileProjectId,
  vacancesProjectId,
}: ConvertTimeEntriesParams): VacationEntry[] =>
  entries
    .map((entry) =>
      timeEntryToVacationEntry({
        entry,
        congeMobileProjectId,
        vacancesProjectId,
      }),
    )
    .filter((e): e is VacationEntry => e !== null);

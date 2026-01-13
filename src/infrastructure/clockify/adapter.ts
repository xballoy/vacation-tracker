import type { VacationEntry, VacationType } from "../../domain/vacation.js";
import type { TimeEntry, ProjectResponse } from "./types.js";

const CONGE_MOBILE_PROJECT = "Congé mobile";
const VACANCES_PROJECT = "Vacances";

export function findVacationProjects(
  projects: ProjectResponse[]
): { congeMobileId: string | null; vacancesId: string | null } {
  const congeMobile = projects.find((p) => p.name === CONGE_MOBILE_PROJECT);
  const vacances = projects.find((p) => p.name === VACANCES_PROJECT);

  return {
    congeMobileId: congeMobile?.id ?? null,
    vacancesId: vacances?.id ?? null,
  };
}

export function timeEntryToVacationEntry(
  entry: TimeEntry,
  congeMobileProjectId: string | null,
  vacancesProjectId: string | null
): VacationEntry | null {
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
}

export function convertTimeEntries(
  entries: TimeEntry[],
  congeMobileProjectId: string | null,
  vacancesProjectId: string | null
): VacationEntry[] {
  return entries
    .map((e) =>
      timeEntryToVacationEntry(e, congeMobileProjectId, vacancesProjectId)
    )
    .filter((e): e is VacationEntry => e !== null);
}

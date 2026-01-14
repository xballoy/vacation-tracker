import {
  detailedReportResponseSchema,
  type ProjectResponse,
  projectResponseSchema,
  type TimeEntry,
  type UserResponse,
  userResponseSchema,
} from './types.ts';

const BASE_URL = 'https://api.clockify.me/api/v1';
const REPORTS_URL = 'https://reports.api.clockify.me/v1';
const PAGE_SIZE = 200;

export type ClockifyClientOptions = {
  apiKey: string;
  verbose?: boolean;
};

export type GetDetailedReportParams = {
  workspaceId: string;
  userId: string;
  projectIds: string[];
  startDate: Date;
  endDate: Date;
};

export class ClockifyClient {
  readonly #apiKey: string;
  readonly #verbose: boolean;

  constructor({ apiKey, verbose = false }: ClockifyClientOptions) {
    this.#apiKey = apiKey;
    this.#verbose = verbose;
  }

  #log = (message: string): void => {
    if (this.#verbose) {
      console.error(`[Clockify] ${message}`);
    }
  };

  #request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    this.#log(`${options.method ?? 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Api-Key': this.#apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Clockify API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  };

  getCurrentUser = async (): Promise<UserResponse> => {
    const data = await this.#request<unknown>(`${BASE_URL}/user`);
    return userResponseSchema.parse(data);
  };

  getProjects = async (workspaceId: string): Promise<ProjectResponse[]> => {
    const allProjects: unknown[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        page: page.toString(),
        'page-size': PAGE_SIZE.toString(),
      });

      const data = await this.#request<unknown[]>(
        `${BASE_URL}/workspaces/${workspaceId}/projects?${params}`,
      );

      allProjects.push(...data);
      this.#log(`Fetched projects page ${page}: ${data.length} projects`);

      hasMore = data.length === PAGE_SIZE;
      page++;
    }

    this.#log(`Total projects fetched: ${allProjects.length}`);

    return allProjects.map((p) => projectResponseSchema.parse(p));
  };

  getDetailedReport = async ({
    workspaceId,
    userId,
    projectIds,
    startDate,
    endDate,
  }: GetDetailedReportParams): Promise<TimeEntry[]> => {
    const allEntries: TimeEntry[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const body = {
        dateRangeStart: startDate.toISOString(),
        dateRangeEnd: endDate.toISOString(),
        detailedFilter: {
          page,
          pageSize: PAGE_SIZE,
        },
        users: {
          ids: [userId],
          contains: 'CONTAINS',
          status: 'ALL',
        },
        projects: {
          ids: projectIds,
          contains: 'CONTAINS',
          status: 'ALL',
        },
        amountShown: 'HIDE_AMOUNT',
      };

      const data = await this.#request<unknown>(
        `${REPORTS_URL}/workspaces/${workspaceId}/reports/detailed`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      );

      const parsed = detailedReportResponseSchema.parse(data);
      allEntries.push(...parsed.timeentries);
      this.#log(`Fetched page ${page}: ${parsed.timeentries.length} entries`);

      hasMore = parsed.timeentries.length === PAGE_SIZE;
      page++;
    }

    this.#log(`Total entries: ${allEntries.length}`);
    return allEntries;
  };
}

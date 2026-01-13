import {
  userResponseSchema,
  projectResponseSchema,
  detailedReportResponseSchema,
  type UserResponse,
  type ProjectResponse,
  type TimeEntry,
} from "./types.js";

const BASE_URL = "https://api.clockify.me/api/v1";
const REPORTS_URL = "https://reports.api.clockify.me/v1";
const PAGE_SIZE = 200;

export class ClockifyClient {
  constructor(private readonly apiKey: string) {}

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "X-Api-Key": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Clockify API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const data = await this.request<unknown>(`${BASE_URL}/user`);
    return userResponseSchema.parse(data);
  }

  async getProjects(workspaceId: string): Promise<ProjectResponse[]> {
    const data = await this.request<unknown[]>(
      `${BASE_URL}/workspaces/${workspaceId}/projects`
    );
    return data.map((p) => projectResponseSchema.parse(p));
  }

  async getDetailedReport(
    workspaceId: string,
    userId: string,
    projectIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<TimeEntry[]> {
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
          contains: "CONTAINS",
          status: "ALL",
        },
        projects: {
          ids: projectIds,
          contains: "CONTAINS",
          status: "ALL",
        },
      };

      const data = await this.request<unknown>(
        `${REPORTS_URL}/workspaces/${workspaceId}/reports/detailed`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      const parsed = detailedReportResponseSchema.parse(data);
      allEntries.push(...parsed.timeentries);

      hasMore = parsed.timeentries.length === PAGE_SIZE;
      page++;
    }

    return allEntries;
  }
}

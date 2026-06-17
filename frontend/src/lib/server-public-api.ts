import type {
  ActivityDetail,
  ActivityItem,
  LeaderboardItem,
  PaginationMeta,
} from "@/services/generated/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

const DEFAULT_REVALIDATE = 0;

type ApiResponse<T> = {
  data?: T;
};

type ApiListResponse<T> = {
  data?: T[];
  meta?: PaginationMeta;
};

async function fetchPublicApi<T>(
  path: string,
  revalidate = DEFAULT_REVALIDATE,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getActivitiesPage(page: number, pageSize: number) {
  return fetchPublicApi<ApiListResponse<ActivityItem>>(
    `/activities?page=${page}&pageSize=${pageSize}`,
  );
}

export async function getAllActivities(pageSize = 100): Promise<ActivityItem[]> {
  const allActivities: ActivityItem[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getActivitiesPage(page, pageSize);
    allActivities.push(...(response.data || []));
    totalPages = response.meta?.totalPages || 1;
    page += 1;
  } while (page <= totalPages);

  return allActivities;
}

export async function getActivityDetailBySlug(slug: string) {
  return fetchPublicApi<ApiResponse<ActivityDetail>>(`/activities/${slug}`);
}

export async function getLeaderboardPage(page: number, pageSize: number) {
  return fetchPublicApi<ApiListResponse<LeaderboardItem>>(
    `/leaderboard?page=${page}&pageSize=${pageSize}`,
  );
}

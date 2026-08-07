export type ApiResult<T> = { data: T; error?: never } | { data?: never; error: string };

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, { headers: { Accept: "application/json" } });

    if (!response.ok) {
      return { error: `Request failed with status ${response.status}` };
    }

    return { data: (await response.json()) as T };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown API error" };
  }
}


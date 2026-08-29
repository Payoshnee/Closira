import { cookies } from "next/headers";

export type ApiResult<T> = { data: T; error?: never } | { data?: never; error: string };

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, { headers: await apiHeaders(), cache: "no-store" });

    if (!response.ok) {
      return { error: `Request failed with status ${response.status}` };
    }

    return { data: (await response.json()) as T };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown API error" };
  }
}

export async function apiPost<T, TBody = unknown>(path: string, body: TBody): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: await apiHeaders(true),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return { error: `Request failed with status ${response.status}` };
    }

    return { data: (await response.json()) as T };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown API error" };
  }
}

export async function apiPatch<T, TBody = unknown>(path: string, body: TBody): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "PATCH",
      headers: await apiHeaders(true),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return { error: `Request failed with status ${response.status}` };
    }

    return { data: (await response.json()) as T };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown API error" };
  }
}

export async function apiDelete<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "DELETE",
      headers: await apiHeaders()
    });

    if (!response.ok) {
      return { error: `Request failed with status ${response.status}` };
    }

    return { data: (await response.json()) as T };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown API error" };
  }
}

async function apiHeaders(json = false): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return {
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(cookieHeader ? { Cookie: cookieHeader } : {})
  };
}

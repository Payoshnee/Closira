import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function POST(_request: Request, { params }: { params: Promise<{ itemId: string; imageId: string }> }) {
  const { itemId, imageId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const csrfToken = cookieStore.get("closira_csrf")?.value;

  const response = await fetch(`${apiUrl}/wardrobe/items/${itemId}/images/${imageId}/complete`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      Cookie: cookieHeader
    },
    cache: "no-store"
  });

  const payload = await response.json().catch(() => ({}));
  return NextResponse.json(payload, { status: response.status });
}

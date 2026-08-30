import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function GET(_request: Request, { params }: { params: Promise<{ itemId: string; imageId: string }> }) {
  const { itemId, imageId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(`${apiUrl}/wardrobe/items/${itemId}/images/${imageId}/read-url`, {
    headers: { Accept: "application/json", Cookie: cookieHeader },
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Image is not available." }, { status: response.status });
  }

  const payload = (await response.json()) as { url: string };
  return NextResponse.redirect(new URL(payload.url, apiUrl));
}

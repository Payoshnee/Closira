"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { WardrobeUploadUrl } from "@/types/wardrobe";

export function ImageUploadControl({ itemId }: { itemId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function upload(file: File) {
    setStatus("Preparing upload...");
    const prepareResponse = await fetch(`/api/wardrobe/items/${itemId}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        byteSize: file.size
      })
    });

    if (!prepareResponse.ok) {
      setStatus("Upload could not be prepared.");
      return;
    }

    const signed = (await prepareResponse.json()) as WardrobeUploadUrl;
    setStatus("Uploading image...");
    const result = await fetch(signed.uploadUrl, {
      method: "PUT",
      headers: signed.headers,
      body: file
    });

    if (!result.ok) {
      setStatus(`Upload failed with status ${result.status}.`);
      return;
    }

    setStatus("Image uploaded.");
    router.refresh();
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <button
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-charcoal hover:bg-ivory-100"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
        Upload image
      </button>
      {status ? <p className="mt-2 text-xs font-medium text-stone-600" role="status">{status}</p> : null}
    </div>
  );
}

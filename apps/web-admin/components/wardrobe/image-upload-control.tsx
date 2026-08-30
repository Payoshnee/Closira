"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { WardrobeUploadUrl } from "@/types/wardrobe";

export function ImageUploadControl({ itemId }: { itemId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function upload(file: File) {
    setLastFile(file);
    setIsUploading(true);
    setProgress(0);
    setStatus("Preparing upload...");
    try {
      validateFile(file);
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
      await uploadWithProgress(signed.uploadUrl, signed.headers, file, setProgress);
      setStatus("Processing image...");
      const completeResponse = await fetch(`/api/wardrobe/items/${itemId}/images/${signed.imageId}/complete`, {
        method: "POST",
        headers: { Accept: "application/json" }
      });

      if (!completeResponse.ok) {
        setStatus(`Image uploaded, but processing failed with status ${completeResponse.status}.`);
        return;
      }

      setStatus("Image uploaded and optimized.");
      setProgress(100);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
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
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
        {isUploading ? "Uploading..." : "Upload image"}
      </button>
      {isUploading || progress > 0 ? (
        <div className="mt-2 h-2 rounded-full bg-stone-100">
          <div className="h-2 rounded-full bg-rose-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {status ? <p className="mt-2 text-xs font-medium text-stone-600" role="status">{status}</p> : null}
      {status?.includes("failed") && lastFile ? (
        <button className="mt-2 text-xs font-semibold text-rose-700 underline" type="button" onClick={() => void upload(lastFile)}>
          Retry upload
        </button>
      ) : null}
    </div>
  );
}

function validateFile(file: File) {
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
  if (!allowedTypes.has(file.type)) {
    throw new Error("Choose a JPEG, PNG, WebP, HEIC, or HEIF image.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 10MB.");
  }
}

function uploadWithProgress(url: string, headers: Record<string, string>, file: File, onProgress: (value: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    for (const [key, value] of Object.entries(headers)) {
      request.setRequestHeader(key, value);
    }
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 90));
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${request.status}.`));
      }
    };
    request.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    request.send(file);
  });
}

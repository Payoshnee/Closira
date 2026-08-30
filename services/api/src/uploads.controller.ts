import { BadRequestException, Controller, Get, Header, Param, Put, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { StorageService } from "./storage/storage.service";

@Controller("uploads")
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Put("local/:storageKey")
  async uploadLocal(@Param("storageKey") encodedStorageKey: string, @Req() request: Request) {
    const storageKey = decodeURIComponent(encodedStorageKey);
    const target = this.safeLocalPath(storageKey);

    await mkdir(dirname(target), { recursive: true });
    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(target);
      request.pipe(stream);
      request.on("error", reject);
      stream.on("error", reject);
      stream.on("finish", resolve);
    });

    return { ok: true, storageKey, localPath: target };
  }

  @Get("local/:storageKey")
  @Header("Cache-Control", "private, max-age=300")
  async readLocal(@Param("storageKey") encodedStorageKey: string, @Res() response: Response) {
    const storageKey = decodeURIComponent(encodedStorageKey);
    const target = this.safeLocalPath(storageKey);

    createReadStream(target)
      .on("error", () => response.status(404).json({ message: "File not found." }))
      .pipe(response);
  }

  private safeLocalPath(storageKey: string) {
    try {
      return this.storage.localPath(storageKey);
    } catch {
      throw new BadRequestException("Invalid upload path.");
    }
  }
}

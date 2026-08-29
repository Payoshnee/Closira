import { BadRequestException, Controller, Param, Put, Req } from "@nestjs/common";
import type { Request } from "express";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";

@Controller("uploads")
export class UploadsController {
  @Put("local/:storageKey")
  async uploadLocal(@Param("storageKey") encodedStorageKey: string, @Req() request: Request) {
    const storageKey = decodeURIComponent(encodedStorageKey);
    const root = normalize(join(process.cwd(), "../../storage/local-dev-only/uploads"));
    const target = normalize(join(root, storageKey));

    if (!target.startsWith(root)) {
      throw new BadRequestException("Invalid upload path.");
    }

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
}

import type { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { PrismaService } from "./prisma.service";
export declare class TaxonomyController {
    private readonly prisma;
    private readonly auth;
    constructor(prisma: PrismaService, auth: AuthService);
    listCategories(request: Request): Promise<{
        id: string;
        name: string;
        slug: string;
        itemCount: number;
        isDefault: boolean;
        sortOrder: number;
    }[]>;
    createCategory(request: Request, body: {
        name: string;
        color?: string;
    }): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        color: string | null;
        slug: string;
        parentId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateCategory(request: Request, id: string, body: {
        name?: string;
        color?: string;
    }): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        color: string | null;
        slug: string;
        parentId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    deleteCategory(request: Request, id: string): Promise<{
        ok: boolean;
    }>;
    listTags(request: Request): Promise<{
        id: string;
        type: string;
        name: string;
        slug: string;
        itemCount: number;
        isDefault: boolean;
    }[]>;
    createTag(request: Request, body: {
        name: string;
        color?: string;
    }): import(".prisma/client").Prisma.Prisma__TagClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        color: string | null;
        slug: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateTag(request: Request, id: string, body: {
        name?: string;
        color?: string;
    }): import(".prisma/client").Prisma.Prisma__TagClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        color: string | null;
        slug: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    deleteTag(request: Request, id: string): Promise<{
        ok: boolean;
    }>;
}

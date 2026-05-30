import { PrismaService } from './prisma.service';
import type { Request, Response } from 'express';
export declare class AppController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createLink(body: {
        slug?: string;
        destination: string;
    }, req: Request): Promise<{
        id: number;
        slug: string;
        destination: string;
        shortUrl: string;
        createdAt: Date;
    }>;
    redirectLink(slug: string, req: Request, res: Response): Promise<void>;
}

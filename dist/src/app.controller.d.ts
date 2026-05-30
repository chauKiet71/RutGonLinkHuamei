import { PrismaService } from './prisma.service';
import type { Request, Response, NextFunction } from 'express';
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
    getLinks(): Promise<{
        id: number;
        slug: string;
        destination: string;
        createdAt: Date;
        clicks: number;
    }[]>;
    redirectLink(req: Request, res: Response, next: NextFunction): Promise<void>;
}

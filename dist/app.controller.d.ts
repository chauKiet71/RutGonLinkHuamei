import { PrismaService } from './prisma.service';
import type { Response } from 'express';
export declare class AppController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createLink(body: {
        slug?: string;
        destination: string;
    }): Promise<{
        id: number;
        slug: string;
        destination: string;
        createdAt: Date;
    }>;
    redirectLink(slug: string, res: Response): Promise<void>;
}

import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    return;
  }

  console.log('Connecting to Neon via WebSocket...');
  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('Connected successfully! Running migration...');

    // Run SQL to add the column 'clicks' if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Link" ADD COLUMN IF NOT EXISTS "clicks" INTEGER NOT NULL DEFAULT 0;
    `);

    console.log('Migration completed successfully: "clicks" column added.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();

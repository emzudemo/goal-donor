import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// SSL configuration - automatically enables SSL for Supabase and other cloud databases
const databaseUrl = process.env.DATABASE_URL;
const needsSSL = 
  databaseUrl.includes('supabase.co') || 
  databaseUrl.includes('aws') ||
  databaseUrl.includes('neon.tech') ||
  process.env.DATABASE_SSL === 'true' ||
  process.env.PGSSLMODE === 'require';

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: needsSSL ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });

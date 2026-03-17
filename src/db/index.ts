import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

// Allow build to succeed without DATABASE_URL (SSR page collection)
const sql = connectionString
  ? neon(connectionString)
  : neon('postgresql://placeholder:placeholder@localhost:5432/placeholder');

export const db = drizzle(sql, { schema });

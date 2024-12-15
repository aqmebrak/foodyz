import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleVercel } from 'drizzle-orm/vercel-postgres';
import postgres from 'postgres';
import { sql } from '@vercel/postgres';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const db =
	env.VERCEL_ENV === 'production' ? drizzleVercel(sql) : drizzle(postgres(env.DATABASE_URL));

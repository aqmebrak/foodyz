import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
const VERCEL_ENV = process.env.VERCEL_ENV;
const isProd = VERCEL_ENV === 'production';
dotenv.config({
	// because of that correct read of env
	path: isProd ? '.env.prod' : '.env.local'
});

// console.log('ENV', process.env);

console.log(`Loaded environment variables from ${isProd ? '.env.prod' : '.env.local'}`);
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',

	dbCredentials: {
		url: process.env.DATABASE_URL
	},
	breakpoints: true,
	verbose: true,
	strict: true,
	dialect: 'postgresql'
});

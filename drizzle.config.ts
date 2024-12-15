import { defineConfig } from 'drizzle-kit';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
import * as dotenv from 'dotenv';

const NODE_ENV = process.env.NODE_ENV;
console.log('VERCEL_ENV', NODE_ENV);
const isLocalEnv = NODE_ENV === 'development';
dotenv.config({
	// because of that correct read of env
	path: isLocalEnv ? '.env' : '.env.prod'
});
console.log(process.env.NODE_ENV);

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',

	dbCredentials: {
		url: process.env.DATABASE_URL
	},

	verbose: true,
	strict: true,
	dialect: 'postgresql'
});

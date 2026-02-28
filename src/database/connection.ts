"use server"

import { drizzle } from 'drizzle-orm/neon-http';
import { DATABASE_URL } from '~/config/database';

export const connection = drizzle(DATABASE_URL);

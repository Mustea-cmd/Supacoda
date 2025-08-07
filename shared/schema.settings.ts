import { pgTable, text, jsonb } from 'drizzle-orm/pg-core';

export const userSettings = pgTable('user_settings', {
  userId: text('user_id').primaryKey(),
  settings: jsonb('settings').notNull(),
});

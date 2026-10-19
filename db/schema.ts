import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', { id: text('id').primaryKey(), data: text('data').notNull(), revision: integer('revision').notNull().default(0) });
export const members = sqliteTable('members', { email: text('email').primaryKey(), userId: text('user_id'), role: text('role').notNull() });
export const orders = sqliteTable('orders', { id: text('id').primaryKey(), data: text('data').notNull(), createdAt: text('created_at').notNull() });

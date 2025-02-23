import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const playlist = sqliteTable('playlist', {
	id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
	title: text().notNull(),
	username: text().notNull(),
	imageUrl: text().notNull(),
	playlistUrl: text().notNull(),
	created: integer({ mode: 'timestamp_ms' }).notNull()
})

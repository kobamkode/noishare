import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const playlist = sqliteTable('playlist', {
        id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
        name: text().notNull(),
        owner: text().notNull(),
        imageUrl: text().notNull(),
        playlistId: text().notNull(),
        playlistExtUrl: text().notNull(),
        collaborative: integer({ mode: 'boolean' }).notNull(),
        created: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
})

export type SelectPlaylist = typeof playlist.$inferSelect;
export type InsertPlaylist = typeof playlist.$inferInsert;

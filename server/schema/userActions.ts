import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const userActions = sqliteTable('user_actions', {
  id: integer('id').primaryKey(),
  sessionId: text('sessionId').notNull(),
  userId: text('userId'),
  action: text('action').notNull(),
  target: text('target').notNull(),
  url: text('url').notNull(),
  userAgent: text('userAgent').notNull(),
  ip: text('ip').notNull(),
  timestamp: text('timestamp').notNull(),
  metadata: text('metadata')
})

export type UserAction = typeof userActions.$inferSelect
export type NewUserAction = typeof userActions.$inferInsert 
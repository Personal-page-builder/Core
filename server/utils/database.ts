import { drizzle } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import Database from 'better-sqlite3'
import postgres from 'postgres'

export function createDatabaseConnection() {
  const config = useRuntimeConfig()
  const dbConfig = config.database

  if (dbConfig.type === 'postgres') {
    // PostgreSQL connection
    const postgresConfig = dbConfig.postgres
    
    if (postgresConfig.url) {
      const client = postgres(postgresConfig.url)
      return { db: drizzlePostgres(client), client, type: 'postgres' }
    } else {
      const client = postgres({
        host: postgresConfig.host,
        port: postgresConfig.port,
        database: postgresConfig.database,
        username: postgresConfig.username,
        password: postgresConfig.password,
        ssl: postgresConfig.ssl
      })
      return { db: drizzlePostgres(client), client, type: 'postgres' }
    }
  } else {
    // SQLite connection (default)
    const sqlite = new Database(dbConfig.sqlite.filename)
    return { db: drizzle(sqlite), client: sqlite, type: 'sqlite' }
  }
}

// Singleton instance
let dbInstance: ReturnType<typeof createDatabaseConnection> | null = null

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = createDatabaseConnection()
  }
  return dbInstance
}

// Функция для получения SQLite клиента
export function getSQLiteClient() {
  const connection = getDatabase()
  if (connection.type === 'sqlite') {
    return connection.client
  }
  throw new Error('SQLite не настроен')
} 
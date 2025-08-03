import { getSQLiteClient } from './database'

export interface UserAction {
  id?: number
  sessionId: string
  userId?: string
  action: 'page_view' | 'image_load' | 'button_click' | 'link_click' | 'api_call'
  target: string
  url: string
  userAgent: string
  ip: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export class Logger {
  private static instance: Logger

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  async logAction(action: Omit<UserAction, 'id' | 'timestamp'>) {
    try {
      const db = getSQLiteClient()
      
      // Создаем таблицу если не существует
      await this.createLogTable()
      
      // Логируем действие
      await (db as unknown as { prepare: (sql: string) => { run: (...args: unknown[]) => void } }).prepare(`
        INSERT INTO user_actions (sessionId, userId, action, target, url, userAgent, ip, timestamp, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        action.sessionId,
        action.userId,
        action.action,
        action.target,
        action.url,
        action.userAgent,
        action.ip,
        new Date().toISOString(),
        action.metadata ? JSON.stringify(action.metadata) : null
      )

      // Выводим в консоль для разработки
      if (process.env.NODE_ENV === 'development') {
        console.log(`[LOGGER] ${action.action}: ${action.target} (${action.url})`)
      }
    } catch (error) {
      console.error('Ошибка логирования:', error)
    }
  }

  private async createLogTable() {
    const db = getSQLiteClient()
    
    await (db as unknown as { prepare: (sql: string) => { run: () => void } }).prepare(`
      CREATE TABLE IF NOT EXISTS user_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId TEXT NOT NULL,
        userId TEXT,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        url TEXT NOT NULL,
        userAgent TEXT NOT NULL,
        ip TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        metadata TEXT
      )
    `).run()
  }

  async getStats(days: number = 7) {
    const db = getSQLiteClient()
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const result = await (db as unknown as { prepare: (sql: string) => { all: (date: string) => unknown[] } }).prepare(`
      SELECT action, COUNT(*) as count
      FROM user_actions 
      WHERE timestamp >= ?
      GROUP BY action
    `).all(startDate.toISOString())
    
    return result
  }
}

export const logger = Logger.getInstance() 
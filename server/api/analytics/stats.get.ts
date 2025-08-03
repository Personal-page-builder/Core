import { getSQLiteClient } from '../../utils/database'

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig()
  
  // Используем только SQLite для демонстрации
  if (config.database.type !== 'sqlite') {
    return {
      success: false,
      error: 'Поддерживается только SQLite'
    }
  }
  
  try {
    const db = getSQLiteClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // Последние 30 дней

    // Проверяем существование таблицы
    const tableExists = await (db as unknown as { prepare: (sql: string) => { get: () => unknown } }).prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='user_actions'
    `).get()

    if (!tableExists) {
      return {
        success: true,
        data: {
          uniqueVisitors: { uniqueIPs: 0, totalActions: 0 },
          actionStats: [],
          pageViews: [],
          imageLoads: [],
          buttonClicks: [],
          linkClicks: [],
          dailyVisits: []
        }
      }
    }

    // 1. Общая посещаемость по уникальным IP
    const uniqueVisitorsResult = await (db as unknown as { prepare: (sql: string) => { get: (date: string) => unknown } }).prepare(`
      SELECT 
        COUNT(DISTINCT ip) as uniqueIPs,
        COUNT(*) as totalActions
      FROM user_actions 
      WHERE timestamp >= ?
    `).get(startDate.toISOString())

    const uniqueVisitors = {
      uniqueIPs: (uniqueVisitorsResult as Record<string, unknown>)?.uniqueIPs as number || 0,
      totalActions: (uniqueVisitorsResult as Record<string, unknown>)?.totalActions as number || 0
    }

    // 2. Статистика по действиям
    const actionStatsResult = await (db as unknown as { prepare: (sql: string) => { all: (date: string) => unknown[] } }).prepare(`
      SELECT action, COUNT(*) as count
      FROM user_actions 
      WHERE timestamp >= ?
      GROUP BY action
      ORDER BY count DESC
    `).all(startDate.toISOString())

    const actionStats = actionStatsResult || []

    // 3. Топ страниц по просмотрам
    const pageViewsResult = await (db as unknown as { prepare: (sql: string) => { all: (date: string) => unknown[] } }).prepare(`
      SELECT target as page, COUNT(*) as views
      FROM user_actions 
      WHERE action = 'page_view' AND timestamp >= ?
      GROUP BY target
      ORDER BY views DESC
      LIMIT 10
    `).all(startDate.toISOString())

    const pageViews = pageViewsResult || []

    // 4. Топ изображений
    const imageLoadsResult = await (db as unknown as { prepare: (sql: string) => { all: (date: string) => unknown[] } }).prepare(`
      SELECT target as image, COUNT(*) as loads
      FROM user_actions 
      WHERE action = 'image_load' AND timestamp >= ?
      GROUP BY target
      ORDER BY loads DESC
      LIMIT 10
    `).all(startDate.toISOString())

    const imageLoads = imageLoadsResult || []

    // 5. Топ кнопок по кликам
    const buttonClicksResult = await (db as unknown as { prepare: (sql: string) => { all: (date: string) => unknown[] } }).prepare(`
      SELECT target as button, COUNT(*) as clicks
      FROM user_actions 
      WHERE action = 'button_click' AND timestamp >= ?
      GROUP BY target
      ORDER BY clicks DESC
      LIMIT 10
    `).all(startDate.toISOString())

    const buttonClicks = buttonClicksResult || []

    // 6. Топ ссылок по кликам
    const linkClicksResult = await (db as unknown as { prepare: (sql: string) => { all: (date: string) => unknown[] } }).prepare(`
      SELECT target as link, COUNT(*) as clicks, metadata as url
      FROM user_actions 
      WHERE action = 'link_click' AND timestamp >= ?
      GROUP BY target, metadata
      ORDER BY clicks DESC
      LIMIT 10
    `).all(startDate.toISOString())

    const linkClicks = linkClicksResult || []

    // 7. Посещаемость по дням (для графика)
    const dailyVisitsResult = await (db as unknown as { prepare: (sql: string) => { all: (date: string) => unknown[] } }).prepare(`
      SELECT DATE(timestamp) as date, COUNT(*) as visits
      FROM user_actions 
      WHERE action = 'page_view' AND timestamp >= ?
      GROUP BY DATE(timestamp)
      ORDER BY date
    `).all(startDate.toISOString())

    const dailyVisits = dailyVisitsResult || []

    return {
      success: true,
      data: {
        uniqueVisitors,
        actionStats,
        pageViews,
        imageLoads,
        buttonClicks,
        linkClicks,
        dailyVisits
      }
    }
  } catch (error) {
    console.error('Ошибка получения статистики:', error)
    return {
      success: false,
      error: 'Ошибка получения статистики'
    }
  }
}) 
import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action, target, url, metadata } = body
  
  // Получаем информацию о пользователе
  const userAgent = getHeader(event, 'user-agent') || 'Unknown'
  const ip = getClientIP(event) || 'Unknown'
  const sessionId = getCookie(event, 'session-id') || generateSessionId()
  
  // Устанавливаем cookie для отслеживания сессии
  setCookie(event, 'session-id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 дней
  })

  // Логируем действие
  await logger.logAction({
    sessionId,
    action,
    target,
    url,
    userAgent,
    ip,
    metadata
  })

  return { success: true }
})

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function getClientIP(event: Parameters<typeof getHeader>[0]): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  const cfConnectingIP = getHeader(event, 'cf-connecting-ip')
  
  return cfConnectingIP || realIP || forwarded?.split(',')[0] || 'Unknown'
} 
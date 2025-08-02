# Настройка базы данных

## По умолчанию используется SQLite

Приложение настроено для работы с SQLite по умолчанию. Для переключения на PostgreSQL необходимо явно указать переменную окружения.

## Переменные окружения

Создайте файл `.env` в корне проекта:

### SQLite (по умолчанию)
```env
# SQLite используется автоматически, если DATABASE_TYPE не указан
# DATABASE_TYPE=sqlite
SQLITE_FILENAME=./content.db
```

### PostgreSQL (опционально)
```env
DATABASE_TYPE=postgres
POSTGRES_URL=postgresql://username:password@localhost:5432/database
# Или отдельные параметры:
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_DATABASE=your_database
# POSTGRES_USERNAME=your_username
# POSTGRES_PASSWORD=your_password
# POSTGRES_SSL=false
```

## Установка зависимостей

### Для PostgreSQL (только если планируете использовать)
```bash
npm install pg
```

### Для SQLite (встроен в Nuxt Content)
Никаких дополнительных зависимостей не требуется.

## Использование в коде

### Runtime Config (серверная часть)
```typescript
const config = useRuntimeConfig()

// Доступ к конфигурации БД
const dbType = config.database.type // 'sqlite' по умолчанию
const dbConfig = config.database[dbType]
```

## Переключение между БД

1. **SQLite** (по умолчанию): не указывайте `DATABASE_TYPE` или установите `DATABASE_TYPE=sqlite`
2. **PostgreSQL** (опционально): установите `DATABASE_TYPE=postgres` и настройте `POSTGRES_URL`

## Безопасность

- Никогда не коммитьте файл `.env` в репозиторий
- Используйте `.env.example` для документации переменных
- В продакшне используйте переменные окружения вашего хостинга 
# Прогресс проекта SomatixBot

## [2026-06-30] - Восстановление VPS + полный аудит и исправления

### Восстановление
- Сделано: восстановили проект на VPS после удаления Docker volumes
- Volume `trackergym_postgres_data` уцелел — данные БД сохранены
- Настроен автоматический бэкап БД (pg_dump по крону каждый день в 3:00, хранит 7 дней)
- Скрипт бэкапа: `/home/apps/trackergym/backup.sh`

### Аудит и исправления (коммит 748b143)
- Сделано: полный аудит безопасности, багов, оптимизации бекенда и фронтенда
- Найдено и исправлено 14 проблем:
  - Безопасность: secure cookies, SSL redirect, XSS/content-type headers, X-Frame-Options
  - Баг: уведомления не работали (exact match вместо range query)
  - Баг: DateTimePicker сдвигал даты из-за UTC конверсии
  - Баг: TaskItem десинхронизация статуса (local state vs props)
  - Баг: WorkoutDetailAPIView get_or_create на prefetch queryset
  - Баг: profile.save() при каждом логине без изменений
  - Оптимизация: N+1 запросы в gym (prefetch muscle_category)
  - Оптимизация: двойная инвалидация кэша (interceptor + onSuccess)
  - Оптимизация: db_index на Task.date и Task.done
  - Оптимизация: TaskDashboard дублировал useTasks()
  - Оптимизация: batch update уведомлений
  - Cleanup: логирование вместо print(), timeout на requests, убраны any типы
- Следующий шаг: деплой на VPS (git pull + docker compose up --build + migrate)

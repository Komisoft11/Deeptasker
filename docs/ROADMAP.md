# Roadmap Deeptasker

Этот документ описывает текущее состояние проекта и направления его развития.

Deeptasker развивается как self-hosted event-driven платформа для управления задачами и совместной работы в реальном времени.

---

# 1. Текущее состояние (MVP / Alpha)

Сейчас реализованы базовые компоненты системы:

## Backend
- NestJS API
- JWT аутентификация
- управление пользователями
- базовые CRUD операции для задач и проектов
- интеграция с RabbitMQ

## Frontend
- React приложение
- Feature-Sliced Design (FSD)
- базовый UI для задач и проектов
- MobX состояние

## Infrastructure
- PostgreSQL как основная БД
- Redis для кэширования
- RabbitMQ как event bus
- MinIO для файлов
- Docker Compose для локального запуска

## Realtime
- WebSocket Event Service (базовая реализация)
- real-time обновления событий

## Notifications
- Notification Service (базовая версия)
- хранение системных уведомлений
- обработка RabbitMQ событий

---

# 2. Активная разработка (Next)

## Backend improvements
- расширение системы ролей и прав (RBAC)
- audit logs для действий пользователей
- улучшение event schema
- оптимизация архитектуры модулей

---

## Event System
- стандартизация event types
- версияция событий (event versioning)
- retry механизм для consumers
- dead-letter queue обработка

---

## Notification Service
- полноценная email интеграция
- шаблоны уведомлений
- группировка уведомлений
- приоритизация событий

---

## WebSocket Service
- масштабирование нескольких инстансов
- подписки на каналы (rooms / topics)
- оптимизация доставки событий

---

## Frontend
- улучшение UX управления задачами
- drag & drop задач
- фильтры и поиск
- комментарии к задачам
- уведомления в UI

---

# 3. Среднесрочные цели

## Plugin system
- возможность расширять систему модулями
- кастомные workflows
- бизнес-логика через плагины

---

## Public API
- документированный REST API v1
- API keys
- rate limiting
- webhooks

---

## Collaboration features
- комментарии в реальном времени
- mentions (@user)
- activity feed
- shared workspaces

---

## File system
- улучшение MinIO интеграции
- версии файлов
- preview файлов в UI

---

# 4. Масштабирование и инфраструктура

## Kubernetes support
- production-ready deployment manifests
- Helm charts
- autoscaling сервисов

---

## Observability
- distributed tracing (OpenTelemetry)
- расширенные метрики Prometheus
- structured logging
- correlation IDs across services

---

## Performance
- оптимизация RabbitMQ consumers
- caching стратегии Redis
- read replicas PostgreSQL

---

# 5. Долгосрочное развитие

## Multi-instance architecture
- горизонтальное масштабирование WebSocket сервиса
- распределённые очереди событий
- service discovery

---

## Cloud version
- hosted SaaS версия Deeptasker
- multi-tenant architecture
- billing system (возможное будущее направление)

---

## Ecosystem
- marketplace интеграций
- внешние интеграции (Slack, email, webhooks)
- расширяемая event system

---

# 6. Архитектурные улучшения

- migration на event versioning v2
- более строгая separation of concerns
- улучшение Notification pipeline
- отказоустойчивость consumers
- saga patterns для сложных операций

---

# 7. Что НЕ входит в ближайший scope

- мобильное приложение
- AI-функции
- встроенный чат
- монолитная переработка backend (архитектура уже считается финальной)

---

# 8. Принцип развития проекта

Deeptasker развивается по следующим принципам:

- event-driven first
- real-time by default
- self-hosted friendly
- modular architecture
- horizontal scalability ready

---

# 9. Как предлагать изменения roadmap

Если вы хотите предложить новую функциональность:

- создайте issue
- опишите use-case
- предложите event-driven модель реализации

---

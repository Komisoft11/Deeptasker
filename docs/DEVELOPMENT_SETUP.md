# Локальная разработка Deeptasker
Этот документ описывает полный процесс запуска Deeptasker в режиме разработки.
Система состоит из нескольких сервисов, поэтому корректный запуск важен для работы event-driven и real-time частей.

---

# 1. Требования
Перед запуском убедитесь, что установлено:

- Docker
- Docker Compose
- Node.js (LTS)
- любой package manager:
    - npm
    - yarn
    - bun

---
# 2. Клонирование проекта

```bash
git clone git@gitlab.com:komisoft/deeptasker.gitcd deeptasker
cd deeptasker
```
---
# 3. Переменные окружения

Скопируйте пример конфигурации:

```bash
cp .env.example .env
```

Заполните переменные согласно:
- ENVIRONMENT_VARIABLES.md

---

# 4. Запуск инфраструктуры

Запускаем базовые сервисы:

```bash
bun run docker
```

Поднимаются:
- PostgreSQL
- Redis
- RabbitMQ
- MinIO
- Prometheus
- Grafana

---

# 5. Подготовка приложений
```bash
   bun run apps:add
```


---

# 6. Миграции базы данных
Запустите миграции:

```bash
bun run migrations
```

---

# 7. Запуск проекта
Режим разработки
```bash
bun run dev
```   

или

Preview-сборка
```bash
bun run preview
```


Backend: 
```bash

```
Frontend:

```
http://localhost:5173 (или другой порт Vite)
```

WebSocket Event Service:
```
ws://localhost:4000
```

Notification Service

Функции:
- обработка RabbitMQ событий
- отправка email уведомлений
- сохранение уведомлений в БД

---

# 8. Проверка системы

## Проверка backend

```bash
curl http://localhost:3000/health
```

---
## Проверка WebSocket

Подключение:

```
ws://localhost:4000
```

---

## Проверка RabbitMQ
UI:

```
http://localhost:15672
```

Login:
- user: deeptasker
- pass: deeptasker

---

## Проверка MinIO

```
http://localhost:9000
```

---

## Grafana

```
http://localhost:3001
```

---

# 9. Типичный workflow разработки

## 1. Backend изменения
- изменить код в `/api`
- перезапустить backend

---

## 2. Event-driven логика

Любое изменение:
```text
Backend → RabbitMQ → (Event Service / Notification Service)
```

---

## 3. Real-time проверка
- открыть frontend
- выполнить действие (создание задачи)
- проверить WebSocket обновление

---

# 10. Частые проблемы
## ❌ RabbitMQ не работает

Проверь:

```bash
docker ps
```

UI:
```
http://localhost:15672
```

---

## ❌ WebSocket не подключается

Проверь:
- Event Service запущен
- правильный WS URL в frontend env

---

## ❌ Notification не отправляет email

Проверь:
- SMTP настройки
- лог notification-service
- очередь RabbitMQ

---

## ❌ нет событий в системе

Проверь цепочку:

```text
Backend → RabbitMQ → consumers
```

---

# 11. Архитектурная схема для разработчика

```text
Frontend
   ↓
Backend API
   ↓
RabbitMQ (event bus)
   ├── WebSocket Service → UI updates
   └── Notification Service → DB + email
```

---

# 12. Рекомендации по разработке

## Backend
- stateless API
- все события через RabbitMQ
- не писать WebSocket напрямую

---

## Event Service
- не содержит бизнес-логики
- только трансляция событий

---

## Notification Service
- хранит данные уведомлений
- может работать независимо от UI

---

# 13. Итог
Если всё запущено корректно, у тебя работает:
- REST API
- real-time обновления через WebSocket
- event-driven коммуникация через RabbitMQ
- email уведомления
- файловое хранилище (MinIO)
- мониторинг (Prometheus + Grafana)
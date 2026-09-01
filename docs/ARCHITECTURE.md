# Архитектура Deeptasker

## Обзор

Deeptasker — это self-hosted event-driven платформа для управления задачами и совместной работы в реальном времени.

Система построена как набор независимых сервисов, взаимодействующих через event-bus (RabbitMQ). Это позволяет масштабировать отдельные компоненты независимо и расширять функциональность без изменения ядра системы.

---

## Высокоуровневая архитектура

```text
                        ┌──────────────┐
                        │   Frontend   │
                        │  React + FSD │
                        └──────┬───────┘
                               │ HTTP / WebSocket
                               ▼
                        ┌──────────────┐
                        │ Backend API  │
                        │   NestJS     │
                        └───┬─────┬────┘
                            │     │
        ┌───────────────────┼─────┼────────────────────┐
        ▼                   ▼     ▼                    ▼
  PostgreSQL            Redis  RabbitMQ              MinIO
 (primary DB)          (cache) (event bus)        (file storage)
                                    │
                                    ▼
                        ┌─────────────────────┐
                        │   Event Consumers   │
                        └─────────┬───────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                ▼                                   ▼
   ┌──────────────────────┐            ┌────────────────────────┐
   │ WebSocket Service    │            │ Notification Service   │
   │ (Real-time layer)    │            │ (Async delivery layer) │
   └──────────┬───────────┘            └──────────┬─────────────┘
              │                                   │
              ▼                                   ▼
     Connected Clients                  Email / DB notifications

                        ┌──────────────┐
                        │  Monitoring  │
                        │ Prometheus + │
                        │   Grafana    │
                        └──────────────┘
```

---

## Основные принципы архитектуры

### 1. Event-driven взаимодействие

Все ключевые изменения в системе публикуются как события в RabbitMQ.

Это позволяет:
- декуплировать сервисы
- добавлять новые обработчики без изменения Backend API
- масштабировать обработку событий отдельно

---

### 2. Разделение real-time и async логики

Система разделяет два типа доставки данных:

#### Real-time (WebSocket Service)
- мгновенные обновления интерфейса
- синхронизация состояния UI
- live-обновления задач и проектов

#### Async (Notification Service)
- хранение уведомлений
- email-уведомления
- обработка фоновых событий
- гарантированная доставка сообщений

---

### 3. Stateless Backend API

Backend API не хранит состояние:
- каждый запрос независим
- состояние хранится в PostgreSQL / Redis
- масштабирование через горизонтальное добавление инстансов

---

### 4. Self-hosted-first подход

Вся система рассчитана на локальное или корпоративное развертывание:
- docker-compose как базовый способ запуска
- отсутствие обязательных внешних сервисов
- возможность полной изоляции инфраструктуры

---

## Компоненты системы

### Frontend

Пользовательский интерфейс приложения.

**Стек:**
- React
- TypeScript
- MobX
- Feature-Sliced Design (FSD)

**Ответственность:**
- UI слой
- работа с API
- обработка real-time событий
- локальное состояние

---

### Backend API

Основной сервис бизнес-логики.

**Стек:**
- NestJS (Express)

**Функции:**
- авторизация (JWT)
- управление пользователями
- работа с задачами и проектами
- публикация событий в RabbitMQ
- взаимодействие с БД

---

### PostgreSQL

Основное хранилище данных:
- пользователи
- задачи
- проекты
- роли и права доступа
- уведомления (persistent storage)

---

### Redis

Используется для:
- кэширования
- сессий
- ускорения часто запрашиваемых данных

---

### RabbitMQ (Event Bus)

Центральная система событий.

Отвечает за:
- передачу событий между сервисами
- асинхронную обработку действий
- связь backend → consumers

---

### WebSocket Event Service

Real-time слой системы.

Функции:
- WebSocket соединения с клиентами
- подписка на события из RabbitMQ
- доставка обновлений UI в реальном времени
- синхронизация состояния клиентов

---

### Notification Service

Сервис уведомлений и фоновой обработки.

Функции:
- хранение системных уведомлений
- обработка событий из RabbitMQ
- отправка email уведомлений
- формирование notification-логики
- интеграция с системой событий

---

### MinIO

S3-совместимое хранилище:
- вложения к задачам
- файлы пользователей
- медиа-контент

---

### Monitoring Stack

- Prometheus — сбор метрик
- Grafana — визуализация и дашборды

---

## Потоки данных

### Создание задачи

```text
User
 ↓
Frontend
 ↓
Backend API
 ↓
PostgreSQL (save)
 ↓
RabbitMQ event (TaskCreated)
 ↓
├── WebSocket Service → update UI
└── Notification Service → save + email
```

---

### Обновление задачи в реальном времени

```text
User A
 ↓
Backend API
 ↓
PostgreSQL update
 ↓
RabbitMQ event
 ↓
WebSocket Service
 ↓
Users B, C, D (live update)
```

---

### Уведомление пользователя

```text
Event (e.g. task assigned)
 ↓
RabbitMQ
 ↓
Notification Service
 ↓
PostgreSQL (store notification)
 ↓
Email service (optional)
 ↓
WebSocket Service (optional real-time push)
```

---

## Масштабируемость

Архитектура поддерживает горизонтальное масштабирование:

- Backend API → multiple instances
- WebSocket Service → scalable consumers
- Notification Service → queue-based scaling
- RabbitMQ → clustering support
- Redis → caching layer scaling
- PostgreSQL → future read replicas

---

## Расширяемость

Система спроектирована для будущих расширений:

- Plugin system
- Public API v1
- Multi-instance websocket support
- Kubernetes deployment
- Distributed tracing (OpenTelemetry)

---

## Итог

Deeptasker — это не монолитный таск-менеджер.

Это модульная event-driven платформа, разделяющая:

- бизнес-логику (Backend API)
- real-time взаимодействие (WebSocket Service)
- асинхронные уведомления (Notification Service)
- и event-transport слой (RabbitMQ)

Такой подход позволяет:
- масштабировать систему
- добавлять новые типы интеграций
- адаптировать платформу под бизнес-процессы
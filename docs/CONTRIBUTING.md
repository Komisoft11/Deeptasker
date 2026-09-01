# Участие в разработке Deeptasker

Спасибо за интерес к проекту Deeptasker!

Deeptasker — это open source платформа для управления задачами, построенная на event-driven архитектуре.  Мы приветствуем любой вклад в развитие проекта: исправление ошибок, новые функции, улучшение документации и предложения по развитию архитектуры.

---

# 1. Общие принципы

Перед тем как начать разработку, рекомендуем ознакомиться с архитектурой проекта.

Основные принципы:

- система построена на event-driven архитектуре;
- взаимодействие между сервисами осуществляется через RabbitMQ;
- real-time обновления обрабатываются отдельным Event Stream Service;
- системные уведомления обрабатываются отдельным Notification Service;
- Backend API не содержит логики доставки уведомлений или WebSocket-соединений.

> **Важно:** не обходите Event Bus (RabbitMQ). Все события должны проходить через единую систему обмена сообщениями.

---

# 2. Подготовка окружения

## Требования

Перед началом работы установите:

- Node.js (LTS)
- Bun
- Docker
- Docker Compose v2.0.0+

---

## Клонирование проекта

```bash
git clone git@gitlab.com:komisoft/deeptasker.gitcd deeptasker
```

---

## Установка зависимостей

```bash
bun install
```

---

## Настройка переменных окружения

Каждое приложение использует собственный файл `.env`.

Создайте `.env` на основе `.env.example` в следующих каталогах:

```text
apps/
├── api/
├── frontend/
├── event-stream/
└── notification/
```

Подробное описание переменных находится в `ENVIRONMENT_VARIABLES.md`.

---

## Запуск инфраструктуры

```bash
docker compose up -d
```

---

## Выполнение миграций

```bash
cd apps/api
npx mikro-orm migration:up
```

---

## Подготовка приложений

```bash
bun apps:add
```

---

## Запуск проекта

Режим разработки:

```bash
bun dev
```

или

```bash
bun preview
```

Подробная инструкция доступна в `DEVELOPMENT_SETUP.md`.

---

# 3. Структура проекта

```text
deeptasker/
│
├── apps/
│   ├── api/               # Backend API
│   ├── frontend/          # React приложение
│   ├── event-stream/      # Event Stream Service
│   └── notification/      # Notification Service
│
├── docker/
├── grafana/
│
├── docker-compose.yaml
├── prometheus.yaml
└── package.json
```

---

# 4. Стандарты разработки

## Backend

- Используйте модульную архитектуру NestJS.
- Не размещайте бизнес-логику в контроллерах.
- Вся бизнес-логика должна находиться в сервисах.
- Асинхронное взаимодействие между сервисами должно осуществляться через RabbitMQ.

---

## Event-driven архитектура

### Не рекомендуется

- напрямую взаимодействовать с Event Stream Service;
- отправлять email из Backend API;
- создавать тесную связанность между сервисами;
- обходить RabbitMQ.

### Рекомендуется

- публиковать события в RabbitMQ;
- использовать consumers в Event Stream и Notification Service;
- разделять ответственность между сервисами.

---

## Frontend

Используемый стек:

- React
- TypeScript
- Feature-Sliced Design (FSD)
- MobX
- React Hook Form
- Tailwind CSS
- SCSS
- Radix UI

---

# 5. Git Workflow

## Название веток

Используйте формат:

```text
DT-Task_Number
```

Например:

```text
DT-123
```

---

## Сообщения коммитов

Рекомендуемый формат:

```text
feat: add task creation event
fix: websocket reconnect
hotfix: fix notification consumer
refactor: simplify auth module
docs: update architecture documentation
```

---

## Merge Request / Pull Request

Перед созданием Merge Request убедитесь, что:

- проект успешно собирается;
- приложение запускается локально;
- миграции выполняются без ошибок;
- отсутствуют ошибки линтера;
- изменение протестировано.

---

# 6. Проверка изменений

Перед отправкой Merge Request рекомендуется проверить следующие сценарии.

## Создание задачи

Поток событий:

```text
Frontend
    ↓
Backend API
    ↓
RabbitMQ
    ├── Event Stream Service
    └── Notification Service
```

Убедитесь, что:

- задача сохранена в базе данных;
- интерфейс обновился через WebSocket;
- создано системное уведомление.

---

## Работа уведомлений

```text
Backend API
    ↓
RabbitMQ
    ↓
Notification Service
    ├── PostgreSQL
    └── Email
```

Проверьте:

- уведомление сохранено;
- email отправлен (если SMTP настроен).

---

## Real-time обновления

```text
Backend API
    ↓
RabbitMQ
    ↓
Event Stream Service
    ↓
Frontend
```

Убедитесь, что изменения отображаются без обновления страницы.

---

# 7. Архитектурные ограничения

## Backend API

Backend API:

- не хранит состояние соединений;
- не содержит WebSocket-логики;
- не отправляет email напрямую.

---

## Event Stream Service

Отвечает исключительно за доставку событий клиентам.

Не должен содержать бизнес-логику.

---

## Notification Service

Отвечает за:

- хранение уведомлений;
- обработку событий;
- отправку email.

---

# 8. Code Style

Перед отправкой изменений убедитесь, что код соответствует принятому стилю.

Основные требования:

- TypeScript;
- ESLint;
- Prettier;
- отсутствие неиспользуемого кода;
- отсутствие `any`, если это можно избежать.

---

# 9. Добавление новых событий

При добавлении новой функциональности рекомендуется следующий подход.

1. Backend API публикует событие.

Например:

```text
TaskCreatedEvent
TaskUpdatedEvent
TaskAssignedEvent
```

2. При необходимости событие обрабатывается одним или несколькими сервисами:

- Event Stream Service;
- Notification Service.

---

# 10. Что считается хорошим вкладом

Мы особенно приветствуем:

- исправление ошибок;
- новые возможности;
- улучшение производительности;
- развитие Event Stream Service;
- развитие Notification Service;
- улучшение документации;
- оптимизацию архитектуры;
- улучшение Developer Experience.

---

# 11. Что не принимается

Как правило, не принимаются изменения, которые:

- обходят RabbitMQ;
- создают прямые зависимости между сервисами;
- нарушают event-driven архитектуру;
- добавляют бизнес-логику в Event Stream Service.

---

# 12. Вопросы

Если у вас есть вопросы:

- создайте Issue;
- предложите изменение через Merge Request;
- обсудите архитектурное решение до начала реализации.

---

# Спасибо

Спасибо за интерес к Deeptasker и вклад в развитие проекта!
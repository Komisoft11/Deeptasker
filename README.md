# Deeptasker

**Deeptasker** — это open source платформа для управления задачами и совместной работы, предназначенная как для индивидуального использования, так и для команд любого размера.

Проект построен на современной **event-driven архитектуре** с поддержкой **real-time обновлений**, горизонтального масштабирования и самостоятельного развертывания (**self-hosted**).
  
---  

## Возможности

### Управление задачами

- Создание и организация задач
- Работа с проектами и рабочими пространствами
- Назначение исполнителей
- Приоритеты и сроки выполнения
- Гибкая система ролей и прав доступа

### Работа в реальном времени

- Мгновенное обновление данных через WebSocket
- Системные уведомления
- Синхронизация действий между участниками команды

### Масштабируемость

- Event-driven архитектура
- Отдельный сервис обработки событий
- RabbitMQ для обмена сообщениями
- Redis для кэширования
- Возможность горизонтального масштабирования компонентов

### Self-hosted

- Полный контроль над данными
- Развертывание в собственной инфраструктуре
- Docker-first подход
- Возможность адаптации под бизнес-процессы компании

---  

# Для кого подходит Deeptasker

- Индивидуальные пользователи
- Небольшие команды
- Стартапы
- Компании любого размера
- Разработчики, желающие расширять функциональность платформы

---  

# Архитектура

```text  
Deeptasker  
│  
├── Frontend  
│   └── React  
│  
├── Backend API  
│   └── NestJS  
│  
├── Infrastructure  
│   ├── PostgresSQL  
│   ├── Redis  
│   ├── RabbitMQ  
│   └── MinIO  
│  
├── Event Stream  
│   └── NestJS  
│  
├── Notification Service  
│   └── NestJS 
│  
└── Monitoring  
    ├── Prometheus    └── Grafana  
```  

### Основные компоненты

| Компонент            | Назначение                          |
| -------------------- | ----------------------------------- |
| Frontend             | Пользовательский интерфейс          |
| Backend API          | Основная бизнес-логика              |
| PostgreSQL           | Основное хранилище данных           |
| Redis                | Кэширование данных                  |
| RabbitMQ             | Брокер сообщений (Event Bus)        |
| Event Stream         | Доставка событий в реальном времени |
| Notification Service | Хранение и отправка уведомлений     |
| MinIO                | S3-совместимое файловое хранилище   |
| Prometheus           | Сбор метрик                         |
| Grafana              | Мониторинг системы                  |
  
---  

# Структура проекта

```text  
deeptasker/  
│  
├── apps/  
│   ├── api/               # Backend API (NestJS)  
│   ├── event-stream/      # WebSocket Event Service  
│   ├── frontend/          # React приложение  
│   └── notification/      # Notification Service  
│  
├── docker/                # Docker-конфигурация  
├── docs/                  # Документация  
├── grafana/               # Dashboards Grafana  
│  
├── docker-compose.yaml  
├── prometheus.yaml  
├── package.json  
└── README.md  
```  
  
---  

# Технологический стек

## Frontend

- React
- TypeScript
- MobX
- React Hook Form
- Tailwind CSS
- SCSS
- Radix UI
- Feature-Sliced Design (FSD)

## Backend

- Node.js
- NestJS
- Express

## Infrastructure

- PostgreSQL
- Redis
- RabbitMQ
- MinIO
- Docker Compose
- Nginx
- Prometheus
- Grafana

## Event Stream

- Node.js
- NestJS
- Express

## Notification Service

- Node.js
- NestJS
- Express
- React Email

---  

# Быстрый запуск

## Требования

Перед началом убедитесь, что установлены:

- Node.js
- Bun
- Docker
- Docker Compose v2.0.0+

---  

## 1. Клонирование проекта

```bash  
git clone git@gitlab.com:komisoft/deeptasker.gitcd deeptasker
```  
  
---  

## 2. Настройка переменных окружения

Каждое приложение использует собственный файл `.env`.

Перед запуском необходимо создать файл `.env` в каждом приложении на основе соответствующего `.env.example`.

```text  
apps/  
├── api/  
│   ├── .env.example  
│   └── .env  
│  
├── frontend/  
│   ├── .env.example  
│   └── .env  
│  
├── event-stream/  
│   ├── .env.example  
│   └── .env  
│  
└── notification/  
    ├── .env.example    
    └── .env  
```  
Описание всех доступных переменных приведено в `ENVIRONMENT_VARIABLES.md`.

## 3. Запуск инфраструктуры

```bash  
bun run docker
```  

Будут запущены:

- Redis
- RabbitMQ
- MinIO
- Prometheus
- Grafana
- Notification DB
- Api DB

---  
## 4. Подготовка приложений

```bash  
bun run apps:add
```  

---  

## 5. Выполнение миграций

После запуска инфраструктуры необходимо применить миграции базы данных:

```bash  
bun run migrations
```  

---

## 6. Запуск проекта

### Режим разработки

```bash  
bun run dev
```  

или

### Preview-сборка

```bash  
bun run preview
```  
  
---  

# Документация

Подробная документация проекта:

| Документ                   | Описание                       |
| -------------------------- | ------------------------------ |
| `ARCHITECTURE.md`          | Архитектура проекта            |
| `DEVELOPMENT_SETUP.md`     | Подробный локальный запуск     |
| `ENVIRONMENT_VARIABLES.md` | Переменные окружения           |
| `CONTRIBUTING.md`          | Руководство для контрибьюторов |
| `ROADMAP.md`               | План развития проекта          |
| `CODE_OF_CONDUCT.md`       | Кодекс поведения сообщества    |
  
---  

# Дорожная карта

## Уже реализовано

- Event-driven архитектура
- Управление задачами
- Проекты и рабочие пространства
- JWT-аутентификация
- WebSocket обновления
- Notification Service
- RabbitMQ Event Bus
- Docker Compose
- Monitoring (Prometheus + Grafana)

## Планируется

- Plugin System
- Горизонтальное масштабирование WebSocket
- Улучшение Notification Pipeline
- Расширенная система ролей и прав
- Облачная (SaaS) версия платформы
- Добавление функционала автоматизации рутинных задач пользователя

---  

# Участие в разработке

Мы приветствуем вклад сообщества в развитие Deeptasker.

Перед созданием Merge Request или Pull Request ознакомьтесь с:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`

Если вы хотите предложить новую функциональность или сообщить об ошибке, создайте Issue с подробным описанием.
  
---  

# Лицензия
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)

This project is licensed under the GNU Affero General Public License
version 3 or later (AGPL-3.0-or-later).
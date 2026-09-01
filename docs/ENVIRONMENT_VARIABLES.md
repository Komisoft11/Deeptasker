# Переменные окружения Deeptasker

Этот документ описывает все переменные окружения, необходимые для запуска и работы Deeptasker.
Система состоит из нескольких сервисов, поэтому переменные разделены по областям ответственности.

---

# Общие переменные

Используются большинством сервисов.
```
NODE_ENV=development
APP_PORT=3000
CLIENT_URL=http://deeptasker.test:3000  
SERVER_URL=http://deeptasker.test:5000
```

---

# Backend API (NestJS)
## База данных (PostgreSQL)

```
DB_HOST=127.0.0.1  
DB_PORT=35433  
DB_USER=postgres  
DB_DEBUG=0  
DB_COMMAND_DEBUG=0  
DB_PASSWORD=dender  
DB_NAME=deeptracker
```

---

## JWT Authentication
```
JWT_SECRET_KEY=secret  
JWT_EXPIRES_IN=1h
```

---

## Redis (cache + sessions)
```
REDIS_HOST=127.0.0.1  
REDIS_PORT=6379
```

---

## RabbitMQ (event bus)
```
RABBITMQ_URI=amqp://user:password@127.0.0.1:35672  
RABBITMQ_QUEUE=notification_queue  
RABBITMQ_QUEUE_DURABLE=true  
RABBITMQ_EVENTS_EXCHANGE=events
```

---

## MinIO (file storage)
```
S3_BUCKET=deeptasker  
S3_ACCESS_KEY_ID=deeptasker  
S3_ACCESS_KEY=deeptasker  
S3_REGION=  
S3_ENDPOINT=http://localhost:39000
```

---

## SMTP
```
SMTP_HOST:smtp.host  
SMTP_PORT:465  
SMTP_USER:test@email  
SMTP_PASSWORD:pass
```

---

# Frontend

```
VITE_APP_API_HOST=http://deeptasker.test:5000  
VITE_WS=ws://ws.deeptasker.test:5001  
VITE_PORT=3000  
VITE_APP_UPLOAD_LIMIT=5242880
VITE_SUPPORT_EMAIL=example@deeptasker.ru
```

---

# Monitoring (Prometheus + Grafana)
## Prometheus
```
PROMETHEUS=1  
```

---

## Grafana
```
GRAFANA_PASSWORD=password
```

---

# Docker / Infrastructure
```
SWAGGER=1
```

---

# Безопасность
## ВАЖНО
- Никогда не коммить `.env` файл в репозиторий
- Используй `.env.example` для шаблонов
- Секреты (JWT, SMTP, passwords) должны быть разными в production

---

# .env.example (рекомендуется)

Рекомендуется поддерживать файл:
```text
.env.example
```
с теми же переменными, но без реальных значений.

---

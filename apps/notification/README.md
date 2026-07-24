# 📬 Notification Service

Сервис для отправки email-уведомлений (OTP, приглашения, уведомления).

---

## 🛠 Полезные команды

```bash id="commands"
bun run dev     # запуск NestJS (watch mode)

bun run email   # preview email шаблонов (http://localhost:4000)
```

---

## 📁 Структура проекта

```id="x4j2k9"
src/
  email/
    emails/
      invitation/     # приглашения
      notice/         # уведомления
      otp/            # OTP
      template/       # шаблоны
    email.service.ts  # отправка писем
    email.module.ts

  notification/       # обработка событий (controller/service)

  infrastructure/
    rmq/              # RabbitMQ интеграция

  config/             # конфигурация
```

---

## ✉️ Примеры писем

### OTP (код подтверждения)

```ts id="otp-example"
export default function ActivateUserEmail({
  otp,
  locale,
  otpLocale
}: ActivateUserEmailProps) {
  return (
    <OtpEmailTemplate locale={locale}>
      <OtpEmailTemplate.Title>{otpLocale.title}</OtpEmailTemplate.Title>
      <OtpEmailTemplate.Body>{otpLocale.body}</OtpEmailTemplate.Body>
      <OtpEmailTemplate.Otp>{otp}</OtpEmailTemplate.Otp>
      <OtpEmailTemplate.Expires>{otpLocale.expires}</OtpEmailTemplate.Expires>
      <OtpEmailTemplate.Warning>{otpLocale.warning}</OtpEmailTemplate.Warning>
      </OtpEmailTemplate>
  )
}
```

---

### Invitation (приглашение)

```ts id="invitation-example"
export default function ProjectInvitationEmail(
  props: ProjectInvitationEmailProps
) {
  return (
    <InvitationEmailTemplate {...props}>
    <InvitationEmailTemplate.Title>
      {props.invitationLocale.title}
    </InvitationEmailTemplate.Title>
    <InvitationEmailTemplate.Body>
    {props.invitationLocale.body}
    </InvitationEmailTemplate.Body>
    </InvitationEmailTemplate>
  )
}
```

---

## ⚠️ Важно

* Email-шаблоны используют **React Email**
* Переводы лежат в `src/i18n`
* Все JSON должны попадать в `dist` (через `nest-cli.json` assets)
* Используй только **публичные URL** для изображений

---

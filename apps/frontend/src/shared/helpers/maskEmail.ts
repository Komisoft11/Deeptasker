export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@')

  if (localPart.length <= 1) {
    return `${localPart}*@${domain}`
  }

  const maskedLocalPart = localPart[0] + '*'.repeat(localPart.length - 1)

  return `${maskedLocalPart}@${domain}`
}

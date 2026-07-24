export function getCorsConfig() {
  return {
    credentials: true,
    origin: process.env.CLIENT_URL
  }
}

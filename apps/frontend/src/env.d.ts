/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_HOST: string
  readonly VITE_PORT: number
  readonly VITE_APP_UPLOAD_LIMIT: number
  readonly VITE_WS: string
  readonly VITE_APP_ENABLE_WEBSOCKET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

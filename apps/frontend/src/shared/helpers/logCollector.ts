const logs: string[] = []

export const initLogCollector = () => {
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn

  console.log = (...args: any[]) => {
    logs.push(`[LOG] ${args.map(String).join(' ')}`)
    originalLog(...args)
  }

  console.error = (...args: any[]) => {
    logs.push(`[ERROR] ${args.map(String).join(' ')}`)
    originalError(...args)
  }

  console.warn = (...args: any[]) => {
    logs.push(`[WARN] ${args.map(String).join(' ')}`)
    originalWarn(...args)
  }
}

export const getCollectedLogs = () => logs

export const normalizeError = (error: any): string => {
  if (error?.stack) return error.stack

  if (error?.response) {
    return JSON.stringify({
      message: error.message,
      status: error.response.status,
      data: error.response.data,
      url: error.config?.url
    })
  }

  return String(error)
}

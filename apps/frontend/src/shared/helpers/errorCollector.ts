let errorStack: string[] = []

export const initErrorCollector = () => {
  window.onerror = (msg, url, line, col, error) => {
    if (error?.stack) {
      errorStack.push(error.stack)
    } else {
      errorStack.push(`${msg} at ${url}:${line}:${col}`)
    }
  }

  window.onunhandledrejection = (event) => {
    if (event.reason instanceof Error && event.reason.stack) {
      errorStack.push(event.reason.stack)
    } else {
      errorStack.push(String(event.reason))
    }
  }
}

export const getCollectedErrors = () => errorStack

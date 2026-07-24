export const PromiseHelper = {
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },
  async withRetry<T>(
    promise: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<T> {
    return promise().catch((error) => {
      if (maxRetries === 0) {
        throw error
      }
      return this.delay(delayMs).then(() =>
        this.withRetry(promise, maxRetries - 1, delayMs)
      )
    })
  },
  async runPromisesSequentially(
    promises: (() => Promise<void>)[]
  ): Promise<void> {
    return promises.reduce((previousPromise, nextPromise) => {
      return previousPromise.then(nextPromise)
    }, Promise.resolve())
  }
}

import * as client from 'prom-client'

export const counterProvider: client.CounterConfiguration<string> = {
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
}

export const histogramProvider: client.HistogramConfiguration<string> = {
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route'],
  // Верхние границы интревалов в секундах
  // Сколько запросов заняло [менее 0.1 сек, менее 0.3 сек, ...]
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 3, 5]
}

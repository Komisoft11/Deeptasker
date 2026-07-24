import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { tap } from 'rxjs/operators'
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import { Counter, Histogram } from 'prom-client'

@Injectable()
export class RedMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly counter: Counter<string>,

    @InjectMetric('http_request_duration_seconds')
    private readonly histogram: Histogram<string>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp()
    const req = http.getRequest()
    const res = http.getResponse()

    const method = req.method
    const route = req.route?.path ?? 'unknown'
    const start = process.hrtime.bigint()

    return next.handle().pipe(
      tap({
        next: () => {
          this.observe(method, route, res.statusCode, start)
        },
        error: () => {
          const status = res.statusCode || 500
          this.observe(method, route, status, start)
        }
      })
    )
  }

  private observe(method: string, route: string, statusCode: number, start: bigint) {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9

    this.counter.inc({
      method,
      route,
      status: statusCode.toString()
    })

    this.histogram.observe({ method, route }, durationSeconds)
  }
}

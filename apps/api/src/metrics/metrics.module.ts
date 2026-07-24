import { Module } from '@nestjs/common'
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { RedMetricsInterceptor } from './interceptors/red-metrics.interceptor'
import { counterProvider, histogramProvider } from './const/metric-provider'

@Module({
  providers: [
    makeCounterProvider(counterProvider),
    makeHistogramProvider(histogramProvider),
    {
      provide: APP_INTERCEPTOR,
      useClass: RedMetricsInterceptor
    }
  ]
})
export class MetricsModule {}

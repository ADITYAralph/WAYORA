import { NationalTouristTelemetry } from '../types/safepathX.types'

/**
 * High-Throughput Telemetry Ingestion Buffer
 * Aggregates high-frequency GPS pings in memory and flushes them to persistence in micro-batches
 */
export class TelemetryBuffer {
  private static instance: TelemetryBuffer
  private bufferQueue: NationalTouristTelemetry[] = []
  private readonly maxBufferSize = 200
  private readonly flushIntervalMs = 2000
  private timer: NodeJS.Timeout | null = null
  private flushListeners: Set<(batch: NationalTouristTelemetry[]) => void> = new Set()

  private constructor() {
    this.startAutoFlush()
  }

  public static getInstance(): TelemetryBuffer {
    if (!TelemetryBuffer.instance) {
      TelemetryBuffer.instance = new TelemetryBuffer()
    }
    return TelemetryBuffer.instance
  }

  public push(telemetry: NationalTouristTelemetry): void {
    this.bufferQueue.push(telemetry)
    if (this.bufferQueue.length >= this.maxBufferSize) {
      this.flush()
    }
  }

  public onFlush(listener: (batch: NationalTouristTelemetry[]) => void): () => void {
    this.flushListeners.add(listener)
    return () => this.flushListeners.delete(listener)
  }

  public flush(): NationalTouristTelemetry[] {
    if (this.bufferQueue.length === 0) return []
    const batch = [...this.bufferQueue]
    this.bufferQueue = []

    this.flushListeners.forEach((listener) => {
      try {
        listener(batch)
      } catch (err) {
        console.warn('[TelemetryBuffer] Flush listener exception:', err)
      }
    })

    return batch
  }

  private startAutoFlush(): void {
    if (typeof window === 'undefined') return
    if (this.timer) clearInterval(this.timer)
    this.timer = setInterval(() => {
      this.flush()
    }, this.flushIntervalMs)
  }
}

export const telemetryBuffer = TelemetryBuffer.getInstance()

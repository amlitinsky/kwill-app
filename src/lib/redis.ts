
import { kv } from '@vercel/kv'

export const LOCK_EXPIRY = 300 // 5 minutes
export const PROCESS_RECORD_EXPIRY = 3600 // 1 hour

interface ProcessRecord {
  status: 'processing' | 'completed'
  startedAt?: string
  completedAt?: string
  eventTimestamp: string
}

export async function acquireLock(botId: string): Promise<boolean> {
  const lockKey = `lock:${botId}`
  // SET NX (Not Exists) is atomic - guaranteed only one process can acquire it
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return (await kv.set(lockKey, Date.now(), { nx: true, ex: LOCK_EXPIRY })) !== null
}

export async function releaseLock(botId: string): Promise<void> {
  const lockKey = `lock:${botId}`
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await kv.del(lockKey)
}

export async function getProcessRecord(botId: string): Promise<ProcessRecord | null> {
  const processKey = `process:${botId}`
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return await kv.get(processKey)
}

export async function setProcessRecord(
  botId: string,
  record: ProcessRecord
): Promise<void> {
  const processKey = `process:${botId}`
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await kv.set(processKey, record, { ex: PROCESS_RECORD_EXPIRY })
}

export async function isProcessing(botId: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const lockExists = await kv.exists(`lock:${botId}`)
  return lockExists === 1
}

// Add these new functions to your redis.ts
export async function markStripeWebhookProcessed(
  webhookId: string,
  eventType: string
): Promise<void> {
  const key = `stripe:webhook:${webhookId}`  // More specific prefix
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await kv.set(key, {
    status: 'completed',
    eventType,
    processedAt: new Date().toISOString()
  }, { 
    ex: 24 * 60 * 60 // 24 hour expiry
  })
}

export async function isStripeWebhookProcessed(webhookId: string): Promise<boolean> {
  const key = `stripe:webhook:${webhookId}`  // More specific prefix
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const record = await kv.get(key)
  return record !== null
}
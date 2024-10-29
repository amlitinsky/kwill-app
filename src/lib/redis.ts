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
  return (await kv.set(lockKey, Date.now(), { nx: true, ex: LOCK_EXPIRY })) !== null
}

export async function releaseLock(botId: string): Promise<void> {
  const lockKey = `lock:${botId}`
  await kv.del(lockKey)
}

export async function getProcessRecord(botId: string): Promise<ProcessRecord | null> {
  const processKey = `process:${botId}`
  return await kv.get(processKey)
}

export async function setProcessRecord(
  botId: string,
  record: ProcessRecord
): Promise<void> {
  const processKey = `process:${botId}`
  await kv.set(processKey, record, { ex: PROCESS_RECORD_EXPIRY })
}

export async function isProcessing(botId: string): Promise<boolean> {
  const lockExists = await kv.exists(`lock:${botId}`)
  return lockExists === 1
}
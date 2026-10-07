import { useEffect, useEffectEvent, useState } from 'react'

export interface ApiState<T> {
  data: T | undefined
  error: Error | undefined
  loading: boolean
}

interface Settled<T> {
  key: string | number
  data?: T
  error?: Error
}

/**
 * Runs `load` when the component mounts and whenever `key` changes.
 * Pass `key = null` to skip loading (e.g. while a required id is not known yet).
 */
export function useApi<T>(load: () => Promise<T>, key: string | number | null): ApiState<T> {
  const [settled, setSettled] = useState<Settled<T>>()
  const runLoad = useEffectEvent(load)

  useEffect(() => {
    if (key === null) return
    let cancelled = false
    runLoad().then(
      (data) => {
        if (!cancelled) setSettled({ key, data })
      },
      (error: unknown) => {
        if (!cancelled) {
          setSettled({ key, error: error instanceof Error ? error : new Error(String(error)) })
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [key])

  // A result only counts if it belongs to the current key; otherwise we're still loading.
  const current = settled?.key === key ? settled : undefined
  return {
    data: current?.data,
    error: current?.error,
    loading: key !== null && current === undefined,
  }
}

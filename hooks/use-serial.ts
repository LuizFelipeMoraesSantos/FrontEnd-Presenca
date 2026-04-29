'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseSerialOptions {
  baudRate?: number
  onData?: (data: string) => void
}

interface UseSerialReturn {
  isSupported: boolean
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  error: string | null
}

export function useSerial(options: UseSerialOptions = {}): UseSerialReturn {
  const { baudRate = 9600, onData } = options
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const portRef = useRef<SerialPort | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const isReadingRef = useRef(false)

  // Check if Web Serial API is supported
  const isSupported = typeof window !== 'undefined' && 'serial' in navigator

  const readLoop = useCallback(async () => {
    if (!portRef.current?.readable) return

    const reader = portRef.current.readable.getReader()
    readerRef.current = reader
    isReadingRef.current = true

    let buffer = ''

    try {
      while (isReadingRef.current) {
        const { value, done } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        buffer += text

        // Process complete lines (ending with newline)
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          const cleanLine = line.trim().replace(/\s+/g, '') // Remove spaces
          if (cleanLine && onData) {
            onData(cleanLine)
          }
        }
      }
    } catch (err) {
      if (isReadingRef.current) {
        console.error('Error reading serial:', err)
        setError('Erro ao ler dados da porta serial')
      }
    } finally {
      reader.releaseLock()
      readerRef.current = null
    }
  }, [onData])

  const connect = useCallback(async () => {
    if (!isSupported) {
      setError('Web Serial API não é suportada neste navegador. Use Chrome ou Edge.')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Request port from user
      const port = await navigator.serial.requestPort()
      await port.open({ baudRate })
      
      portRef.current = port
      setIsConnected(true)
      
      // Start reading
      readLoop()
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotFoundError') {
          setError('Nenhuma porta selecionada')
        } else {
          setError(`Erro ao conectar: ${err.message}`)
        }
      }
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }, [isSupported, baudRate, readLoop])

  const disconnect = useCallback(async () => {
    isReadingRef.current = false

    if (readerRef.current) {
      try {
        await readerRef.current.cancel()
      } catch {
        // Ignore cancel errors
      }
      readerRef.current = null
    }

    if (portRef.current) {
      try {
        await portRef.current.close()
      } catch {
        // Ignore close errors
      }
      portRef.current = null
    }

    setIsConnected(false)
    setError(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isSupported,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    error,
  }
}

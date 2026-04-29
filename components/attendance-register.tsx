'use client'

import { useState, useCallback, useEffect } from 'react'
import { ScanLine, CheckCircle2, XCircle, Usb, Unplug, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSerial } from '@/hooks/use-serial'
import { cn } from '@/lib/utils'

interface AttendanceRegisterProps {
  onRegister: (uid: string) => Promise<void>
  autoRegister?: boolean
}

type Status = 'idle' | 'scanning' | 'success' | 'error'

export function AttendanceRegister({ onRegister, autoRegister = true }: AttendanceRegisterProps) {
  const [uid, setUid] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [lastRegisteredUid, setLastRegisteredUid] = useState('')

  const registerPresence = useCallback(async (tagUid: string) => {
    if (!tagUid.trim() || status === 'scanning') return
    
    // Prevent duplicate registrations of same tag in quick succession
    if (tagUid === lastRegisteredUid && status === 'success') return

    setStatus('scanning')
    setMessage('Verificando tag...')

    try {
      await onRegister(tagUid.trim())
      setStatus('success')
      setMessage('Presenca registrada com sucesso!')
      setLastRegisteredUid(tagUid)
      setUid('')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch {
      setStatus('error')
      setMessage('Erro ao registrar presenca. Tente novamente.')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }, [onRegister, status, lastRegisteredUid])

  const handleSerialData = useCallback((data: string) => {
    const cleanUid = data.toUpperCase()
    setUid(cleanUid)
    
    // Auto-register when tag is read
    if (autoRegister && cleanUid) {
      registerPresence(cleanUid)
    }
  }, [autoRegister, registerPresence])

  const { isSupported, isConnected, isConnecting, connect, disconnect, error } = useSerial({
    baudRate: 9600,
    onData: handleSerialData,
  })

  // Clear last registered UID after some time to allow re-registration
  useEffect(() => {
    if (lastRegisteredUid) {
      const timer = setTimeout(() => {
        setLastRegisteredUid('')
      }, 10000) // 10 seconds cooldown
      return () => clearTimeout(timer)
    }
  }, [lastRegisteredUid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await registerPresence(uid)
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div
            className={cn(
              'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-300',
              status === 'idle' && 'bg-primary/10',
              status === 'scanning' && 'animate-pulse bg-chart-3/20',
              status === 'success' && 'bg-accent/20',
              status === 'error' && 'bg-destructive/10'
            )}
          >
            {status === 'idle' && <ScanLine className="h-10 w-10 text-primary" />}
            {status === 'scanning' && (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-chart-3 border-t-transparent" />
            )}
            {status === 'success' && <CheckCircle2 className="h-10 w-10 text-accent" />}
            {status === 'error' && <XCircle className="h-10 w-10 text-destructive" />}
          </div>
          <CardTitle className="text-2xl">Registro de Chamada</CardTitle>
          <CardDescription>
            {isConnected 
              ? "Aproxime a tag RFID do leitor para registrar automaticamente"
              : "Conecte o Arduino ou digite o codigo manualmente"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="uid-chamada">UID da Tag RFID</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="uid-chamada"
                  placeholder={isConnected ? "Aguardando leitura da tag..." : "Digite o UID manualmente"}
                  value={uid}
                  onChange={(e) => setUid(e.target.value.toUpperCase())}
                  className={cn(
                    "pl-10 font-mono text-lg",
                    isConnected && "border-green-500 focus-visible:ring-green-500"
                  )}
                  disabled={status === 'scanning'}
                />
              </div>
            </div>

            {message && (
              <div
                className={cn(
                  'rounded-lg p-3 text-center text-sm font-medium',
                  status === 'success' && 'bg-accent/10 text-accent',
                  status === 'error' && 'bg-destructive/10 text-destructive',
                  status === 'scanning' && 'bg-chart-3/10 text-chart-3'
                )}
              >
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={status === 'scanning' || !uid.trim()}
            >
              <ScanLine className="mr-2 h-5 w-5" />
              Registrar Presenca
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Arduino Connection Card */}
      <Card className={cn(
        "border-dashed transition-colors",
        isConnected && "border-green-500 bg-green-50/50 dark:bg-green-950/20"
      )}>
        <CardContent className="flex items-center gap-4 p-6">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
            isConnected ? "bg-green-100 dark:bg-green-900" : "bg-primary/10"
          )}>
            {isConnected ? (
              <Usb className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <Unplug className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">Leitor Arduino/RFID</p>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? "Conectado - Leitura automatica ativada"
                : isSupported 
                  ? "Clique para conectar via USB"
                  : "Use Chrome ou Edge para conectar"
              }
            </p>
            {error && (
              <p className="text-xs text-destructive mt-1">{error}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Online
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Desconectar
                </Button>
              </>
            ) : isSupported ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={connect}
                disabled={isConnecting}
                className="gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Usb className="h-4 w-4" />
                    Conectar
                  </>
                )}
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">Indisponivel</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {isConnected && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              O sistema registra a presenca automaticamente quando uma tag e lida. 
              Ha um intervalo de 10 segundos entre leituras da mesma tag.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

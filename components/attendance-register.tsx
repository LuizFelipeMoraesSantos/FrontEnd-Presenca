'use client'

import { useState, useEffect, useCallback } from 'react'
import { Fingerprint, CheckCircle2, AlertCircle, RefreshCw, Usb, Unplug } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { registrarChamada } from '@/lib/api'
import { useSerial } from '@/hooks/use-serial'
import { cn } from '@/lib/utils'

interface LogPresenca {
  id: string
  timestamp: string
  uid: string
  nome: string
  status: 'sucesso' | 'erro'
  mensagem: string
}

export function AttendanceRegister() {
  const [logs, setLogs] = useState<LogPresenca[]>([])
  const [statusAtual, setStatusAtual] = useState<{
    tipo: 'idle' | 'sucesso' | 'erro' | 'processando'
    nome?: string
    mensagem?: string
  }>({ tipo: 'idle' })

  // Processa e envia a string gerada pelo sensor biométrico do ESP32 para o Java
  const processarEntradaBiometrica = useCallback(async (tokenBiometrico: string) => {
    const uidLimpo = tokenBiometrico.trim().toUpperCase()
    if (!uidLimpo) return

    setStatusAtual({ tipo: 'processando' })

    try {
      // Dispara a requisição para o backend Java na rota singular (/chamada)
      const resposta = await registrarChamada(uidLimpo)

      setStatusAtual({
        tipo: 'sucesso',
        nome: resposta.nome || 'Estudante',
        mensagem: 'Presença registrada com sucesso!',
      })

      setLogs((prev) => [
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          uid: uidLimpo,
          nome: resposta.nome || 'Estudante',
          status: 'sucesso',
          mensagem: 'Presença confirmada',
        },
        ...prev,
      ])
    } catch (error: any) {
      console.error(error)
      // Captura mensagens de erro personalizadas do Spring Boot (ex: "Ja Registrado!")
      const msgErro = error.response?.data?.nome || error.response?.data || 'Digital não cadastrada ou erro de conexão.'
      
      setStatusAtual({
        tipo: 'erro',
        mensagem: msgErro,
      })

      setLogs((prev) => [
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          uid: uidLimpo,
          nome: 'Desconhecido',
          status: 'erro',
          mensagem: msgErro,
        },
        ...prev,
      ])
    }
  }, [])

  const { isSupported, isConnected, isConnecting, connect, disconnect, error } = useSerial({
    baudRate: 9600,
    onData: processarEntradaBiometrica,
  })

  // Retorna o painel para o estado padrão de espera após 4 segundos de uma leitura
  useEffect(() => {
    if (statusAtual.tipo === 'sucesso' || statusAtual.tipo === 'erro') {
      const timer = setTimeout(() => {
        setStatusAtual({ tipo: 'idle' })
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [statusAtual.tipo])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Bloco do Monitor do Leitor Biométrico */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Fingerprint className={cn(
              "h-8 w-8 text-primary",
              statusAtual.tipo === 'processando' && "animate-pulse text-amber-500"
            )} />
          </div>
          <CardTitle className="text-2xl">Leitor Biométrico</CardTitle>
          <CardDescription>
            Status da integração ativa com o dispositivo de captura IoT
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
          {/* Feedbacks Dinâmicos de Tela */}
          {statusAtual.tipo === 'idle' && (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              {isConnected ? (
                <p className="animate-pulse text-green-600 dark:text-green-400 font-medium">
                  Aguardando posicionamento do dedo no sensor...
                </p>
              ) : (
                <p>Conecte o módulo USB para iniciar a validação biométrica</p>
              )}
            </div>
          )}

          {statusAtual.tipo === 'processando' && (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 p-8 text-center">
              <RefreshCw className="mb-2 h-8 w-8 animate-spin text-amber-500" />
              <p className="font-medium text-amber-600">Consultando Banco de Dados...</p>
            </div>
          )}

          {statusAtual.tipo === 'sucesso' && (
            <Alert className="border-green-500 bg-green-50/50 dark:bg-green-950/20">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-400 font-bold text-base">
                Presença Confirmada!
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300 text-sm mt-1">
                Olá, <span className="font-semibold">{statusAtual.nome}</span>. {statusAtual.mensagem}
              </AlertDescription>
            </Alert>
          )}

          {statusAtual.tipo === 'erro' && (
            <Alert variant="destructive" className="bg-destructive/5">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-bold text-base">Falha na Validação</AlertTitle>
              <AlertDescription className="text-sm mt-1">
                {statusAtual.mensagem}
              </AlertDescription>
            </Alert>
          )}

          {/* Gerenciamento de Conexão Serial com o Computador */}
          <div className="flex flex-col items-center gap-3 pt-4 border-t">
            {isSupported ? (
              <Button
                variant={isConnected ? "outline" : "default"}
                onClick={isConnected ? disconnect : connect}
                disabled={isConnecting}
                className={cn("w-full gap-2", isConnected && "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30")}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sincronizando Módulo...
                  </>
                ) : isConnected ? (
                  <>
                    <Unplug className="h-4 w-4" />
                    Desconectar Sensor
                  </>
                ) : (
                  <>
                    <Usb className="h-4 w-4" />
                    Conectar Dispositivo Biométrico
                  </>
                )}
              </Button>
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                A API Web Serial não é suportada por este navegador. Use o Google Chrome ou Microsoft Edge.
              </p>
            )}

            {isConnected && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Hardware pronto para leitura
              </div>
            )}
            
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Histórico em Tempo Real de Leituras */}
      <Card className="flex flex-col h-[420px]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Últimas Capturas do Sensor
          </CardTitle>
          <CardDescription>
            Histórico das requisições biométricas processadas nesta sessão
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto min-h-0 pt-0">
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg p-4">
              Nenhuma leitura biométrica registrada ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-xl bg-card text-sm shadow-sm transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        log.status === 'sucesso' ? 'bg-green-500' : 'bg-destructive'
                      )} />
                      <p className="font-semibold tracking-tight">{log.nome}</p>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{log.uid}</p>
                    <p className="text-xs text-muted-foreground/80">{log.mensagem}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground font-medium">
                    {log.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
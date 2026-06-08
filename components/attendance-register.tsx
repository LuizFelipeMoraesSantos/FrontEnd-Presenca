'use client'

import { useState } from 'react'
import { Fingerprint, CheckCircle2, XCircle, Clock, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import api, { registrarChamada } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AttendanceRecord {
  id: number
  nome: string
  uid: string
  horario: string
}

interface AttendanceRegisterProps {
  onSucessoChamada: (nome: string, uid: string) => void
  records: AttendanceRecord[]
}

type Status = 'idle' | 'scanning' | 'success' | 'error'

export function AttendanceRegister({ onSucessoChamada, records }: AttendanceRegisterProps) {
  const [uid, setUid] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [buscandoBiometria, setBuscandoBiometria] = useState(false)

  const buscarUltimaDigitalDoSensor = async () => {
    setBuscandoBiometria(true)
    try {
      const response = await api.get('/ultimo-uid')
      if (response.data && response.data.uid) {
        setUid(response.data.uid.toUpperCase())
        toast.success('Digital capturada do sensor com sucesso!')
      } else {
        toast.error('Nenhuma digital recente encontrada no sensor.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao conectar com o servidor para buscar biometria.')
    } finally {
      setBuscandoBiometria(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid.trim() || status === 'scanning') return

    setStatus('scanning')
    setMessage('Consultando base de dados biométrica...')

    try {
      // Envia o UID para o método POST /chamada no Java
      const response = await registrarChamada(uid.trim())
      
      // O banco encontrou e retornou o nome correto vinculado ao ID
      const nomeAluno = response?.nome || 'Aluno Identificado'

      setStatus('success')
      setMessage(`Presença confirmada para: ${nomeAluno}`)
      
      // Envia para renderizar no histórico
      onSucessoChamada(nomeAluno, uid.trim())
      setUid('')

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3500)

    } catch (error: any) {
      console.error(error)
      setStatus('error')

      if (error.response?.status === 404) {
        setMessage('Digital não encontrada no sistema.')
        toast.error('Identificação Falhou', {
          description: 'Esta biometria não está associada a nenhum aluno cadastrado.',
        })
      } else if (error.response?.status === 409) {
        setMessage('Presença já registada hoje.')
        toast.warning('Aviso de Duplicidade', {
          description: 'Este aluno já possui uma entrada computada para o dia de hoje.',
        })
      } else {
        setMessage('Erro de ligação com o servidor.')
        toast.error('Erro de Servidor', {
          description: 'Verifique se o seu Backend Java está a correr na porta 8080.',
        })
      }

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 4000)
    }
  }

  return (
    <Card className="border shadow-lg rounded-2xl overflow-hidden bg-card">
      <CardHeader className="text-center pb-2 pt-6">
        <div
          className={cn(
            'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 border shadow-sm',
            status === 'idle' && 'bg-primary/5 border-primary/10 text-primary',
            status === 'scanning' && 'animate-pulse bg-amber-500/10 border-amber-500/20 text-amber-500',
            status === 'success' && 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
            status === 'error' && 'bg-destructive/10 border-destructive/20 text-destructive'
          )}
        >
          {status === 'idle' && <Fingerprint className="h-10 w-10" />}
          {status === 'scanning' && (
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          )}
          {status === 'success' && <CheckCircle2 className="h-10 w-10" />}
          {status === 'error' && <XCircle className="h-10 w-10" />}
        </div>
        <CardTitle className="text-xl font-bold">Validar Chamada</CardTitle>
        <CardDescription className="text-xs">
          Capture a digital vinda do sensor Wi-Fi para computar a entrada
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-2 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={buscarUltimaDigitalDoSensor}
          disabled={buscandoBiometria || status === 'scanning'}
          className="w-full h-11 font-medium rounded-xl border bg-muted/30 hover:bg-muted/60 gap-2 transition-all text-xs uppercase tracking-wider"
        >
          {buscandoBiometria ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {buscandoBiometria ? "A carregar do hardware..." : "Buscar Digital"}
        </Button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="uid-chamada" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Código UID da Digital
            </Label>
            <div className="relative">
              <Fingerprint className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                id="uid-chamada"
                placeholder="Clique no botão acima ou insira o ID"
                value={uid}
                onChange={(e) => setUid(e.target.value.toUpperCase())}
                className="pl-10 font-mono text-base h-11 transition-all rounded-xl border bg-muted/10 focus-visible:ring-primary"
                disabled={status === 'scanning'}
              />
            </div>
          </div>

          {message && (
            <div
              className={cn(
                'rounded-xl p-3 text-center text-xs font-semibold border',
                status === 'success' && 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                status === 'error' && 'bg-destructive/5 border-destructive/10 text-destructive',
                status === 'scanning' && 'bg-amber-500/5 border-amber-500/10 text-amber-600 dark:text-amber-400'
              )}
            >
              {message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 font-medium rounded-xl text-sm transition-all shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={status === 'scanning' || !uid.trim()}
          >
            <Fingerprint className="mr-2 h-4 w-4" />
            Registrar Presença
          </Button>
        </form>

        {records.length > 0 && (
          <div className="pt-4 border-t border-dashed space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              Último Confirmado
            </div>
            <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{records[0].nome}</p>
                <Badge variant="secondary" className="mt-1 font-mono text-[10px] px-1.5 py-0">
                  UID: {records[0].uid}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground font-medium bg-background border rounded-lg px-2 py-1 shadow-sm">
                {records[0].horario}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
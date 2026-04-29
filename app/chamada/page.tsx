'use client'

import { useState } from 'react'
import { ScanLine, History, CheckCircle } from 'lucide-react'
import { AttendanceRegister } from '@/components/attendance-register'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { registrarChamada } from '@/lib/api' // mockEstudantes removido com sucesso
import { toast } from 'sonner'

interface AttendanceRecord {
  id: number
  nome: string
  uid: string
  horario: string
}

export default function ChamadaPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])

  const handleRegister = async (uid: string) => {
    try {
      // 1. Chamada para o Backend
      const response = await registrarChamada(uid)
      
      // 2. CORREÇÃO DA TIPAGEM: 
      // Como o seu Java retorna uma String, tratamos ela aqui para extrair o nome
      const mensagemDoBack = String(response)
      const nomeExtraido = mensagemDoBack.includes('Presença registrada para:')
        ? mensagemDoBack.replace('Presença registrada para: ', '')
        : 'Aluno Identificado'

      const newRecord: AttendanceRecord = {
        id: Date.now(),
        nome: nomeExtraido,
        uid: uid,
        horario: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      }

      // Atualiza a lista com o novo registro no topo
      setRecords((prev) => [newRecord, ...prev].slice(0, 10))
      
      toast.success('Presença registrada!', {
        description: `${nomeExtraido} - ${newRecord.horario}`,
      })
    } catch (error: any) {
      console.error("Erro na chamada:", error)
      
      if (error.response?.status === 404) {
        toast.error('Tag não encontrada', {
          description: 'Este UID não está cadastrado no sistema.',
        })
      } else {
        toast.error('Erro de conexão', {
          description: 'Verifique se o Backend Java está rodando na porta 8080.',
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ScanLine className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registro de Chamada</h1>
          <p className="text-sm text-muted-foreground">
            Registre a presença dos alunos via tag RFID
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AttendanceRegister onRegister={handleRegister} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Últimos Registros
            </CardTitle>
            <CardDescription>
              Histórico das últimas presenças registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <CheckCircle className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="font-medium text-muted-foreground">
                  Nenhuma presença registrada
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record, index) => (
                  <div
                    key={record.id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                      index === 0 ? 'border-primary/30 bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
                        {record.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{record.nome}</p>
                        <Badge variant="secondary" className="mt-1 font-mono text-xs">
                          {record.uid}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{record.horario}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
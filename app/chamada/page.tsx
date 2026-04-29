'use client'

import { useState } from 'react'
import { ScanLine, History, CheckCircle } from 'lucide-react'
import { AttendanceRegister } from '@/components/attendance-register'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { registrarChamada, mockEstudantes } from '@/lib/api'
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
      const response = await registrarChamada(uid)
      const newRecord: AttendanceRecord = {
        id: Date.now(),
        nome: response.estudanteNome || 'Aluno',
        uid,
        horario: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      }
      setRecords((prev) => [newRecord, ...prev].slice(0, 10))
      toast.success('Presença registrada!', {
        description: `${newRecord.nome} - ${newRecord.horario}`,
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: string; status?: number } }
        if (axiosError.response?.status === 404) {
          toast.error('Tag não encontrada', {
            description: 'Este UID não está cadastrado no sistema.',
          })
        } else if (axiosError.response?.data?.includes('já registrada')) {
          toast.warning('Presença já registrada', {
            description: 'Este aluno já teve presença registrada hoje.',
          })
        } else {
          // Modo demo: simular registro
          const mockStudent = mockEstudantes.find((e) => e.uid === uid)
          if (mockStudent) {
            const newRecord: AttendanceRecord = {
              id: Date.now(),
              nome: mockStudent.nome,
              uid,
              horario: new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
            }
            setRecords((prev) => [newRecord, ...prev].slice(0, 10))
            toast.success('Presença registrada! (Demo)', {
              description: `${newRecord.nome} - ${newRecord.horario}`,
            })
          } else {
            toast.error('Tag não encontrada (Demo)', {
              description: 'Use um UID dos alunos cadastrados.',
            })
            throw error
          }
        }
      } else {
        throw error
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
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Aproxime uma tag RFID para começar
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
                      {index === 0 && (
                        <span className="text-xs text-primary">Último registro</span>
                      )}
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

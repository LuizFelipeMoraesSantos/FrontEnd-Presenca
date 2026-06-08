'use client'

import { useState } from 'react'
import { AttendanceRegister } from '@/components/attendance-register'

interface AttendanceRecord {
  id: number
  nome: string
  uid: string
  horario: string
}

export default function ChamadaPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])

  const adicionarRegistroAoHistorico = (nome: string, uid: string) => {
    const agora = new Date()
    
    const dataCompleta = agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    const horarioCompleto = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const newRecord: AttendanceRecord = {
      id: Date.now(),
      nome,
      uid,
      horario: `${dataCompleta} às ${horarioCompleto}`,
    }

    // Atualiza a lista exibindo a última presença confirmada no topo do histórico
    setRecords((prev) => [newRecord, ...prev].slice(0, 5))
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Registro de Chamada</h1>
          <p className="text-sm text-muted-foreground">
            Validação de presença via Identidade Biométrica Única
          </p>
        </div>

        <AttendanceRegister onSucessoChamada={adicionarRegistroAoHistorico} records={records} />
      </div>
    </div>
  )
}
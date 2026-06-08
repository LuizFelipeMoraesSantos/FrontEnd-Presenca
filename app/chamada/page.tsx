'use client'

import { AttendanceRegister } from '@/components/attendance-register'

export default function ChamadaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registro de Presença</h1>
        <p className="text-muted-foreground">
          Monitore as validações de presença geradas pelo leitor biométrico em tempo real
        </p>
      </div>

      <AttendanceRegister />
    </div>
  )
}
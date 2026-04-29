'use client'

import { Users, CheckCircle, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardCardsProps {
  totalAlunos: number
  presencasHoje: number
}

export function DashboardCards({ totalAlunos, presencasHoje }: DashboardCardsProps) {
  const taxaPresenca = totalAlunos > 0 ? Math.round((presencasHoje / totalAlunos) * 100) : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/10" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Alunos
          </CardTitle>
          <div className="rounded-lg bg-primary/10 p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalAlunos}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Alunos cadastrados no sistema
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-accent/20" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Presenças Hoje
          </CardTitle>
          <div className="rounded-lg bg-accent/20 p-2">
            <CheckCircle className="h-5 w-5 text-accent" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{presencasHoje}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Registros de presença do dia
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-chart-3/20" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Taxa de Presença
          </CardTitle>
          <div className="rounded-lg bg-chart-3/20 p-2">
            <TrendingUp className="h-5 w-5 text-chart-3" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{taxaPresenca}%</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Percentual de alunos presentes
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-chart-4/20" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Última Chamada
          </CardTitle>
          <div className="rounded-lg bg-chart-4/20 p-2">
            <Clock className="h-5 w-5 text-chart-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Horário do último registro
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

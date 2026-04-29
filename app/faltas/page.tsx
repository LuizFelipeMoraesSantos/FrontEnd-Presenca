'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarDays, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { getEstudantes, mockEstudantes } from '@/lib/api'
import type { Estudante } from '@/lib/types'
import { cn } from '@/lib/utils'

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

function getDiasDoMes(mes: number, ano: number) {
  return new Date(ano, mes + 1, 0).getDate()
}

function getDiaDaSemana(dia: number, mes: number, ano: number) {
  return new Date(ano, mes, dia).getDay()
}

function isFimDeSemana(dia: number, mes: number, ano: number) {
  const diaSemana = getDiaDaSemana(dia, mes, ano)
  return diaSemana === 0 || diaSemana === 6
}

// Gerar presenças mock para demonstração
function gerarPresencasMock(estudantes: Estudante[], mes: number, ano: number) {
  const diasNoMes = getDiasDoMes(mes, ano)
  const presencasMap: Record<number, Set<number>> = {}
  
  estudantes.forEach(estudante => {
    presencasMap[estudante.id] = new Set()
    // Simular presença aleatória (80-100% de presença)
    for (let dia = 1; dia <= diasNoMes; dia++) {
      if (!isFimDeSemana(dia, mes, ano)) {
        // 85% de chance de presença
        if (Math.random() > 0.15) {
          presencasMap[estudante.id].add(dia)
        }
      }
    }
  })
  
  return presencasMap
}

export default function FaltasPage() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([])
  const [loading, setLoading] = useState(true)
  const [mesAtual, setMesAtual] = useState(new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())
  const [presencas, setPresencas] = useState<Record<number, Set<number>>>({})

  const diasNoMes = getDiasDoMes(mesAtual, anoAtual)
  
  const diasLetivos = useMemo(() => {
    let count = 0
    for (let dia = 1; dia <= diasNoMes; dia++) {
      if (!isFimDeSemana(dia, mesAtual, anoAtual)) {
        count++
      }
    }
    return count
  }, [mesAtual, anoAtual, diasNoMes])

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getEstudantes()
        setEstudantes(data)
        setPresencas(gerarPresencasMock(data, mesAtual, anoAtual))
      } catch {
        setEstudantes(mockEstudantes)
        setPresencas(gerarPresencasMock(mockEstudantes, mesAtual, anoAtual))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [mesAtual, anoAtual])

  function mesAnterior() {
    if (mesAtual === 0) {
      setMesAtual(11)
      setAnoAtual(anoAtual - 1)
    } else {
      setMesAtual(mesAtual - 1)
    }
  }

  function proximoMes() {
    if (mesAtual === 11) {
      setMesAtual(0)
      setAnoAtual(anoAtual + 1)
    } else {
      setMesAtual(mesAtual + 1)
    }
  }

  function calcularEstatisticas(estudanteId: number) {
    const presencasAluno = presencas[estudanteId]?.size || 0
    const faltas = diasLetivos - presencasAluno
    const percentualFaltas = diasLetivos > 0 ? ((faltas / diasLetivos) * 100).toFixed(0) : '0'
    const percentualFreq = diasLetivos > 0 ? ((presencasAluno / diasLetivos) * 100).toFixed(0) : '100'
    return { faltas, percentualFaltas, percentualFreq }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Relatório de Faltas
          </h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe a frequência mensal dos alunos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={mesAnterior}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Select value={String(mesAtual)} onValueChange={(v) => setMesAtual(Number(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes, index) => (
                <SelectItem key={index} value={String(index)}>
                  {mes}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(anoAtual)} onValueChange={(v) => setAnoAtual(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map((ano) => (
                <SelectItem key={ano} value={String(ano)}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={proximoMes}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mês/Ano</p>
              <p className="text-lg font-semibold">{meses[mesAtual]} {anoAtual}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/50">
              <CalendarDays className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dias Letivos</p>
              <p className="text-lg font-semibold">{diasLetivos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Alunos</p>
              <p className="text-lg font-semibold">{estudantes.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Frequência */}
      <Card>
        <CardHeader className="bg-amber-400 dark:bg-amber-500 rounded-t-lg">
          <CardTitle className="text-center text-black">
            Turma A - {meses[mesAtual].toUpperCase()} - {anoAtual}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-300 dark:bg-amber-400">
                  <th className="sticky left-0 z-10 min-w-[40px] border border-amber-500 bg-amber-300 px-2 py-2 text-center text-black dark:bg-amber-400">
                    N°
                  </th>
                  <th className="sticky left-[40px] z-10 min-w-[200px] border border-amber-500 bg-amber-300 px-3 py-2 text-left text-black dark:bg-amber-400">
                    NOME
                  </th>
                  {Array.from({ length: diasNoMes }, (_, i) => i + 1).map((dia) => {
                    const diaSemana = getDiaDaSemana(dia, mesAtual, anoAtual)
                    const fimDeSemana = diaSemana === 0 || diaSemana === 6
                    return (
                      <th
                        key={dia}
                        className={cn(
                          'min-w-[32px] border border-amber-500 px-1 py-1 text-center',
                          fimDeSemana 
                            ? 'bg-red-200 text-red-700 dark:bg-red-300 dark:text-red-800' 
                            : 'bg-amber-300 text-black dark:bg-amber-400'
                        )}
                      >
                        <div className="text-xs font-bold">{dia}</div>
                        <div className="text-[10px] font-normal">{diasSemana[diaSemana]}</div>
                      </th>
                    )
                  })}
                  <th className="min-w-[50px] border border-amber-500 bg-amber-300 px-2 py-2 text-center text-black dark:bg-amber-400">
                    <div className="text-xs">%</div>
                    <div className="text-xs">Falta</div>
                  </th>
                  <th className="min-w-[50px] border border-amber-500 bg-amber-300 px-2 py-2 text-center text-black dark:bg-amber-400">
                    <div className="text-xs">%</div>
                    <div className="text-xs">Freq</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {estudantes.map((estudante, index) => {
                  const stats = calcularEstatisticas(estudante.id)
                  const presencasAluno = presencas[estudante.id] || new Set()
                  
                  return (
                    <tr key={estudante.id} className="hover:bg-muted/50">
                      <td className="sticky left-0 z-10 border border-border bg-background px-2 py-2 text-center font-medium">
                        {index + 1}
                      </td>
                      <td className="sticky left-[40px] z-10 border border-border bg-background px-3 py-2 font-medium">
                        {estudante.nome.toUpperCase()}
                      </td>
                      {Array.from({ length: diasNoMes }, (_, i) => i + 1).map((dia) => {
                        const fimDeSemana = isFimDeSemana(dia, mesAtual, anoAtual)
                        const presente = presencasAluno.has(dia)
                        const faltou = !fimDeSemana && !presente
                        
                        return (
                          <td
                            key={dia}
                            className={cn(
                              'border border-border px-1 py-2 text-center',
                              fimDeSemana && 'bg-red-100 dark:bg-red-900/20',
                              faltou && 'bg-red-500 text-white dark:bg-red-600',
                              presente && 'bg-green-100 dark:bg-green-900/30'
                            )}
                          >
                            {!fimDeSemana && (
                              <span className="text-xs font-medium">
                                {presente ? 'P' : 'F'}
                              </span>
                            )}
                          </td>
                        )
                      })}
                      <td className={cn(
                        'border border-border px-2 py-2 text-center font-semibold',
                        Number(stats.percentualFaltas) > 25 && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      )}>
                        {stats.percentualFaltas}
                      </td>
                      <td className={cn(
                        'border border-border px-2 py-2 text-center font-semibold',
                        Number(stats.percentualFreq) >= 75 && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      )}>
                        {stats.percentualFreq}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 p-4">
          <span className="text-sm font-medium text-muted-foreground">Legenda:</span>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-100 dark:bg-green-900/30" />
            <span className="text-sm">P = Presente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-500" />
            <span className="text-sm">F = Falta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-200 dark:bg-red-900/20" />
            <span className="text-sm">Fim de semana</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

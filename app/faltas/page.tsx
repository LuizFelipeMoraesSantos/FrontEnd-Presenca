'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CalendarDays, Check, X, Users, Loader2 } from 'lucide-react'
import { getEstudantes, getPresencasMensais, adicionarPresencaManual, removerPresenca } from '@/lib/api'
import type { Estudante, PresencaMensal } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function FaltasPage() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([])
  const [presencasMensais, setPresencasMensais] = useState<PresencaMensal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingCell, setUpdatingCell] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  // Gerar os dias do mês selecionado
  const diasDoMes = useMemo(() => {
    const mes = parseInt(selectedMonth)
    const ano = parseInt(selectedYear)
    const ultimoDia = new Date(ano, mes + 1, 0).getDate()
    const dias: Date[] = []
    
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const data = new Date(ano, mes, dia)
      // Filtrar apenas dias úteis (segunda a sexta)
      if (data.getDay() !== 0 && data.getDay() !== 6) {
        dias.push(data)
      }
    }
    return dias
  }, [selectedMonth, selectedYear])

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [estudantesData, presencasData] = await Promise.all([
          getEstudantes(),
          getPresencasMensais(parseInt(selectedMonth) + 1, parseInt(selectedYear)),
        ])
        setEstudantes(estudantesData)
        setPresencasMensais(presencasData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados', {
          description: 'Verifique se o backend está rodando.',
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [selectedMonth, selectedYear])

  // Verificar se aluno tem presença em determinada data
  const temPresenca = (estudanteId: number, data: Date): boolean => {
    const presencaAluno = presencasMensais.find((p) => p.estudanteId === estudanteId)
    if (!presencaAluno) return false
    
    const dataStr = data.toISOString().split('T')[0]
    return presencaAluno.presencas.some((p) => p.startsWith(dataStr))
  }

  // Calcular estatísticas
  const calcularEstatisticas = (estudanteId: number) => {
    const presencaAluno = presencasMensais.find((p) => p.estudanteId === estudanteId)
    const totalPresencas = presencaAluno?.presencas.length || 0
    const totalDias = diasDoMes.length
    const totalFaltas = totalDias - totalPresencas
    const percentual = totalDias > 0 ? Math.round((totalPresencas / totalDias) * 100) : 0
    return { totalPresencas, totalFaltas, percentual }
  }

  // Alternar presença/falta
  const togglePresenca = async (estudanteId: number, data: Date) => {
    const dataStr = data.toISOString().split('T')[0]
    const cellKey = `${estudanteId}-${dataStr}`
    const presente = temPresenca(estudanteId, data)

    setUpdatingCell(cellKey)

    try {
      if (presente) {
        // Remover presença (marcar como falta)
        await removerPresenca(estudanteId, dataStr)
        setPresencasMensais((prev) =>
          prev.map((p) =>
            p.estudanteId === estudanteId
              ? { ...p, presencas: p.presencas.filter((d) => !d.startsWith(dataStr)) }
              : p
          )
        )
        toast.success('Presença removida')
      } else {
        // Adicionar presença
        await adicionarPresencaManual(estudanteId, dataStr)
        setPresencasMensais((prev) => {
          const existente = prev.find((p) => p.estudanteId === estudanteId)
          if (existente) {
            return prev.map((p) =>
              p.estudanteId === estudanteId
                ? { ...p, presencas: [...p.presencas, dataStr] }
                : p
            )
          } else {
            const estudante = estudantes.find((e) => e.id === estudanteId)
            return [
              ...prev,
              {
                estudanteId,
                estudanteNome: estudante?.nome || '',
                presencas: [dataStr],
              },
            ]
          }
        })
        toast.success('Presença adicionada')
      }
    } catch (error) {
      console.error('Erro ao atualizar presença:', error)
      toast.error('Erro ao atualizar', {
        description: 'Verifique se o backend suporta esta operação.',
      })
    } finally {
      setUpdatingCell(null)
    }
  }

  // Calcular média geral de presença
  const mediaGeralPresenca = useMemo(() => {
    if (estudantes.length === 0 || diasDoMes.length === 0) return 0
    const totalPresencas = presencasMensais.reduce((acc, p) => acc + p.presencas.length, 0)
    const totalPossivel = estudantes.length * diasDoMes.length
    return totalPossivel > 0 ? Math.round((totalPresencas / totalPossivel) * 100) : 0
  }, [estudantes, presencasMensais, diasDoMes])

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatório de Faltas</h1>
            <p className="text-sm text-muted-foreground">
              Clique nas células para alternar entre presença e falta
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Presença</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mediaGeralPresenca}%</div>
              <p className="text-xs text-muted-foreground">
                No mês de {meses[parseInt(selectedMonth)]}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estudantes.length}</div>
              <p className="text-xs text-muted-foreground">Alunos cadastrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dias Letivos</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{diasDoMes.length}</div>
              <p className="text-xs text-muted-foreground">Dias úteis no mês</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Planilha de Chamada</CardTitle>
            <CardDescription>
              <span className="inline-flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-600">
                    <Check className="h-3 w-3" />
                  </span>
                  Presença
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-red-500/20 text-red-600">
                    <X className="h-3 w-3" />
                  </span>
                  Falta
                </span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : estudantes.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhum aluno encontrado para gerar o relatório.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-semibold min-w-[180px]">
                        Aluno
                      </th>
                      {diasDoMes.map((dia) => (
                        <th
                          key={dia.toISOString()}
                          className="px-1 py-2 text-center font-medium min-w-[36px]"
                        >
                          <div className="text-[10px] text-muted-foreground">
                            {dia.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                          </div>
                          <div className="text-xs">{dia.getDate()}</div>
                        </th>
                      ))}
                      <th className="px-3 py-2 text-center font-semibold min-w-[60px] bg-muted/50">
                        Pres.
                      </th>
                      <th className="px-3 py-2 text-center font-semibold min-w-[60px] bg-muted/50">
                        Faltas
                      </th>
                      <th className="px-3 py-2 text-center font-semibold min-w-[60px] bg-muted/50">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudantes.map((aluno, index) => {
                      const stats = calcularEstatisticas(aluno.id)
                      return (
                        <tr
                          key={aluno.id}
                          className={cn(
                            'border-b transition-colors hover:bg-muted/50',
                            index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                          )}
                        >
                          <td className="sticky left-0 z-10 bg-inherit px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {aluno.nome.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium truncate max-w-[120px]">
                                {aluno.nome}
                              </span>
                            </div>
                          </td>
                          {diasDoMes.map((dia) => {
                            const dataStr = dia.toISOString().split('T')[0]
                            const cellKey = `${aluno.id}-${dataStr}`
                            const presente = temPresenca(aluno.id, dia)
                            const isUpdating = updatingCell === cellKey
                            const isFuturo = dia > new Date()

                            return (
                              <td key={dia.toISOString()} className="px-1 py-1 text-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => !isFuturo && togglePresenca(aluno.id, dia)}
                                      disabled={isUpdating || isFuturo}
                                      className={cn(
                                        'inline-flex h-7 w-7 items-center justify-center rounded transition-all',
                                        isFuturo
                                          ? 'cursor-not-allowed bg-muted/50 text-muted-foreground/30'
                                          : presente
                                          ? 'bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30'
                                          : 'bg-red-500/20 text-red-600 hover:bg-red-500/30',
                                        'disabled:opacity-50'
                                      )}
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : isFuturo ? (
                                        <span className="text-[10px]">-</span>
                                      ) : presente ? (
                                        <Check className="h-3.5 w-3.5" />
                                      ) : (
                                        <X className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isFuturo ? (
                                      'Data futura'
                                    ) : (
                                      <>
                                        {aluno.nome} - {dia.toLocaleDateString('pt-BR')}
                                        <br />
                                        <span className="text-xs text-muted-foreground">
                                          Clique para {presente ? 'marcar falta' : 'marcar presenca'}
                                        </span>
                                      </>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            )
                          })}
                          <td className="px-3 py-2 text-center font-semibold bg-muted/50 text-emerald-600">
                            {stats.totalPresencas}
                          </td>
                          <td className="px-3 py-2 text-center font-semibold bg-muted/50 text-red-600">
                            {stats.totalFaltas}
                          </td>
                          <td
                            className={cn(
                              'px-3 py-2 text-center font-semibold bg-muted/50',
                              stats.percentual >= 75
                                ? 'text-emerald-600'
                                : stats.percentual >= 50
                                ? 'text-amber-600'
                                : 'text-red-600'
                            )}
                          >
                            {stats.percentual}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

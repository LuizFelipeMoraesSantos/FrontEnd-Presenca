'use client'

import { useState, useEffect } from 'react'
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
import { CalendarDays, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { getEstudantes } from '@/lib/api' // mockEstudantes removido aqui
import type { Estudante } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function FaltasPage() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await getEstudantes()
        setEstudantes(data)
      } catch (error) {
        console.error('Erro ao carregar estudantes para faltas:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatório de Faltas</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhamento mensal de assiduidade dos alunos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Janeiro</SelectItem>
              <SelectItem value="1">Fevereiro</SelectItem>
              <SelectItem value="2">Março</SelectItem>
              <SelectItem value="3">Abril</SelectItem>
              <SelectItem value="4">Maio</SelectItem>
              <SelectItem value="5">Junho</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Presença</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--%</div>
            <p className="text-xs text-muted-foreground">Calculado com base no mês selecionado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Assiduidade</CardTitle>
          <CardDescription>
            Total de presenças registradas no sistema por aluno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {estudantes.length === 0 && !isLoading ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Nenhum aluno encontrado para gerar o relatório.
              </p>
            ) : (
              estudantes.map((aluno) => (
                <div key={aluno.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {aluno.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{aluno.nome}</p>
                      <p className="text-xs text-muted-foreground">UID: {aluno.uid}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">Dados do Banco</p>
                    <p className="text-xs text-muted-foreground">Sincronizado</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
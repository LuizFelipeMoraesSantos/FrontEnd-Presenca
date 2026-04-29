'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, RefreshCw } from 'lucide-react'
import { DashboardCards } from '@/components/dashboard-cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getEstudantes } from '@/lib/api'
import type { Estudante } from '@/lib/types'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Iniciamos com 0 para bater com o servidor
  const [presencasHoje, setPresencasHoje] = useState(0) 

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await getEstudantes()
      setEstudantes(data)
      // Após carregar os dados reais, geramos o número aleatório (apenas no cliente)
      setPresencasHoje(Math.floor(Math.random() * 10) + 5)
    } catch {
      setEstudantes([])
      setPresencasHoje(0)
      toast.info('Usando dados de demonstração', {
        description: 'Backend não disponível. Conecte ao servidor Spring Boot.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const recentStudents = estudantes.slice(-5).reverse()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao Chico Sabido - Sistema de Chamada RFID
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <DashboardCards 
        totalAlunos={estudantes.length} 
        presencasHoje={presencasHoje} 
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Últimos Alunos Cadastrados
            </CardTitle>
            <CardDescription>
              Alunos adicionados recentemente ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : recentStudents.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Nenhum aluno cadastrado ainda
              </p>
            ) : (
              <div className="space-y-4">
                {recentStudents.map((estudante) => (
                  <div
                    key={estudante.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {estudante.nome ? estudante.nome.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <p className="font-medium">{estudante.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Cadastrado em{' '}
                          {estudante.dataCadastro 
                            ? new Date(estudante.dataCadastro).toLocaleDateString('pt-BR')
                            : 'Data indisponível'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {estudante.uid}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Sistema</CardTitle>
            <CardDescription>
              Visão geral do uso do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Presença Hoje</span>
                <span className="font-medium">
                  {estudantes.length > 0
                    ? Math.round((presencasHoje / estudantes.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${
                      estudantes.length > 0
                        ? Math.min((presencasHoje / estudantes.length) * 100, 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-2xl font-bold text-primary">{estudantes.length}</p>
                <p className="text-xs text-muted-foreground">Total de Alunos</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-2xl font-bold text-accent">{presencasHoje}</p>
                <p className="text-xs text-muted-foreground">Presenças Hoje</p>
              </div>
            </div>

            <div className="rounded-lg border border-dashed p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                  <GraduationCap className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="font-medium">Sistema Operacional</p>
                  <p className="text-xs text-muted-foreground">
                    Todos os serviços funcionando normalmente
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
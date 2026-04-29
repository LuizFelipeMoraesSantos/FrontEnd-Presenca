'use client'

import { useState, useEffect } from 'react'
import { Users, RefreshCw, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { StudentsTable } from '@/components/students-table'
import { Button } from '@/components/ui/button'
import { getEstudantes, atualizarEstudante, deletarEstudante, mockEstudantes } from '@/lib/api'
import type { Estudante } from '@/lib/types'
import { toast } from 'sonner'

export default function AlunosPage() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [useMock, setUseMock] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await getEstudantes()
      setEstudantes(data)
      setUseMock(false)
    } catch {
      setEstudantes(mockEstudantes)
      setUseMock(true)
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

  const handleUpdate = async (id: number, uid: string, nome: string) => {
    if (useMock) {
      setEstudantes((prev) =>
        prev.map((e) => (e.id === id ? { ...e, uid, nome } : e))
      )
      toast.success('Aluno atualizado!', {
        description: `${nome} foi atualizado com sucesso.`,
      })
      return
    }

    try {
      await atualizarEstudante(id, uid, nome)
      toast.success('Aluno atualizado!', {
        description: `${nome} foi atualizado com sucesso.`,
      })
      fetchData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao atualizar', {
        description: message,
      })
      throw error
    }
  }

  const handleDelete = async (id: number) => {
    const estudante = estudantes.find((e) => e.id === id)
    
    if (useMock) {
      setEstudantes((prev) => prev.filter((e) => e.id !== id))
      toast.success('Aluno excluído!', {
        description: `${estudante?.nome} foi removido do sistema.`,
      })
      return
    }

    try {
      await deletarEstudante(id)
      toast.success('Aluno excluído!', {
        description: `${estudante?.nome} foi removido do sistema.`,
      })
      fetchData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao excluir', {
        description: message,
      })
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Gestão de Alunos</h1>
              <p className="text-sm text-muted-foreground">
                {estudantes.length} aluno{estudantes.length !== 1 ? 's' : ''} cadastrado{estudantes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Link href="/cadastrar">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Button>
          </Link>
        </div>
      </div>

      <StudentsTable
        estudantes={estudantes}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  )
}

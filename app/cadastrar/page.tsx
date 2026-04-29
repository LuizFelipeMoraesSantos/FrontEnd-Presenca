'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { StudentForm } from '@/components/student-form'
import { Button } from '@/components/ui/button'
import { cadastrarEstudante } from '@/lib/api'
import { toast } from 'sonner'

export default function CadastrarPage() {
  const router = useRouter()

  const handleSubmit = async (uid: string, nome: string) => {
    try {
      await cadastrarEstudante(uid, nome)
      toast.success('Aluno cadastrado!', {
        description: `${nome} foi adicionado ao sistema com sucesso.`,
      })
      router.push('/alunos')
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: string; status?: number } }
        if (axiosError.response?.status === 400 || axiosError.response?.data?.includes('já cadastrada')) {
          toast.error('Tag já cadastrada', {
            description: 'Este UID já está vinculado a outro aluno.',
          })
        } else {
          toast.error('Erro ao cadastrar', {
            description: axiosError.response?.data || 'Verifique a conexão com o servidor.',
          })
        }
      } else {
        // Modo demo: simular sucesso
        toast.success('Aluno cadastrado! (Demo)', {
          description: `${nome} seria adicionado ao sistema.`,
        })
        router.push('/alunos')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/alunos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Alunos
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Cadastrar Aluno</h1>
        <p className="text-muted-foreground">
          Adicione um novo aluno e vincule sua tag RFID
        </p>
      </div>

      <StudentForm onSubmit={handleSubmit} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Fingerprint, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cadastrarEstudante } from '@/lib/api'
import { toast } from 'sonner'

export function StudentForm() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [idBiometrico, setIdBiometrico] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim() || !idBiometrico.trim()) {
      toast.error('Por favor, preencha todos os campos.')
      return
    }

    const idNum = parseInt(idBiometrico, 10)
    if (isNaN(idNum) || idNum < 1 || idNum > 162) {
      toast.error('O ID Biométrico deve ser um número válido entre 1 e 162 (limite do sensor DY50).')
      return
    }

    setIsSubmitting(true)

    try {
      // Enviamos o ID Biométrico no parâmetro esperado pela API
      await cadastrarEstudante(idBiometrico.trim(), nome.trim())

      toast.success('Aluno cadastrado com sucesso!', {
        description: `${nome} foi vinculado ao ID Biométrico ${idBiometrico}.`,
      })
      
      setNome('')
      setIdBiometrico('')
      router.push('/alunos')
      router.refresh()
    } catch (error) {
      console.error('Erro ao cadastrar:', error)
      toast.error('Erro ao salvar o aluno no banco de dados.', {
        description: 'Verifique se a conexão com o servidor Spring Boot está ativa.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Cadastrar Novo Aluno</CardTitle>
        <CardDescription>
          Preencha os dados do aluno e defina a sua posição de registro no leitor biométrico DY50
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="nome"
                placeholder="Digite o nome do aluno"
                className="pl-10"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idBiometrico">ID de Registro Biométrico (Sensor DY50)</Label>
            <div className="relative">
              <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="idBiometrico"
                type="number"
                min="1"
                max="162"
                placeholder="Ex: 1"
                className="pl-10"
                value={idBiometrico}
                onChange={(e) => setIdBiometrico(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Insira o número correspondente à vaga que a digital deste aluno vai ocupar (ou já ocupa) na memória interna do sensor.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Salvando...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Aluno
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
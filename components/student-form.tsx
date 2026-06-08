'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, CheckCircle2, Wifi, WifiOff } from 'lucide-react'
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
import axios from 'axios'
import { toast } from 'sonner'

export function StudentForm() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [idBiometrico, setIdBiometrico] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEscutandoWifi, setIsEscutandoWifi] = useState(false)

  // URL do seu Backend Spring Boot
  const BACKEND_URL = 'http://192.168.1.102:8080'

  useEffect(() => {
    let interval: NodeJS.Timeout

    // Ativa a busca na fila do Spring Boot se o usuário clicou no botão de escuta
    if (isEscutandoWifi && !idBiometrico) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/estudantes/ultimo-uid`)
          
          if (response.data && response.data.uid && response.data.uid !== '') {
            setIdBiometrico(response.data.uid) // Preenche o estado correto que ativa o botão!
            setIsEscutandoWifi(false)          // Desliga a animação de pulso na tela
            toast.success(`Digital capturada via Wi-Fi! ID: ${response.data.uid}`)
          }
        } catch (err) {
          console.error("Aguardando sinal do sensor biométrico...", err)
        }
      }, 2000) // Consulta o servidor Java a cada 2 segundos
    }

    return () => { if (interval) clearInterval(interval) }
  }, [isEscutandoWifi, idBiometrico])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      toast.error('Por favor, digite o nome completo.')
      return
    }

    if (!idBiometrico) {
      toast.error('Nenhuma biometria capturada.')
      return
    }

    setIsSubmitting(true)

    try {
      // Envia os dados estruturados para o MySQL do XAMPP via @RequestParam da API
      await cadastrarEstudante(idBiometrico, nome.trim())

      toast.success('Aluno cadastrado com sucesso!', {
        description: `${nome} foi salvo e vinculado ao ID ${idBiometrico}.`,
      })
      
      setNome('')
      setIdBiometrico('')
      router.push('/alunos')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar aluno no backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Cadastrar Novo Aluno</CardTitle>
        <CardDescription>
          Envie a digital do leitor diretamente para o Frontend e salve no banco de dados
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

          <div className="space-y-3 rounded-lg border p-4 bg-muted/40">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" /> Captura Direta via Wi-Fi
            </Label>

            {!isEscutandoWifi && !idBiometrico ? (
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs gap-2"
                onClick={() => setIsEscutandoWifi(true)}
              >
                <Wifi className="h-3 w-3" />
                Vincular Digital via Wi-Fi
              </Button>
            ) : isEscutandoWifi ? (
              <div className="space-y-2">
                <div className="text-center p-4 border border-dashed rounded-md bg-background text-xs text-muted-foreground animate-pulse">
                  Conectado ao leitor biométrico... Coloque o dedo no sensor agora.
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs text-destructive gap-1"
                  onClick={() => setIsEscutandoWifi(false)}
                >
                  <WifiOff className="h-3 w-3" /> Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50/50 border border-green-200 p-3 rounded-md">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Digital Sincronizada!</p>
                  <p className="text-xs text-green-700">ID Pronto: {idBiometrico}</p>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !idBiometrico}>
            {isSubmitting ? 'Salvando...' : 'Finalizar Cadastro'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
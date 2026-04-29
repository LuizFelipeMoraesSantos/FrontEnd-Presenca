'use client'

import { useState, useCallback } from 'react'
import { User, CreditCard, UserPlus, Usb, Unplug } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSerial } from '@/hooks/use-serial'
import { cn } from '@/lib/utils'

interface StudentFormProps {
  onSubmit: (uid: string, nome: string) => Promise<void>
}

export function StudentForm({ onSubmit }: StudentFormProps) {
  const [nome, setNome] = useState('')
  const [uid, setUid] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSerialData = useCallback((data: string) => {
    setUid(data.toUpperCase())
  }, [])

  const { isSupported, isConnected, isConnecting, connect, disconnect, error } = useSerial({
    baudRate: 9600,
    onData: handleSerialData,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !uid.trim()) return

    setIsLoading(true)
    try {
      await onSubmit(uid.trim(), nome.trim())
      setNome('')
      setUid('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <UserPlus className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl">Cadastrar Novo Aluno</CardTitle>
        <CardDescription>
          Preencha os dados do aluno e vincule sua tag RFID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="nome"
                placeholder="Digite o nome do aluno"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="uid">UID da Tag RFID</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="uid"
                placeholder={isConnected ? "Aproxime a tag do leitor..." : "Ex: A1B2C3D4"}
                value={uid}
                onChange={(e) => setUid(e.target.value.toUpperCase())}
                className={cn(
                  "pl-10 font-mono",
                  isConnected && "border-green-500 focus-visible:ring-green-500"
                )}
                required
              />
            </div>
            
            {/* Arduino Connection */}
            <div className="flex items-center gap-2 pt-2">
              {isSupported ? (
                <Button
                  type="button"
                  variant={isConnected ? "outline" : "secondary"}
                  size="sm"
                  onClick={isConnected ? disconnect : connect}
                  disabled={isConnecting}
                  className={cn(
                    "gap-2",
                    isConnected && "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  )}
                >
                  {isConnecting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Conectando...
                    </>
                  ) : isConnected ? (
                    <>
                      <Unplug className="h-4 w-4" />
                      Desconectar Arduino
                    </>
                  ) : (
                    <>
                      <Usb className="h-4 w-4" />
                      Conectar Arduino
                    </>
                  )}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Use Chrome ou Edge para conectar o Arduino diretamente
                </p>
              )}
              
              {isConnected && (
                <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Conectado
                </span>
              )}
            </div>
            
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
            
            <p className="text-xs text-muted-foreground">
              {isConnected 
                ? "Aproxime a tag RFID do leitor para preencher automaticamente"
                : "Conecte o Arduino ou digite o código manualmente"
              }
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Cadastrando...
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

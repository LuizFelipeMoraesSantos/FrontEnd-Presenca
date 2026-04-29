'use client'

import { useState, useEffect } from 'react'
import { User, CreditCard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Estudante } from '@/lib/types'

interface EditStudentModalProps {
  estudante: Estudante | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: number, uid: string, nome: string) => Promise<void>
}

export function EditStudentModal({
  estudante,
  open,
  onOpenChange,
  onSave,
}: EditStudentModalProps) {
  const [nome, setNome] = useState('')
  const [uid, setUid] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (estudante) {
      setNome(estudante.nome)
      setUid(estudante.uid)
    }
  }, [estudante])

  const handleSave = async () => {
    if (!estudante || !nome.trim() || !uid.trim()) return
    setIsLoading(true)
    try {
      await onSave(estudante.id, uid.trim(), nome.trim())
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Aluno</DialogTitle>
          <DialogDescription>
            Atualize as informações do aluno abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nome">Nome do Aluno</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="edit-nome"
                placeholder="Digite o nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-uid">UID da Tag RFID</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="edit-uid"
                placeholder="Ex: A1B2C3D4"
                value={uid}
                onChange={(e) => setUid(e.target.value.toUpperCase())}
                className="pl-10 font-mono"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !nome.trim() || !uid.trim()}
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

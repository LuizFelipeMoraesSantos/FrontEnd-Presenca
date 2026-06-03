'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona o usuário para a rota de listagem de alunos assim que a aplicação carrega
    router.replace('/alunos')
  }, [router])

  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
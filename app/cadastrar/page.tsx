import { StudentForm } from "@/components/student-form"

// Força o Next.js a tratar essa rota como dinâmica, prevenindo erros de pré-renderização estática
export const dynamic = "force-dynamic"

export default function CadastrarPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <StudentForm />
    </div>
  )
}
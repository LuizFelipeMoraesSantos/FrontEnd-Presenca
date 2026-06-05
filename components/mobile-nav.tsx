"use client"

import { Menu, Users, UserPlus, CheckSquare, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const items = [
    {
      title: "Alunos",
      url: "/alunos",
      icon: Users,
    },
    {
      title: "Cadastrar",
      url: "/cadastrar",
      icon: UserPlus,
    },
    {
      title: "Chamada",
      url: "/chamada",
      icon: CheckSquare,
    },
    {
      title: "Faltas",
      url: "/faltas",
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="flex h-16 items-center border-b px-4 lg:hidden bg-background fixed top-0 left-0 right-0 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {/* Adicionado o SheetTitle com sr-only para cumprir a regra de acessibilidade sem alterar o design */}
          <div className="sr-only">
            <SheetTitle>Menu de Navegação</SheetTitle>
          </div>
          
          <div className="flex h-16 items-center px-6 font-semibold text-lg border-b">
            <span>Sistema Presença</span>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {items.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-2 font-semibold text-md">Sistema Presença</div>
    </div>
  )
}
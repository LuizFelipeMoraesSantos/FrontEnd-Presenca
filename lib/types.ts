export interface Estudante {
  id: number
  nome: string
  uid: string
  dataCadastro: string
}

export interface Presenca {
  id: number
  estudanteId: number
  estudanteNome: string
  dataHora: string
}

export interface DashboardStats {
  totalAlunos: number
  presencasHoje: number
}

export interface PresencaMensal {
  estudanteId: number
  estudanteNome: string
  presencas: string[] // datas em formato ISO
}

export interface RelatorioMensal {
  mes: number
  ano: number
  diasLetivos: number
  presencas: PresencaMensal[]
}

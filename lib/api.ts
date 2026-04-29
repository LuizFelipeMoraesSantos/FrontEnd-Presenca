import axios from 'axios'
import type { Estudante, Presenca, PresencaMensal } from './types'

const api = axios.create({
  // Ajustado para incluir o caminho do Controller
  baseURL: 'http://localhost:8080/api/estudantes', 
  headers: {
    'Content-Type': 'application/json',
  },
})

// Estudantes
export async function getEstudantes(): Promise<Estudante[]> {
  const response = await api.get<Estudante[]>('/')
  return response.data
}

export async function cadastrarEstudante(uid: string, nome: string): Promise<Estudante> {
  const response = await api.post<Estudante>('/cadastrar', null, {
    params: { uid, nome },
  })
  return response.data
}

export async function atualizarEstudante(id: number, uid: string, nome: string): Promise<Estudante> {
  const response = await api.put<Estudante>('/atualizar', null, {
    // Sincronizado com o novo parâmetro 'nome' do Back
    params: { id, uid, nome }, 
  })
  return response.data
}

export async function deletarEstudante(id: number): Promise<void> {
  await api.delete(`/deletar/${id}`)
}

// Chamada/Presença
export async function registrarChamada(uid: string): Promise<Presenca> {
  const response = await api.post<Presenca>('/chamada', null, {
    params: { uid },
  })
  return response.data
}

export async function getPresencasMensais(mes: number, ano: number): Promise<PresencaMensal[]> {
  const response = await api.get<PresencaMensal[]>('/presencas/mensal', {
    params: { mes, ano },
  })
  return response.data
}


export default api

import axios from 'axios'
import type { Estudante, Presenca, PresencaMensal } from './types'

// Alinhe este IP com o IPv4 do seu computador na rede local ("PEDRO FLASHNET")
const IP_SERVIDOR_LAN = '192.168.1.102'; 

const api = axios.create({
  baseURL: `http://${IP_SERVIDOR_LAN}:8080/api/estudantes`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// =========================================================================
// ESTUDANTES
// =========================================================================

export async function getEstudantes(): Promise<Estudante[]> {
  const response = await api.get<Estudante[]>('') 
  return response.data
}

// CORRIGIDO: Agora envia uid e nome no corpo do JSON para o @RequestBody do Spring Boot
export async function cadastrarEstudante(uid: string, nome: string): Promise<Estudante> {
  const response = await api.post<Estudante>('/cadastrar', { 
    uid, 
    nome 
  })
  return response.data
}

export async function atualizarEstudante(id: number, uid: string, nome: string): Promise<Estudante> {
  const response = await api.put<Estudante>('/atualizar', null, {
    params: { id, uid, nome }, 
  })
  return response.data
}

export async function deletarEstudante(id: number): Promise<void> {
  await api.delete(`/deletar/${id}`) 
}

// =========================================================================
// CHAMADA / PRESENÇA
// =========================================================================

// CORRIGIDO: Alinhado para bater na rota exata no singular (/chamada) do Spring Boot
export async function registrarChamada(uid: string): Promise<any> {
  const response = await api.post('/chamada', { 
    uid 
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
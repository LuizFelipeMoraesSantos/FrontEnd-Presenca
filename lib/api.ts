import axios from 'axios'
import type { Estudante, Presenca, PresencaMensal } from './types'

const api = axios.create({
  // URL ajustada para o IP local do seu backend Java
  baseURL: 'http://127.0.0.1:8080/api/estudantes',
  headers: {
    'Content-Type': 'application/json',
  },
})

// =========================================================================
// GESTÃO DE ESTUDANTES
// =========================================================================

// Listar todos os estudantes cadastrados
export async function getEstudantes(): Promise<Estudante[]> {
  const response = await api.get<Estudante[]>('') 
  return response.data
}

// Cadastrar um novo estudante associando o nome ao UID biométrico
export async function cadastrarEstudante(uid: string, nome: string): Promise<Estudante> {
  const response = await api.post<Estudante>('/cadastrar', null, {
    params: { uid, nome },
  })
  return response.data
}

// Atualizar os dados de identificação do estudante
export async function atualizarEstudante(id: number, uid: string, nome: string): Promise<Estudante> {
  const response = await api.put<Estudante>('/atualizar', null, {
    params: { id, uid, nome }, 
  })
  return response.data
}

// Excluir um estudante do sistema
export async function deletarEstudante(id: number): Promise<void> {
  await api.delete(`/deletar/${id}`) 
}

// =========================================================================
// GESTÃO DE CHAMADA / PRESENÇAS
// =========================================================================

// Registrar chamada eletrônica (usada pelo sensor Wi-Fi ou botão da tela de chamada)
export async function registrarChamada(uid: string): Promise<any> {
  const response = await api.post('/chamada', null, {
    params: { uid },
  })
  return response.data
}

// CORREÇÃO DO ERRO: Adicionada a função solicitada pela tela de faltas para inserção manual
export async function adicionarPresencaManual(uid: string): Promise<any> {
  const response = await api.post('/chamada', null, {
    params: { uid },
  })
  return response.data
}

// CORREÇÃO DO ERRO: Adicionada a função solicitada para remover presenças/reverter faltas
export async function removerPresenca(idPresenca: number): Promise<void> {
  // Ajuste esta rota caso mude o endpoint de exclusão de presenças no seu Java
  await api.delete(`/presencas/${idPresenca}`)
}

// Consultar o relatório de frequências mensais
export async function getPresencasMensais(mes: number, ano: number): Promise<PresencaMensal[]> {
  const response = await api.get<PresencaMensal[]>('/presencas/mensal', {
    params: { mes, ano },
  })
  return response.data
}

export default api
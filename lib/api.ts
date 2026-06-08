import axios from 'axios'
import type { Estudante } from './types'

// URL base apontando diretamente para o contexto do seu Spring Boot
const API_URL = 'http://localhost:8080/api/estudantes'

// Instância configurada do Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 1. LISTAR ESTUDANTES
export async function getEstudantes(): Promise<Estudante[]> {
  const response = await api.get<Estudante[]>('')
  return response.data
}

// 2. EFETUAR CADASTRO (Alinhado com @RequestParam do Java)
export async function cadastrarEstudante(uid: string, nome: string): Promise<Estudante> {
  // Envia os dados encapsulados como parâmetros de URL (Query String)
  const response = await api.post<Estudante>(`/cadastrar?uid=${encodeURIComponent(uid)}&nome=${encodeURIComponent(nome)}`)
  return response.data
}

// 3. ATUALIZAR ESTUDANTE
export async function atualizarEstudante(id: number, uid: string, nome: string): Promise<Estudante> {
  const params = `id=${encodeURIComponent(String(id))}&uid=${encodeURIComponent(uid)}&nome=${encodeURIComponent(nome)}`
  const response = await api.put<Estudante>(`/atualizar?${params}`)
  return response.data
}

// 3. REGISTRAR PRESENÇA / CHAMADA (Alinhado com @RequestParam do Java)
export async function registrarPresenca(uid: string): Promise<{ status: string; nome: string; uid: string }> {
  // Envia o UID capturado pelo ESP32 via Query String para processamento
  const response = await api.post<{ status: string; nome: string; uid: string }>(`/chamada?uid=${encodeURIComponent(uid)}`)
  return response.data
}

// 4. OBTER ÚLTIMO UID BIOMÉTRICO CAPTURADO
export async function getUltimoUid(): Promise<{ uid: string }> {
  const response = await api.get<{ uid: string }>('/ultimo-uid')
  return response.data
}

// 5. DELETAR ESTUDANTE
export async function deletarEstudante(id: number): Promise<void> {
  await api.delete(`/deletar/${id}`)
}
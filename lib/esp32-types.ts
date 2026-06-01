// ESP32-C6 LCD 1.47" - 172x320 pixels
export const ESP32_LCD_WIDTH = 172
export const ESP32_LCD_HEIGHT = 320

// Tipos de tela do display
export type ScreenType = 
  | 'selection'      // Tela de selecao
  | 'reading'        // Lendo digital
  | 'confirmed'      // Presenca confirmada
  | 'error'          // Erro na leitura
  | 'offline'        // Sem conexao

// Dados do aluno para exibicao
export interface StudentDisplayData {
  nome: string
  nomeAbreviado: string
  ra: string
  disciplina: string
  sala: string
  horario: string
  faltas: number
  faltasPermitidas: number
  frequencia: number
  frequenciaMinima: number
}

// Comandos que podem ser enviados para a ESP32
export type ESP32Command = 
  | { type: 'SHOW_SCREEN'; screen: ScreenType }
  | { type: 'SET_STUDENT'; data: StudentDisplayData }
  | { type: 'SET_ROOM'; sala: string; disciplina: string }
  | { type: 'PING' }
  | { type: 'RESET' }

// Eventos que a ESP32 pode enviar
export type ESP32Event = 
  | { type: 'FINGERPRINT_DETECTED'; fingerprintId: number }
  | { type: 'FINGERPRINT_REGISTERED'; fingerprintId: number }
  | { type: 'BUTTON_PRESSED'; button: 'register' | 'cloud' | 'cancel' }
  | { type: 'READY' }
  | { type: 'ERROR'; message: string }
  | { type: 'PONG' }

// Protocolo de comunicacao serial (JSON simplificado)
// Formato de envio: CMD:<tipo>:<dados_json>\n
// Formato de recepcao: EVT:<tipo>:<dados_json>\n

export function serializeCommand(cmd: ESP32Command): string {
  return `CMD:${cmd.type}:${JSON.stringify(cmd)}\n`
}

export function parseEvent(line: string): ESP32Event | null {
  try {
    if (!line.startsWith('EVT:')) return null
    
    const parts = line.substring(4).split(':')
    if (parts.length < 2) return null
    
    const type = parts[0]
    const dataStr = parts.slice(1).join(':')
    const data = JSON.parse(dataStr)
    
    return { type, ...data } as ESP32Event
  } catch {
    // Fallback para formato simples (ex: FINGERPRINT:123)
    const parts = line.split(':')
    if (parts.length === 2 && parts[0] === 'FINGERPRINT') {
      return { type: 'FINGERPRINT_DETECTED', fingerprintId: parseInt(parts[1], 10) }
    }
    if (parts[0] === 'READY') {
      return { type: 'READY' }
    }
    if (parts[0] === 'PONG') {
      return { type: 'PONG' }
    }
    return null
  }
}

// Dados de exemplo para testes
export const MOCK_STUDENT: StudentDisplayData = {
  nome: 'Lucas Ferreira Santos',
  nomeAbreviado: 'Lucas F. Santos',
  ra: '2024001823',
  disciplina: 'Redes de Computadores',
  sala: '203 — Bloco B',
  horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  faltas: 3,
  faltasPermitidas: 5,
  frequencia: 72,
  frequenciaMinima: 75,
}

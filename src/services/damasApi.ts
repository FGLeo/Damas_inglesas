import type { ConfiguracionPartida, EstadoPartida, Movimiento } from '../../shared/damas/tipos'

export type RespuestaNuevaPartida = {
  ok: true
  gameId: string
  estado: EstadoPartida
}

export type RespuestaError = {
  ok: false
  error: string
}

export type RespuestaMoverHumano =
  | { ok: true; estado: EstadoPartida }
  | RespuestaError

export type RespuestaMoverBot =
  | {
      ok: true
      movimiento: Movimiento | null
      estado: EstadoPartida
      stats: { profundidad: number; nodos: number; ms: number }
    }
  | RespuestaError

const postJson = async <T>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json()) as T
  return data
}

export const apiCrearNuevaPartida = (configuracion: ConfiguracionPartida) =>
  postJson<RespuestaNuevaPartida | RespuestaError>('/api/damas/nueva', configuracion)

export const apiMoverHumano = (gameId: string, movimiento: Movimiento) =>
  postJson<RespuestaMoverHumano>('/api/damas/mover', { gameId, movimiento })

export const apiMoverBot = (gameId: string) =>
  postJson<RespuestaMoverBot>('/api/damas/bot/mover', { gameId })

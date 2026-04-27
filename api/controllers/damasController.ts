import type { Request, Response } from 'express'
import type { ConfiguracionPartida, Movimiento } from '../../shared/damas/tipos'
import { crearPartida, moverBot, moverHumano } from '../services/partidaServicio'

const esColor = (v: unknown): v is ConfiguracionPartida['colorHumano'] => v === 'rojas' || v === 'blancas'
const esDificultad = (v: unknown): v is ConfiguracionPartida['dificultad'] => v === 'facil' || v === 'media' || v === 'dificil'

export const postNuevaPartida = (req: Request, res: Response) => {
  const { colorHumano, dificultad } = (req.body ?? {}) as Partial<ConfiguracionPartida>
  if (!esColor(colorHumano) || !esDificultad(dificultad)) {
    res.status(400).json({ ok: false, error: 'Parámetros inválidos' })
    return
  }
  const partida = crearPartida({ colorHumano, dificultad })
  res.status(200).json({ ok: true, gameId: partida.id, estado: partida.estado })
}

export const postMoverHumano = (req: Request, res: Response) => {
  const { gameId, movimiento } = (req.body ?? {}) as { gameId?: string; movimiento?: Movimiento }
  if (!gameId || typeof gameId !== 'string' || !movimiento) {
    res.status(400).json({ ok: false, error: 'Parámetros inválidos' })
    return
  }
  const r = moverHumano(gameId, movimiento)
  if (!r.ok) {
    res.status(400).json(r)
    return
  }
  res.status(200).json(r)
}

export const postMoverBot = (req: Request, res: Response) => {
  const { gameId } = (req.body ?? {}) as { gameId?: string }
  if (!gameId || typeof gameId !== 'string') {
    res.status(400).json({ ok: false, error: 'Parámetros inválidos' })
    return
  }
  const r = moverBot(gameId)
  if (!r.ok) {
    res.status(400).json(r)
    return
  }
  res.status(200).json(r)
}

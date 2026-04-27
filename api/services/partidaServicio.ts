import crypto from 'crypto'
import type { ConfiguracionPartida, MotivoFinPartida, Movimiento } from '../../shared/damas/tipos'
import { aplicarMovimiento, crearEstadoInicial, obtenerColorOpuesto } from '../../shared/damas/reglas'
import { elegirMovimientoBot } from '../engine/bot/minimaxAlphaBeta'
import { actualizarEstado, guardarPartida, obtenerPartida } from '../store/almacenPartidas'

export const crearPartida = (configuracion: ConfiguracionPartida) => {
  const id = crypto.randomUUID()
  const estado = crearEstadoInicial()
  guardarPartida({ id, estado, configuracion })
  return { id, estado }
}

export const moverHumano = (id: string, movimiento: Movimiento) => {
  const partida = obtenerPartida(id)
  if (!partida) return { ok: false as const, error: 'Partida no encontrada' }
  if (partida.estado.ganador) return { ok: false as const, error: 'La partida ya terminó' }
  if (partida.estado.turno !== partida.configuracion.colorHumano) {
    return { ok: false as const, error: 'No es tu turno' }
  }

  const aplicado = aplicarMovimiento(partida.estado, movimiento)
  if (!aplicado.ok) return { ok: false as const, error: aplicado.error }
  const actualizada = actualizarEstado(id, aplicado.estado)
  if (!actualizada) return { ok: false as const, error: 'No se pudo actualizar la partida' }
  return { ok: true as const, estado: actualizada.estado }
}

export const moverBot = (id: string) => {
  const partida = obtenerPartida(id)
  if (!partida) return { ok: false as const, error: 'Partida no encontrada' }
  if (partida.estado.ganador) return { ok: false as const, error: 'La partida ya terminó' }
  const colorBot = obtenerColorOpuesto(partida.configuracion.colorHumano)
  if (partida.estado.turno !== colorBot) {
    return { ok: false as const, error: 'No es el turno del bot' }
  }

  const { movimiento, stats } = elegirMovimientoBot(partida.estado, colorBot, partida.configuracion.dificultad)
  if (!movimiento) {
    let piezasBot = 0
    for (const fila of partida.estado.tablero) {
      for (const p of fila) {
        if (!p) continue
        if (p.color === colorBot) piezasBot += 1
      }
    }
    const motivoFin: MotivoFinPartida = piezasBot === 0 ? 'sin_piezas' : 'sin_movimientos'
    const estadoFinal = { ...partida.estado, ganador: partida.configuracion.colorHumano, motivoFin }
    const actualizada = actualizarEstado(id, estadoFinal)
    if (!actualizada) return { ok: false as const, error: 'No se pudo actualizar la partida' }
    return { ok: true as const, movimiento: null, estado: actualizada.estado, stats }
  }

  const aplicado = aplicarMovimiento(partida.estado, movimiento)
  if (!aplicado.ok) return { ok: false as const, error: aplicado.error }
  const actualizada = actualizarEstado(id, aplicado.estado)
  if (!actualizada) return { ok: false as const, error: 'No se pudo actualizar la partida' }
  return { ok: true as const, movimiento, estado: actualizada.estado, stats }
}

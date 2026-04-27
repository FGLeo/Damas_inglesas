import { describe, expect, it } from 'vitest'
import type { EstadoPartida } from './tipos'
import { aplicarMovimiento, crearEstadoInicial, obtenerMovimientosLegales } from './reglas'

const tableroVacio = () => Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null))

describe('reglas de damas inglesas', () => {
  it('crea una posición inicial con 12 piezas por lado', () => {
    const estado = crearEstadoInicial()
    let rojas = 0
    let blancas = 0
    for (const fila of estado.tablero) {
      for (const p of fila) {
        if (!p) continue
        if (p.color === 'rojas') rojas += 1
        else blancas += 1
      }
    }
    expect(rojas).toBe(12)
    expect(blancas).toBe(12)
  })

  it('marca motivo de fin al quedarse sin movimientos', () => {
    const estado: EstadoPartida = {
      tablero: tableroVacio(),
      turno: 'rojas',
    }

    estado.tablero[5][0] = { id: 'r1', color: 'rojas', esDama: false }
    estado.tablero[7][0] = { id: 'b1', color: 'blancas', esDama: false }

    const aplicado = aplicarMovimiento(estado, { desde: { fila: 5, col: 0 }, hasta: { fila: 4, col: 1 } })
    expect(aplicado.ok).toBe(true)
    expect(aplicado.estado.ganador).toBe('rojas')
    expect(aplicado.estado.motivoFin).toBe('sin_movimientos')
  })

  it('obliga a capturar si hay capturas disponibles', () => {
    const estado: EstadoPartida = {
      tablero: tableroVacio(),
      turno: 'rojas',
    }

    estado.tablero[5][0] = { id: 'r1', color: 'rojas', esDama: false }
    estado.tablero[4][1] = { id: 'b1', color: 'blancas', esDama: false }

    const legales = obtenerMovimientosLegales(estado)
    expect(legales.length).toBe(1)
    expect(legales[0]).toMatchObject({
      desde: { fila: 5, col: 0 },
      hasta: { fila: 3, col: 2 },
      captura: { fila: 4, col: 1 },
    })
  })

  it('no permite mover una ficha sin captura si existe otra captura', () => {
    const estado: EstadoPartida = {
      tablero: tableroVacio(),
      turno: 'rojas',
    }

    estado.tablero[5][0] = { id: 'r1', color: 'rojas', esDama: false }
    estado.tablero[5][4] = { id: 'r2', color: 'rojas', esDama: false }
    estado.tablero[4][1] = { id: 'b1', color: 'blancas', esDama: false }

    const legalesR2 = obtenerMovimientosLegales(estado, { fila: 5, col: 4 })
    expect(legalesR2.length).toBe(0)
  })

  it('fuerza multi-captura con la misma ficha', () => {
    const estado: EstadoPartida = {
      tablero: tableroVacio(),
      turno: 'rojas',
    }

    estado.tablero[5][0] = { id: 'r1', color: 'rojas', esDama: false }
    estado.tablero[4][1] = { id: 'b1', color: 'blancas', esDama: false }
    estado.tablero[2][3] = { id: 'b2', color: 'blancas', esDama: false }

    const primero = { desde: { fila: 5, col: 0 }, hasta: { fila: 3, col: 2 }, captura: { fila: 4, col: 1 } }
    const aplicado = aplicarMovimiento(estado, primero)
    expect(aplicado.ok).toBe(true)
    expect(aplicado.estado.turno).toBe('rojas')
    expect(aplicado.estado.debeContinuarCon).toEqual({ fila: 3, col: 2 })

    const legales = obtenerMovimientosLegales(aplicado.estado)
    expect(legales.length).toBe(1)
    expect(legales[0]).toMatchObject({
      desde: { fila: 3, col: 2 },
      hasta: { fila: 1, col: 4 },
      captura: { fila: 2, col: 3 },
    })
  })

  it('si se corona durante una captura, el turno termina y no continúa capturando', () => {
    const estado: EstadoPartida = {
      tablero: tableroVacio(),
      turno: 'rojas',
    }

    estado.tablero[2][1] = { id: 'r1', color: 'rojas', esDama: false }
    estado.tablero[1][2] = { id: 'b1', color: 'blancas', esDama: false }
    estado.tablero[1][4] = { id: 'b2', color: 'blancas', esDama: false }

    const aplicado = aplicarMovimiento(estado, { desde: { fila: 2, col: 1 }, hasta: { fila: 0, col: 3 }, captura: { fila: 1, col: 2 } })
    expect(aplicado.ok).toBe(true)
    expect(aplicado.estado.turno).toBe('blancas')
    expect(aplicado.estado.debeContinuarCon).toBeUndefined()
    expect(aplicado.estado.tablero[0][3]?.esDama).toBe(true)
    expect(aplicado.estado.tablero[1][4]).not.toBeNull()
  })
})

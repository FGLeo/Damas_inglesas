import type { ColorFicha, EstadoPartida, Movimiento } from '../../../shared/damas/tipos'
import { aplicarMovimiento, obtenerColorOpuesto, obtenerMovimientosLegales } from '../../../shared/damas/reglas'

export type EstadisticasBot = {
  profundidad: number
  nodos: number
  ms: number
}

const puntuar = (estado: EstadoPartida, colorBot: ColorFicha) => {
  if (estado.ganador) {
    if (estado.ganador === colorBot) return 1_000_000
    return -1_000_000
  }

  let total = 0
  for (let fila = 0; fila < 8; fila += 1) {
    for (let col = 0; col < 8; col += 1) {
      const p = estado.tablero[fila][col]
      if (!p) continue
      const valorBase = p.esDama ? 3 : 1
      const avance = p.color === 'rojas' ? (7 - fila) : fila
      const bonusAvance = p.esDama ? 0 : avance * 0.05
      const signo = p.color === colorBot ? 1 : -1
      total += signo * (valorBase + bonusAvance)
    }
  }

  const movilidad = obtenerMovimientosLegales(estado).length
  const signoMov = estado.turno === colorBot ? 1 : -1
  total += signoMov * movilidad * 0.02

  return total
}

const ordenarMovimientos = (movimientos: Movimiento[]) =>
  movimientos.slice().sort((a, b) => {
    const ac = a.captura ? 1 : 0
    const bc = b.captura ? 1 : 0
    if (ac !== bc) return bc - ac
    return 0
  })

type ResultadoBusqueda = {
  valor: number
  mejor?: Movimiento
  nodos: number
}

const minimax = (
  estado: EstadoPartida,
  profundidad: number,
  alpha: number,
  beta: number,
  colorBot: ColorFicha,
  inicioMs: number,
  limiteMs: number | null,
): ResultadoBusqueda => {
  const ahora = Date.now()
  if (limiteMs !== null && ahora - inicioMs >= limiteMs) {
    return { valor: puntuar(estado, colorBot), nodos: 1 }
  }

  if (profundidad <= 0 || estado.ganador) {
    return { valor: puntuar(estado, colorBot), nodos: 1 }
  }

  const movimientos = ordenarMovimientos(obtenerMovimientosLegales(estado))
  if (movimientos.length === 0) {
    const ganador = obtenerColorOpuesto(estado.turno)
    const estadoTerminal: EstadoPartida = { ...estado, ganador }
    return { valor: puntuar(estadoTerminal, colorBot), nodos: 1 }
  }

  const maximizando = estado.turno === colorBot
  let mejor: Movimiento | undefined
  let nodos = 0

  if (maximizando) {
    let mejorValor = -Infinity
    for (const mov of movimientos) {
      const aplicado = aplicarMovimiento(estado, mov)
      const hijo = aplicado.estado
      const res = minimax(hijo, profundidad - 1, alpha, beta, colorBot, inicioMs, limiteMs)
      nodos += res.nodos
      if (res.valor > mejorValor) {
        mejorValor = res.valor
        mejor = mov
      }
      alpha = Math.max(alpha, mejorValor)
      if (beta <= alpha) break
    }
    return { valor: mejorValor, mejor, nodos }
  }

  let peorValor = Infinity
  for (const mov of movimientos) {
    const aplicado = aplicarMovimiento(estado, mov)
    const hijo = aplicado.estado
    const res = minimax(hijo, profundidad - 1, alpha, beta, colorBot, inicioMs, limiteMs)
    nodos += res.nodos
    if (res.valor < peorValor) {
      peorValor = res.valor
      mejor = mov
    }
    beta = Math.min(beta, peorValor)
    if (beta <= alpha) break
  }
  return { valor: peorValor, mejor, nodos }
}

export const elegirMovimientoBot = (estado: EstadoPartida, colorBot: ColorFicha, dificultad: 'facil' | 'media' | 'dificil') => {
  const profundidad = dificultad === 'facil' ? 2 : dificultad === 'media' ? 6 : 10
  const limiteMs = dificultad === 'dificil' ? 2200 : dificultad === 'media' ? 900 : 200
  const inicio = Date.now()
  const resultado = minimax(estado, profundidad, -Infinity, Infinity, colorBot, inicio, limiteMs)
  const ms = Date.now() - inicio
  const stats: EstadisticasBot = { profundidad, nodos: resultado.nodos, ms }
  return { movimiento: resultado.mejor ?? null, stats }
}

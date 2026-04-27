import type { ColorFicha, Coordenadas, EstadoPartida, Movimiento, Pieza } from './tipos'

const TAM = 8

const dentro = (c: Coordenadas) => c.fila >= 0 && c.fila < TAM && c.col >= 0 && c.col < TAM

const esCasillaOscura = (c: Coordenadas) => (c.fila + c.col) % 2 === 1

const clonarTablero = (tablero: EstadoPartida['tablero']) => tablero.map((fila) => fila.slice())

const colorOpuesto = (c: ColorFicha): ColorFicha => (c === 'rojas' ? 'blancas' : 'rojas')

export const crearEstadoInicial = (): EstadoPartida => {
  const tablero: Array<Array<Pieza | null>> = Array.from({ length: TAM }, () =>
    Array.from({ length: TAM }, () => null),
  )

  let id = 1
  for (let fila = 0; fila < 3; fila += 1) {
    for (let col = 0; col < TAM; col += 1) {
      const c = { fila, col }
      if (!esCasillaOscura(c)) continue
      tablero[fila][col] = { id: `b_${id++}`, color: 'blancas', esDama: false }
    }
  }

  id = 1
  for (let fila = 5; fila < TAM; fila += 1) {
    for (let col = 0; col < TAM; col += 1) {
      const c = { fila, col }
      if (!esCasillaOscura(c)) continue
      tablero[fila][col] = { id: `r_${id++}`, color: 'rojas', esDama: false }
    }
  }

  return {
    tablero,
    turno: 'rojas',
  }
}

export const obtenerPieza = (estado: EstadoPartida, c: Coordenadas) => {
  if (!dentro(c)) return null
  return estado.tablero[c.fila][c.col]
}

const direccionesPara = (pieza: Pieza) => {
  if (pieza.esDama) return [-1, 1]
  return [pieza.color === 'rojas' ? -1 : 1]
}

const generarCapturasDesde = (estado: EstadoPartida, desde: Coordenadas) => {
  const pieza = obtenerPieza(estado, desde)
  if (!pieza) return [] as Movimiento[]
  if (pieza.color !== estado.turno) return [] as Movimiento[]

  const movimientos: Movimiento[] = []
  const dirs = direccionesPara(pieza)
  for (const df of dirs) {
    for (const dc of [-1, 1]) {
      const medio = { fila: desde.fila + df, col: desde.col + dc }
      const destino = { fila: desde.fila + 2 * df, col: desde.col + 2 * dc }
      if (!dentro(medio) || !dentro(destino)) continue
      if (!esCasillaOscura(destino)) continue
      const piezaMedio = obtenerPieza(estado, medio)
      const piezaDestino = obtenerPieza(estado, destino)
      if (!piezaMedio || piezaDestino) continue
      if (piezaMedio.color === pieza.color) continue
      movimientos.push({ desde, hasta: destino, captura: medio })
    }
  }
  return movimientos
}

const generarSimplesDesde = (estado: EstadoPartida, desde: Coordenadas) => {
  const pieza = obtenerPieza(estado, desde)
  if (!pieza) return [] as Movimiento[]
  if (pieza.color !== estado.turno) return [] as Movimiento[]

  const movimientos: Movimiento[] = []
  const dirs = direccionesPara(pieza)
  for (const df of dirs) {
    for (const dc of [-1, 1]) {
      const destino = { fila: desde.fila + df, col: desde.col + dc }
      if (!dentro(destino)) continue
      if (!esCasillaOscura(destino)) continue
      if (obtenerPieza(estado, destino)) continue
      movimientos.push({ desde, hasta: destino })
    }
  }
  return movimientos
}

const todasLasPiezasDelTurno = (estado: EstadoPartida) => {
  const coords: Coordenadas[] = []
  for (let fila = 0; fila < TAM; fila += 1) {
    for (let col = 0; col < TAM; col += 1) {
      const pieza = estado.tablero[fila][col]
      if (!pieza) continue
      if (pieza.color !== estado.turno) continue
      coords.push({ fila, col })
    }
  }
  return coords
}

const mismaCoordenada = (a: Coordenadas, b: Coordenadas) => a.fila === b.fila && a.col === b.col

export const obtenerMovimientosLegales = (estado: EstadoPartida, origen?: Coordenadas) => {
  if (estado.ganador) return [] as Movimiento[]

  if (estado.debeContinuarCon) {
    return generarCapturasDesde(estado, estado.debeContinuarCon)
  }

  const piezas = todasLasPiezasDelTurno(estado)
  const capturasGlobales = piezas.flatMap((c) => generarCapturasDesde(estado, c))
  if (capturasGlobales.length > 0) {
    if (!origen) return capturasGlobales
    return capturasGlobales.filter((m) => mismaCoordenada(m.desde, origen))
  }

  if (!origen) return piezas.flatMap((c) => generarSimplesDesde(estado, c))
  return generarSimplesDesde(estado, origen)
}

export const esMovimientoLegal = (estado: EstadoPartida, movimiento: Movimiento) => {
  const legales = obtenerMovimientosLegales(estado, movimiento.desde)
  return legales.some((m) => {
    const capturaOk = (!m.captura && !movimiento.captura) ||
      (m.captura && movimiento.captura && mismaCoordenada(m.captura, movimiento.captura))
    return capturaOk && mismaCoordenada(m.desde, movimiento.desde) && mismaCoordenada(m.hasta, movimiento.hasta)
  })
}

const coronarSiCorresponde = (pieza: Pieza, en: Coordenadas) => {
  if (pieza.esDama) return pieza
  if (pieza.color === 'rojas' && en.fila === 0) return { ...pieza, esDama: true }
  if (pieza.color === 'blancas' && en.fila === TAM - 1) return { ...pieza, esDama: true }
  return pieza
}

const contarPiezas = (estado: EstadoPartida) => {
  let rojas = 0
  let blancas = 0
  for (let fila = 0; fila < TAM; fila += 1) {
    for (let col = 0; col < TAM; col += 1) {
      const p = estado.tablero[fila][col]
      if (!p) continue
      if (p.color === 'rojas') rojas += 1
      else blancas += 1
    }
  }
  return { rojas, blancas }
}

const resolverGanador = (estado: EstadoPartida): EstadoPartida => {
  const { rojas, blancas } = contarPiezas(estado)
  if (rojas === 0) return { ...estado, ganador: 'blancas', debeContinuarCon: undefined, motivoFin: estado.motivoFin ?? 'sin_piezas' }
  if (blancas === 0) return { ...estado, ganador: 'rojas', debeContinuarCon: undefined, motivoFin: estado.motivoFin ?? 'sin_piezas' }
  const legales = obtenerMovimientosLegales(estado)
  if (legales.length > 0) return estado
  return { ...estado, ganador: colorOpuesto(estado.turno), debeContinuarCon: undefined, motivoFin: estado.motivoFin ?? 'sin_movimientos' }
}

export const aplicarMovimiento = (estado: EstadoPartida, movimiento: Movimiento) => {
  if (!esMovimientoLegal(estado, movimiento)) {
    return { ok: false as const, error: 'Movimiento ilegal', estado }
  }

  const tablero = clonarTablero(estado.tablero)
  const pieza = tablero[movimiento.desde.fila][movimiento.desde.col]
  if (!pieza) {
    return { ok: false as const, error: 'No hay pieza en el origen', estado }
  }

  const esCoronacion = !pieza.esDama && (
    (pieza.color === 'rojas' && movimiento.hasta.fila === 0) ||
    (pieza.color === 'blancas' && movimiento.hasta.fila === TAM - 1)
  )

  tablero[movimiento.desde.fila][movimiento.desde.col] = null
  tablero[movimiento.hasta.fila][movimiento.hasta.col] = pieza

  if (movimiento.captura) {
    tablero[movimiento.captura.fila][movimiento.captura.col] = null
  }

  let estadoNuevo: EstadoPartida = {
    ...estado,
    tablero,
  }

  if (movimiento.captura) {
    const piezaMovida = tablero[movimiento.hasta.fila][movimiento.hasta.col]
    if (piezaMovida) {
      tablero[movimiento.hasta.fila][movimiento.hasta.col] = coronarSiCorresponde(piezaMovida, movimiento.hasta)
    }

    const { rojas, blancas } = contarPiezas(estadoNuevo)
    if (rojas === 0) {
      estadoNuevo.ganador = 'blancas'
      estadoNuevo.motivoFin = 'sin_piezas'
      return { ok: true as const, estado: estadoNuevo }
    }
    if (blancas === 0) {
      estadoNuevo.ganador = 'rojas'
      estadoNuevo.motivoFin = 'sin_piezas'
      return { ok: true as const, estado: estadoNuevo }
    }

    if (esCoronacion) {
      estadoNuevo.debeContinuarCon = undefined
      estadoNuevo.turno = colorOpuesto(estadoNuevo.turno)
      estadoNuevo = resolverGanador(estadoNuevo)
      return { ok: true as const, estado: estadoNuevo }
    }

    const puedeSeguir = generarCapturasDesde(estadoNuevo, movimiento.hasta)
    if (puedeSeguir.length > 0) {
      estadoNuevo.debeContinuarCon = movimiento.hasta
      return { ok: true as const, estado: estadoNuevo }
    }

    estadoNuevo.debeContinuarCon = undefined
    estadoNuevo.turno = colorOpuesto(estadoNuevo.turno)
    estadoNuevo = resolverGanador(estadoNuevo)
    return { ok: true as const, estado: estadoNuevo }
  }

  const piezaMovida = tablero[movimiento.hasta.fila][movimiento.hasta.col]
  if (piezaMovida) {
    tablero[movimiento.hasta.fila][movimiento.hasta.col] = coronarSiCorresponde(piezaMovida, movimiento.hasta)
  }

  estadoNuevo.turno = colorOpuesto(estadoNuevo.turno)
  estadoNuevo = resolverGanador(estadoNuevo)
  return { ok: true as const, estado: estadoNuevo }
}

export const obtenerColorOpuesto = colorOpuesto

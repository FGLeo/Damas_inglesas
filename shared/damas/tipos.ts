export type ColorFicha = 'rojas' | 'blancas'

export type DificultadBot = 'facil' | 'media' | 'dificil'

export type Coordenadas = {
  fila: number
  col: number
}

export type Pieza = {
  id: string
  color: ColorFicha
  esDama: boolean
}

export type Movimiento = {
  desde: Coordenadas
  hasta: Coordenadas
  captura?: Coordenadas
}

export type MotivoFinPartida = 'sin_piezas' | 'sin_movimientos' | 'rendicion'

export type EstadoPartida = {
  tablero: Array<Array<Pieza | null>>
  turno: ColorFicha
  ganador?: ColorFicha
  debeContinuarCon?: Coordenadas
  motivoFin?: MotivoFinPartida
}

export type ConfiguracionPartida = {
  colorHumano: ColorFicha
  dificultad: DificultadBot
}

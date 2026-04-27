import type { ConfiguracionPartida, EstadoPartida } from '../../shared/damas/tipos'

export type PartidaGuardada = {
  id: string
  estado: EstadoPartida
  configuracion: ConfiguracionPartida
}

const partidas = new Map<string, PartidaGuardada>()

export const guardarPartida = (partida: PartidaGuardada) => {
  partidas.set(partida.id, partida)
}

export const obtenerPartida = (id: string) => partidas.get(id) ?? null

export const actualizarEstado = (id: string, estado: EstadoPartida) => {
  const partida = partidas.get(id)
  if (!partida) return null
  const nueva: PartidaGuardada = { ...partida, estado }
  partidas.set(id, nueva)
  return nueva
}

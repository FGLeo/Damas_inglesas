import { create } from 'zustand'
import type { ColorFicha, ConfiguracionPartida, EstadoPartida, Movimiento } from '../../shared/damas/tipos'
import { apiCrearNuevaPartida, apiMoverBot, apiMoverHumano } from '../services/damasApi'
import { obtenerColorOpuesto } from '../../shared/damas/reglas'

type TemaUI = 'oscuro' | 'claro'

type ConfiguracionUI = {
  tema: TemaUI
  colorFichasRojas: string
  colorFichasBlancas: string
}

type EstadoUI = {
  gameId: string | null
  configuracionPartida: ConfiguracionPartida
  configuracionUI: ConfiguracionUI
  estadoPartida: EstadoPartida | null
  estaPensandoBot: boolean
  error: string | null
  tiempoRojasMs: number
  tiempoBlancasMs: number
  ultimasStatsBot: { profundidad: number; nodos: number; ms: number } | null
}

type Acciones = {
  setConfiguracionPartida: (parcial: Partial<ConfiguracionPartida>) => void
  setConfiguracionUI: (parcial: Partial<ConfiguracionUI>) => void
  crearNueva: () => Promise<void>
  enviarMovimientoHumano: (movimiento: Movimiento) => Promise<void>
  solicitarMovimientoBot: () => Promise<void>
  rendirse: () => void
  reiniciar: () => Promise<void>
  tickReloj: (deltaMs: number) => void
}

const configPartidaInicial: ConfiguracionPartida = { colorHumano: 'rojas', dificultad: 'media' }

const configUIInicial: ConfiguracionUI = (() => {
  if (typeof window === 'undefined') {
    return { tema: 'oscuro', colorFichasRojas: '#f06274', colorFichasBlancas: '#f7f3ea' }
  }
  try {
    const raw = window.localStorage.getItem('configuracionUI')
    if (!raw) return { tema: 'oscuro', colorFichasRojas: '#f06274', colorFichasBlancas: '#f7f3ea' }
    const data = JSON.parse(raw) as Partial<ConfiguracionUI>
    return {
      tema: data.tema === 'claro' ? 'claro' : 'oscuro',
      colorFichasRojas: typeof data.colorFichasRojas === 'string' ? data.colorFichasRojas : '#f06274',
      colorFichasBlancas: typeof data.colorFichasBlancas === 'string' ? data.colorFichasBlancas : '#f7f3ea',
    }
  } catch {
    return { tema: 'oscuro', colorFichasRojas: '#f06274', colorFichasBlancas: '#f7f3ea' }
  }
})()

const aplicarConfiguracionUI = (config: ConfiguracionUI) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (config.tema === 'claro') root.classList.add('tema-claro')
  else root.classList.remove('tema-claro')
  root.style.setProperty('--color-ficha-rojas', config.colorFichasRojas)
  root.style.setProperty('--color-ficha-blancas', config.colorFichasBlancas)
  try {
    window.localStorage.setItem('configuracionUI', JSON.stringify(config))
  } catch {
    // ignore
  }
}

const colorBotDesde = (config: ConfiguracionPartida): ColorFicha => obtenerColorOpuesto(config.colorHumano)

const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export const usePartidaStore = create<EstadoUI & Acciones>((set, get) => ({
  gameId: null,
  configuracionPartida: configPartidaInicial,
  configuracionUI: configUIInicial,
  estadoPartida: null,
  estaPensandoBot: false,
  error: null,
  tiempoRojasMs: 0,
  tiempoBlancasMs: 0,
  ultimasStatsBot: null,

  setConfiguracionPartida: (parcial) => set((s) => ({ configuracionPartida: { ...s.configuracionPartida, ...parcial } })),
  setConfiguracionUI: (parcial) =>
    set((s) => {
      const nueva = { ...s.configuracionUI, ...parcial }
      aplicarConfiguracionUI(nueva)
      return { configuracionUI: nueva }
    }),

  crearNueva: async () => {
    set({ error: null, estaPensandoBot: false, tiempoRojasMs: 0, tiempoBlancasMs: 0, ultimasStatsBot: null })
    const { configuracionPartida } = get()
    const r = await apiCrearNuevaPartida(configuracionPartida)
    if (r.ok === false) {
      set({ error: r.error })
      return
    }
    set({ gameId: r.gameId, estadoPartida: r.estado })
    if (r.estado.turno === colorBotDesde(configuracionPartida)) {
      await get().solicitarMovimientoBot()
    }
  },

  enviarMovimientoHumano: async (movimiento) => {
    const { gameId, estadoPartida } = get()
    if (!gameId || !estadoPartida) return
    if (estadoPartida.ganador) return
    set({ error: null })
    const r = await apiMoverHumano(gameId, movimiento)
    if (r.ok === false) {
      set({ error: r.error })
      return
    }
    set({ estadoPartida: r.estado })
    const { configuracionPartida } = get()
    if (r.estado.ganador) return
    if (r.estado.turno === colorBotDesde(configuracionPartida) && !r.estado.debeContinuarCon) {
      await get().solicitarMovimientoBot()
    }
  },

  solicitarMovimientoBot: async () => {
    const { gameId, estadoPartida, configuracionPartida } = get()
    if (!gameId || !estadoPartida) return
    if (estadoPartida.ganador) return

    const colorBot = colorBotDesde(configuracionPartida)
    if (estadoPartida.turno !== colorBot) return

    set({ estaPensandoBot: true, error: null })

    let estadoActual = estadoPartida
    let pasos = 0
    const demoraAntesPrimerMovimientoMs = 1000
    const minMsPorMovimiento = 650
    const pausaEntreCapturasMs = 350
    let primerMovimiento = true

    while (estadoActual.turno === colorBot && !estadoActual.ganador && pasos < 30) {
      pasos += 1
      if (primerMovimiento) {
        await esperar(demoraAntesPrimerMovimientoMs)
        primerMovimiento = false
      }
      const inicio = performance.now()
      const r = await apiMoverBot(gameId)
      const tardado = performance.now() - inicio
      const restante = Math.max(0, minMsPorMovimiento - tardado)
      if (restante > 0) await esperar(restante)

      if (r.ok === false) {
        set({ estaPensandoBot: false, error: r.error })
        return
      }

      estadoActual = r.estado
      set({ estadoPartida: r.estado, ultimasStatsBot: r.stats })

      if (estadoActual.ganador) break
      if (estadoActual.turno !== colorBot) break

      if (!estadoActual.debeContinuarCon) break
      await esperar(pausaEntreCapturasMs)
    }

    if (pasos >= 30) {
      set({ estaPensandoBot: false, error: 'El bot excedió el límite de capturas en un turno' })
      return
    }

    set({ estaPensandoBot: false })
  },

  rendirse: () => {
    const { estadoPartida, configuracionPartida } = get()
    if (!estadoPartida || estadoPartida.ganador) return
    const ganador = colorBotDesde(configuracionPartida)
    set({ estadoPartida: { ...estadoPartida, ganador, motivoFin: 'rendicion' }, estaPensandoBot: false })
  },

  reiniciar: async () => {
    await get().crearNueva()
  },

  tickReloj: (deltaMs) => {
    const { estadoPartida } = get()
    if (!estadoPartida || estadoPartida.ganador) return
    if (estadoPartida.turno === 'rojas') set((s) => ({ tiempoRojasMs: s.tiempoRojasMs + deltaMs }))
    else set((s) => ({ tiempoBlancasMs: s.tiempoBlancasMs + deltaMs }))
  },
}))

aplicarConfiguracionUI(configUIInicial)

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flag, RotateCcw, SunMoon } from 'lucide-react'
import { TableroDamas } from '../components/tablero/TableroDamas'
import { ModalResultado } from '../components/modales/ModalResultado'
import { ModalApariencia } from '../components/modales/ModalApariencia'
import { usePartidaStore } from '../store/usoPartidaStore'
import { obtenerColorOpuesto } from '../../shared/damas/reglas'

const formatoTiempo = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${s}.${Math.floor((ms % 1000) / 100)}s`
}

export default function Partida() {
  const navigate = useNavigate()
  const [abiertoApariencia, setAbiertoApariencia] = useState(false)
  const {
    configuracionPartida,
    configuracionUI,
    setConfiguracionUI,
    estadoPartida,
    estaPensandoBot,
    error,
    tiempoRojasMs,
    tiempoBlancasMs,
    ultimasStatsBot,
    enviarMovimientoHumano,
    reiniciar,
    rendirse,
    tickReloj,
  } = usePartidaStore()

  useEffect(() => {
    const id = setInterval(() => tickReloj(250), 250)
    return () => clearInterval(id)
  }, [tickReloj])

  if (!estadoPartida) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-1px)] max-w-5xl flex-col items-center justify-center px-6">
        <div className="rounded-2xl bg-[var(--color-panel)] px-6 py-5 ring-1 ring-[var(--color-contorno)]">
          <div className="text-sm text-[var(--color-texto-suave)]">No hay partida activa.</div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 w-full rounded-xl bg-[var(--color-boton)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-boton-hover)]"
          >
            Ir a Inicio
          </button>
        </div>
      </div>
    )
  }

  const colorHumano = configuracionPartida.colorHumano
  const colorBot = obtenerColorOpuesto(colorHumano)
  const turnoHumano = estadoPartida.turno === colorHumano
  const esVictoriaHumano = estadoPartida.ganador === colorHumano

  const textoMotivoDerrota = () => {
    if (!estadoPartida.motivoFin) return 'El bot te superó.'
    if (estadoPartida.motivoFin === 'rendicion') return 'Te rendiste.'
    if (estadoPartida.motivoFin === 'sin_piezas') return 'Te quedaste sin fichas.'
    return 'No tenías movimientos legales.'
  }

  const textoMotivoVictoria = () => {
    if (!estadoPartida.motivoFin) return '¡Bien jugado!'
    if (estadoPartida.motivoFin === 'rendicion') return 'El bot se rindió.'
    if (estadoPartida.motivoFin === 'sin_piezas') return 'El bot se quedó sin fichas.'
    return 'El bot no tiene movimientos legales.'
  }

  const etiquetaTurno = estadoPartida.ganador
    ? estadoPartida.ganador === colorHumano
      ? 'Ganaste'
      : 'Perdiste'
    : estaPensandoBot
      ? 'Turno del bot (pensando...)'
      : turnoHumano
        ? estadoPartida.debeContinuarCon
          ? 'Continúa capturando'
          : 'Tu turno'
        : 'Turno del bot'

  return (
    <div className="relative mx-auto min-h-[calc(100vh-1px)] max-w-7xl px-6 py-6">
      <button
        type="button"
        aria-label="Apariencia"
        onClick={() => setAbiertoApariencia(true)}
        className="fixed right-3 top-3 z-50 grid h-11 w-11 place-items-center rounded-xl bg-[rgba(255,255,255,0.06)] ring-1 ring-[var(--color-contorno)] transition hover:bg-[rgba(255,255,255,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-boton)]"
      >
        <SunMoon className="h-5 w-5" />
      </button>

      <ModalApariencia
        abierto={abiertoApariencia}
        onCerrar={() => setAbiertoApariencia(false)}
        configuracionUI={configuracionUI}
        setConfiguracionUI={setConfiguracionUI}
      />

      <ModalResultado
        abierto={!!estadoPartida.ganador}
        titulo={esVictoriaHumano ? 'Ganaste' : 'Perdiste'}
        subtitulo={esVictoriaHumano ? textoMotivoVictoria() : textoMotivoDerrota()}
        onReiniciar={reiniciar}
        onVolverInicio={() => navigate('/')}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl bg-[var(--color-panel)] p-4 ring-1 ring-[var(--color-contorno)] lg:p-5">
          <TableroDamas
            estado={estadoPartida}
            colorHumano={colorHumano}
            bloqueado={estaPensandoBot}
            onMover={enviarMovimientoHumano}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-[var(--color-panel)] p-6 ring-1 ring-[var(--color-contorno)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Estado</div>
                <div className="mt-1 text-xs text-[var(--color-texto-suave)]">Dificultad: {configuracionPartida.dificultad}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{etiquetaTurno}</div>
                <div className="mt-1 text-xs text-[var(--color-texto-suave)]">
                  {estaPensandoBot ? 'Bot pensando' : turnoHumano ? 'Humano' : 'Bot'}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[rgba(255,255,255,0.04)] px-4 py-3 ring-1 ring-[var(--color-contorno)]">
                <div className="text-xs text-[var(--color-texto-suave)]">Tú</div>
                <div className="mt-1 text-sm font-semibold text-[var(--color-acento)]">
                  {colorHumano === 'rojas' ? formatoTiempo(tiempoRojasMs) : formatoTiempo(tiempoBlancasMs)}
                </div>
              </div>
              <div className="rounded-xl bg-[rgba(255,255,255,0.04)] px-4 py-3 ring-1 ring-[var(--color-contorno)]">
                <div className="text-xs text-[var(--color-texto-suave)]">Bot</div>
                <div className="mt-1 text-sm font-semibold">
                  {colorBot === 'rojas' ? formatoTiempo(tiempoRojasMs) : formatoTiempo(tiempoBlancasMs)}
                </div>
              </div>
            </div>

            {ultimasStatsBot ? (
              <div className="mt-4 text-xs text-[var(--color-texto-suave)]">
                Bot: prof {ultimasStatsBot.profundidad} · nodos {ultimasStatsBot.nodos} · {Math.round(ultimasStatsBot.ms)}ms
              </div>
            ) : null}

            {error ? <div className="mt-4 rounded-xl bg-[rgba(192,74,58,0.18)] px-4 py-3 text-sm">{error}</div> : null}
          </div>

          <div className="rounded-2xl bg-[var(--color-panel)] p-6 ring-1 ring-[var(--color-contorno)]">
            <div className="text-sm font-semibold">Controles</div>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={reiniciar}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[rgba(255,255,255,0.06)] px-4 py-3 text-sm ring-1 ring-[var(--color-contorno)] transition hover:bg-[rgba(255,255,255,0.1)]"
              >
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </button>
              <button
                type="button"
                onClick={rendirse}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[rgba(192,74,58,0.18)] px-4 py-3 text-sm ring-1 ring-[rgba(192,74,58,0.25)] transition hover:bg-[rgba(192,74,58,0.28)]"
              >
                <Flag className="h-4 w-4" />
                Rendirse
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-xl px-4 py-3 text-sm text-[var(--color-texto-suave)] ring-1 ring-[var(--color-contorno)] transition hover:bg-[rgba(255,255,255,0.06)]"
              >
                Volver a Inicio
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-panel)] p-6 ring-1 ring-[var(--color-contorno)]">
            <div className="text-sm font-semibold">Reglas</div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-texto-suave)]">
              <li>Capturas obligatorias cuando existan.</li>
              <li>Si hay varias capturas, puedes elegir cualquiera.</li>
              <li>Multi-capturas obligatorias con la misma ficha.</li>
              <li>Si te coronas durante una captura, el turno termina al coronarte.</li>
            </ul>
            {estadoPartida.debeContinuarCon ? (
              <div className="mt-4 rounded-xl bg-[rgba(47,143,131,0.12)] px-4 py-3 text-sm">
                Continúa capturando con la ficha marcada.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

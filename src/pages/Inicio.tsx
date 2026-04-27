import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SunMoon } from 'lucide-react'
import { usePartidaStore } from '../store/usoPartidaStore'
import { ModalApariencia } from '../components/modales/ModalApariencia'

export default function Inicio() {
  const navigate = useNavigate()
  const [abiertoApariencia, setAbiertoApariencia] = useState(false)
  const { configuracionPartida, configuracionUI, setConfiguracionPartida, setConfiguracionUI, crearNueva, error } = usePartidaStore()

  const onComenzar = async () => {
    await crearNueva()
    const { estadoPartida } = usePartidaStore.getState()
    if (estadoPartida) navigate('/partida')
  }

  return (
    <div className="relative mx-auto min-h-[calc(100vh-1px)] max-w-6xl px-6 py-10">
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

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl bg-[var(--color-panel)] p-8 ring-1 ring-[var(--color-contorno)]">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Damas inglesas</h1>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <div className="text-sm font-medium">Tu color</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfiguracionPartida({ colorHumano: 'rojas' })}
                  className={`rounded-xl px-4 py-3 text-sm ring-1 ring-[var(--color-contorno)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-boton)] ${
                    configuracionPartida.colorHumano === 'rojas'
                      ? 'bg-[rgba(47,143,131,0.15)] ring-[var(--color-boton)]'
                      : 'bg-transparent hover:bg-[rgba(255,255,255,0.04)]'
                  }`}
                >
                  Rojas
                </button>
                <button
                  type="button"
                  onClick={() => setConfiguracionPartida({ colorHumano: 'blancas' })}
                  className={`rounded-xl px-4 py-3 text-sm ring-1 ring-[var(--color-contorno)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-boton)] ${
                    configuracionPartida.colorHumano === 'blancas'
                      ? 'bg-[rgba(47,143,131,0.15)] ring-[var(--color-boton)]'
                      : 'bg-transparent hover:bg-[rgba(255,255,255,0.04)]'
                  }`}
                >
                  Blancas
                </button>
              </div>
              <div className="text-xs text-[var(--color-texto-suave)]">
                Si juegas con blancas, el tablero se voltea para que siempre juegues desde abajo.
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Dificultad</div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { k: 'facil', t: 'Fácil' },
                    { k: 'media', t: 'Media' },
                    { k: 'dificil', t: 'Difícil' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.k}
                    type="button"
                    onClick={() => setConfiguracionPartida({ dificultad: d.k })}
                    className={`rounded-xl px-4 py-3 text-sm ring-1 ring-[var(--color-contorno)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-boton)] ${
                      configuracionPartida.dificultad === d.k
                        ? 'bg-[rgba(47,143,131,0.15)] ring-[var(--color-boton)]'
                        : 'bg-transparent hover:bg-[rgba(255,255,255,0.04)]'
                    }`}
                  >
                    {d.t}
                  </button>
                ))}
              </div>
            </div>

            {error ? <div className="rounded-xl bg-[rgba(192,74,58,0.18)] px-4 py-3 text-sm">{error}</div> : null}

            <button
              type="button"
              onClick={onComenzar}
              className="w-full rounded-xl bg-[var(--color-boton)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-boton-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-boton)]"
            >
              Comenzar partida
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-panel)] p-6 ring-1 ring-[var(--color-contorno)]">
          <div className="text-sm font-semibold">Reglas</div>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-texto-suave)]">
            <li>Se juega solo en casillas oscuras (32 casillas efectivas).</li>
            <li>Las fichas normales se mueven una casilla en diagonal hacia adelante.</li>
            <li>Las fichas normales capturan en diagonal hacia adelante (por salto).</li>
            <li>La dama se mueve una casilla en diagonal hacia adelante o hacia atrás (no es voladora).</li>
            <li>Capturar es obligatorio; si hay varias capturas, puedes elegir cualquiera.</li>
            <li>Si tras una captura puedes seguir capturando, debes continuar con la misma ficha.</li>
            <li>Si te coronas durante una captura, el turno termina al coronarte.</li>
            <li>Ganas si el rival se queda sin fichas o sin movimientos legales.</li>
          </ul>

          <details className="mt-4 rounded-xl bg-[rgba(0,0,0,0.18)] px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium">Más detalle</summary>
            <div className="mt-3 space-y-2 text-sm text-[var(--color-texto-suave)]">
              <div>La orientación estándar tiene una casilla oscura en la esquina inferior izquierda del jugador.</div>
              <div>La captura se hace saltando una pieza rival adyacente y cayendo en la casilla vacía detrás.</div>
              <div>Una jugada de captura puede ser múltiple, pero siempre con la misma pieza y sin repetir capturas.</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

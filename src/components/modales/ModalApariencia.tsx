import { Moon, Sun } from 'lucide-react'

type TemaUI = 'oscuro' | 'claro'

type ConfiguracionUI = {
  tema: TemaUI
  colorFichasRojas: string
  colorFichasBlancas: string
}

const coloresRojas = [
  { nombre: 'Rojo', valor: '#f06274' },
  { nombre: 'Terracota', valor: '#b36f55' },
  { nombre: 'Turquesa', valor: '#2f8f83' },
  { nombre: 'Violeta', valor: '#6d5bd0' },
  { nombre: 'Dorado', valor: '#f2c14e' },
  { nombre: 'Negro', valor: '#111111' },
]

const coloresBlancas = [
  { nombre: 'Marfil', valor: '#f7f3ea' },
  { nombre: 'Beige', valor: '#d8d3c3' },
  { nombre: 'Gris', valor: '#cfd8dc' },
  { nombre: 'Blanco', valor: '#ffffff' },
  { nombre: 'Menta', valor: '#bfe6d6' },
  { nombre: 'Negro', valor: '#111111' },
]

const BotonColor = ({
  valor,
  seleccionado,
  onClick,
  titulo,
}: {
  valor: string
  seleccionado: boolean
  onClick: () => void
  titulo: string
}) => {
  return (
    <button
      type="button"
      aria-label={titulo}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-xl ring-1 transition ${
        seleccionado ? 'ring-[var(--color-boton)]' : 'ring-[var(--color-contorno)] hover:bg-[rgba(255,255,255,0.06)]'
      }`}
    >
      <div className="h-6 w-6 rounded-full ring-1 ring-[rgba(0,0,0,0.35)]" style={{ backgroundColor: valor }} />
    </button>
  )
}

export function ModalApariencia({
  abierto,
  onCerrar,
  configuracionUI,
  setConfiguracionUI,
}: {
  abierto: boolean
  onCerrar: () => void
  configuracionUI: ConfiguracionUI
  setConfiguracionUI: (parcial: Partial<ConfiguracionUI>) => void
}) {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-6">
      <button type="button" aria-label="Cerrar" onClick={onCerrar} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--color-panel)] p-6 ring-1 ring-[var(--color-contorno)] shadow-[0_22px_70px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Apariencia</div>
            <div className="mt-1 text-sm text-[var(--color-texto-suave)]">Tema y colores de fichas</div>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onCerrar}
            className="rounded-xl px-3 py-2 text-sm text-[var(--color-texto-suave)] ring-1 ring-[var(--color-contorno)] transition hover:bg-[rgba(255,255,255,0.06)]"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-6 grid gap-6">
          <div>
            <div className="text-sm font-semibold">Tema</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfiguracionUI({ tema: 'oscuro' })}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm ring-1 transition ${
                  configuracionUI.tema === 'oscuro'
                    ? 'bg-[rgba(47,143,131,0.15)] ring-[var(--color-boton)]'
                    : 'bg-transparent ring-[var(--color-contorno)] hover:bg-[rgba(255,255,255,0.06)]'
                }`}
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfiguracionUI({ tema: 'claro' })}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm ring-1 transition ${
                  configuracionUI.tema === 'claro'
                    ? 'bg-[rgba(47,143,131,0.15)] ring-[var(--color-boton)]'
                    : 'bg-transparent ring-[var(--color-contorno)] hover:bg-[rgba(255,255,255,0.06)]'
                }`}
              >
                <Sun className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Color fichas rojas</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {coloresRojas.map((c) => (
                <BotonColor
                  key={c.valor}
                  valor={c.valor}
                  titulo={c.nombre}
                  seleccionado={configuracionUI.colorFichasRojas.toLowerCase() === c.valor.toLowerCase()}
                  onClick={() => setConfiguracionUI({ colorFichasRojas: c.valor })}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Color fichas blancas</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {coloresBlancas.map((c) => (
                <BotonColor
                  key={c.valor}
                  valor={c.valor}
                  titulo={c.nombre}
                  seleccionado={configuracionUI.colorFichasBlancas.toLowerCase() === c.valor.toLowerCase()}
                  onClick={() => setConfiguracionUI({ colorFichasBlancas: c.valor })}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


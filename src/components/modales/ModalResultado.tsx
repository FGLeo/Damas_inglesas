export function ModalResultado({
  abierto,
  titulo,
  subtitulo,
  onReiniciar,
  onVolverInicio,
}: {
  abierto: boolean
  titulo: string
  subtitulo?: string
  onReiniciar: () => void
  onVolverInicio: () => void
}) {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--color-panel)] p-6 ring-1 ring-[var(--color-contorno)] shadow-[0_22px_70px_rgba(0,0,0,0.55)]">
        <div className="text-lg font-semibold">{titulo}</div>
        {subtitulo ? <div className="mt-1 text-sm text-[var(--color-texto-suave)]">{subtitulo}</div> : null}
        <div className="mt-6 grid gap-2">
          <button
            type="button"
            onClick={onReiniciar}
            className="w-full rounded-xl bg-[var(--color-boton)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-boton-hover)]"
          >
            Jugar otra vez
          </button>
          <button
            type="button"
            onClick={onVolverInicio}
            className="w-full rounded-xl bg-[rgba(255,255,255,0.06)] px-5 py-3 text-sm ring-1 ring-[var(--color-contorno)] transition hover:bg-[rgba(255,255,255,0.1)]"
          >
            Volver a Inicio
          </button>
        </div>
      </div>
    </div>
  )
}


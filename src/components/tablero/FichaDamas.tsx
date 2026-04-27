import type { Pieza } from '../../../shared/damas/tipos'
import { IconoCorona } from '../iconos/IconoCorona'

export function FichaDamas({ pieza, deshabilitada }: { pieza: Pieza; deshabilitada?: boolean }) {
  const esRoja = pieza.color === 'rojas'
  const base = esRoja
    ? 'bg-[var(--color-ficha-rojas)] shadow-[0_10px_20px_rgba(0,0,0,0.22)]'
    : 'bg-[var(--color-ficha-blancas)] shadow-[0_10px_20px_rgba(0,0,0,0.18)]'

  const borde = esRoja ? 'ring-[#2b2b2b]' : 'ring-[#31414c]'
  const estado = deshabilitada ? 'opacity-40 blur-[0.6px] saturate-75' : ''

  return (
    <div className={`relative grid h-[72%] w-[72%] max-h-12 max-w-12 place-items-center rounded-full ring-4 ${base} ${borde} ${estado}`}>
      {pieza.esDama ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-[44%] w-[44%] place-items-center rounded-full bg-[rgba(255,255,255,0.78)] ring-1 ring-[rgba(0,0,0,0.35)]">
            <IconoCorona className="h-5 w-5 text-[rgba(20,24,28,0.78)]" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

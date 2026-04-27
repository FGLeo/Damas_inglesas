import type { ReactNode } from 'react'
import type { Coordenadas } from '../../../shared/damas/tipos'

export function CasillaDamas({
  coords,
  esOscura,
  estaSeleccionada,
  esDestino,
  esCaptura,
  esSeleccionable,
  puedeInteractuar,
  onClick,
  children,
}: {
  coords: Coordenadas
  esOscura: boolean
  estaSeleccionada: boolean
  esDestino: boolean
  esCaptura: boolean
  esSeleccionable: boolean
  puedeInteractuar: boolean
  onClick: (c: Coordenadas) => void
  children?: ReactNode
}) {
  const fondo = esOscura ? 'bg-[var(--color-tablero-oscuro)]' : 'bg-[var(--color-tablero-claro)]'
  const anillo = estaSeleccionada
    ? 'outline outline-2 outline-[var(--color-boton)]'
    : esCaptura
      ? 'outline outline-2 outline-[var(--color-captura)]'
      : esDestino
        ? 'outline outline-2 outline-[rgba(216,211,195,0.55)]'
        : ''

  const cursor = puedeInteractuar ? (esSeleccionable || esDestino ? 'cursor-pointer' : 'cursor-default') : 'cursor-not-allowed'
  const brillo = esSeleccionable && !estaSeleccionada ? 'ring-2 ring-inset ring-[rgba(247,243,234,0.22)]' : ''

  return (
    <button
      type="button"
      onClick={() => onClick(coords)}
      className={`relative grid aspect-square w-full place-items-center ${fondo} ${anillo} ${brillo} ${cursor} transition-colors`}
    >
      {esDestino ? (
        <div className="absolute h-4 w-4 rounded-full bg-[rgba(0,0,0,0.25)]" />
      ) : null}
      {children}
    </button>
  )
}

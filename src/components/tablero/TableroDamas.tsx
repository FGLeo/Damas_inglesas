import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ColorFicha, Coordenadas, EstadoPartida, Movimiento } from '../../../shared/damas/tipos'
import { obtenerMovimientosLegales, obtenerPieza } from '../../../shared/damas/reglas'
import { CasillaDamas } from './CasillaDamas'
import { FichaDamas } from './FichaDamas'

const letras = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

const misma = (a: Coordenadas, b: Coordenadas) => a.fila === b.fila && a.col === b.col
const clave = (c: Coordenadas) => `${c.fila},${c.col}`

export function TableroDamas({
  estado,
  colorHumano,
  bloqueado,
  onMover,
}: {
  estado: EstadoPartida
  colorHumano: ColorFicha
  bloqueado: boolean
  onMover: (m: Movimiento) => void
}) {
  const [seleccion, setSeleccion] = useState<Coordenadas | null>(null)
  const voltear = colorHumano === 'blancas'
  const refsFicha = useRef(new Map<string, HTMLElement>())
  const posicionesPrevias = useRef(new Map<string, DOMRect>())

  const turnoHumano = estado.turno === colorHumano
  const puedeInteractuar = turnoHumano && !bloqueado && !estado.ganador

  const seleccionForzada = estado.debeContinuarCon ?? null
  const seleccionEfectiva = seleccionForzada ?? seleccion

  const movimientosLegalesGlobales = useMemo(() => obtenerMovimientosLegales(estado), [estado])
  const origenesConMovimiento = useMemo(() => {
    const s = new Set<string>()
    for (const m of movimientosLegalesGlobales) s.add(clave(m.desde))
    return s
  }, [movimientosLegalesGlobales])

  const movimientosDeSeleccion = useMemo(() => {
    if (!seleccionEfectiva) return [] as Movimiento[]
    return obtenerMovimientosLegales(estado, seleccionEfectiva)
  }, [estado, seleccionEfectiva])

  const destinos = useMemo(() => movimientosDeSeleccion.map((m) => m.hasta), [movimientosDeSeleccion])
  const capturas = useMemo(() => movimientosDeSeleccion.filter((m) => m.captura).map((m) => m.hasta), [movimientosDeSeleccion])

  const onClickCasilla = (coords: Coordenadas) => {
    if (!puedeInteractuar) return

    const pieza = obtenerPieza(estado, coords)
    if (pieza && pieza.color === colorHumano) {
      if (seleccionForzada && !misma(coords, seleccionForzada)) return
      if (!seleccionForzada && !origenesConMovimiento.has(clave(coords))) return
      setSeleccion(coords)
      return
    }

    if (!seleccionEfectiva) return
    const movimiento = movimientosDeSeleccion.find((m) => misma(m.hasta, coords))
    if (!movimiento) return

    onMover(movimiento)
    setSeleccion(movimiento.captura ? movimiento.hasta : null)
  }

  const numeros = useMemo(() => (voltear ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]), [voltear])
  const letrasMostrar = useMemo(() => (voltear ? [...letras].reverse() : letras), [voltear])

  useLayoutEffect(() => {
    const actuales = new Map<string, DOMRect>()
    for (const [id, el] of refsFicha.current.entries()) {
      actuales.set(id, el.getBoundingClientRect())
    }

    for (const [id, el] of refsFicha.current.entries()) {
      const antes = posicionesPrevias.current.get(id)
      const despues = actuales.get(id)
      if (!antes || !despues) continue
      const dx = antes.left - despues.left
      const dy = antes.top - despues.top
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
        duration: 120,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      })
    }

    posicionesPrevias.current = actuales
  }, [estado.tablero])

  return (
    <div className="grid w-full grid-cols-[24px_1fr] grid-rows-[auto_auto] gap-2">
      <div className="grid h-full grid-rows-8 text-[11px] text-[var(--color-texto-suave)]">
        {numeros.map((n) => (
          <div key={n} className="flex items-center justify-center">
            {n}
          </div>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[min(78vh,720px)]">
        <div className="aspect-square overflow-hidden rounded-2xl ring-1 ring-[var(--color-contorno)] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <div className="grid h-full w-full grid-cols-8">
            {Array.from({ length: 8 }, (_, filaDisp) =>
              Array.from({ length: 8 }, (_, colDisp) => {
                const coords = voltear ? { fila: 7 - filaDisp, col: 7 - colDisp } : { fila: filaDisp, col: colDisp }
                const pieza = estado.tablero[coords.fila]?.[coords.col] ?? null
                const esOscura = (coords.fila + coords.col) % 2 === 1
                const estaSeleccionada = seleccionEfectiva ? misma(coords, seleccionEfectiva) : false
                const esDestino = destinos.some((d) => misma(d, coords))
                const esCaptura = capturas.some((d) => misma(d, coords))
                const esSeleccionable =
                  puedeInteractuar &&
                  !!pieza &&
                  pieza.color === colorHumano &&
                  (seleccionForzada ? misma(coords, seleccionForzada) : origenesConMovimiento.has(clave(coords)))
                const deshabilitada =
                  puedeInteractuar && !!pieza && pieza.color === colorHumano && !esSeleccionable && !estaSeleccionada

                return (
                  <CasillaDamas
                    key={`${filaDisp}-${colDisp}`}
                    coords={coords}
                    esOscura={esOscura}
                    estaSeleccionada={estaSeleccionada}
                    esDestino={esDestino}
                    esCaptura={esCaptura}
                    esSeleccionable={esSeleccionable}
                    puedeInteractuar={puedeInteractuar}
                    onClick={onClickCasilla}
                  >
                    {pieza ? (
                      <div
                        ref={(el) => {
                          if (el) refsFicha.current.set(pieza.id, el)
                          else refsFicha.current.delete(pieza.id)
                        }}
                        className="grid h-full w-full place-items-center"
                      >
                        <FichaDamas pieza={pieza} deshabilitada={deshabilitada} />
                      </div>
                    ) : null}
                  </CasillaDamas>
                )
              }),
            )}
          </div>
        </div>
      </div>

      <div />
      <div className="mx-auto grid w-full max-w-[min(78vh,720px)] grid-cols-8 text-[11px] text-[var(--color-texto-suave)]">
        {letrasMostrar.map((l) => (
          <div key={l} className="flex items-center justify-center">
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

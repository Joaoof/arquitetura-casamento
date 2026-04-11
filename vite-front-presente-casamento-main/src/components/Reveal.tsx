"use client"

import { useRef, useLayoutEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  index: number
}

export default function StickyReveal({ children, index }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // ✅ useScroll() sem target = listener do WINDOW
  // O Framer Motion compartilha UM único listener entre todos os componentes
  // Antes: N seções = N listeners separados
  const { scrollY } = useScroll()

  // ✅ Ref em vez de state — zero re-renders ao medir o DOM
  const scrollRange = useRef<[number, number]>([0, 1])

  useLayoutEffect(() => {
    // Primeira seção já está visível — sem animação necessária
    if (index === 0) return

    const el = ref.current
    if (!el) return

    const measure = () => {
      const offsetTop = el.getBoundingClientRect().top + window.scrollY
      // [início da descida, posição final travada no sticky]
      scrollRange.current = [
        Math.max(0, offsetTop - window.innerHeight),
        offsetTop,
      ]
    }

    measure()

    // ✅ Um único ResizeObserver por seção, no body (cobre refluxo de layout)
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [index])

  // ✅ useTransform com função pura = sem parse de string a cada frame
  // Roda fora da React render tree — 0 re-renders durante o scroll
  const y = useTransform(scrollY, (latest) => {
    if (index === 0) return "0%"

    const [start, end] = scrollRange.current
    if (start === end) return "0%"

    const progress = Math.min(1, Math.max(0, (latest - start) / (end - start)))
    // progress: 0 = seção ainda não entrou | 1 = seção fixou no topo
    return `${(1 - progress) * -100}%`
  })

  return (
    <div
      ref={ref}
      style={{
        position: "sticky",
        top: 0,
        zIndex: index + 1,
        overflow: "hidden",
        // ✅ Isola a área de repaint — browser não recalcula o restante da página
        contain: "paint",
      }}
    >
      <motion.div
        style={{
          y,
          width: "100%",
          // ✅ Promove o elemento para layer GPU dedicada
          // A animação roda no compositor — não bloqueia o main thread
          willChange: "transform",
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

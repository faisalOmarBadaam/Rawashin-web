import { useEffect, useState } from "react";

export const useAnimatedNumber = (
  target: number,
  options: { durationMs?: number; precision?: number } = {},
) => {
  const { durationMs = 900, precision = 0 } = options
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let rafId = 0

    const tick = (time: number) => {
      const progress = Math.min((time - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = target * eased

      setDisplayValue(Number(next.toFixed(precision)))

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [target, durationMs, precision])

  return displayValue
}

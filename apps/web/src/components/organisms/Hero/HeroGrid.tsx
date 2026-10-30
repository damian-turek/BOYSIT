'use client'

import { type RefObject, useEffect, useRef } from 'react'

import styles from './Hero.module.css'

const GRID_SIZE = 40
const LENS_RADIUS = 180
const LENS_STRENGTH = 0.22
const SAMPLE_STEP = 10

export const HeroGrid = ({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const eventSurface = containerRef.current?.parentElement
    const context = canvas?.getContext('2d')
    if (!canvas || !context || !eventSurface) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let lineColor = ''
    let accentColor = ''
    let glowOpacity = 0.04
    let frame: number | null = null
    let previousTime = 0
    const pointer = { x: 0, y: 0, strength: 0 }
    const target = { x: 0, y: 0, strength: 0 }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      if (pointer.strength > 0) {
        const glow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          LENS_RADIUS,
        )
        glow.addColorStop(0, accentColor)
        glow.addColorStop(1, 'transparent')
        context.globalAlpha = glowOpacity * pointer.strength
        context.fillStyle = glow
        context.fillRect(0, 0, width, height)
      }

      context.globalAlpha = 1
      context.strokeStyle = lineColor
      context.lineWidth = 1
      context.beginPath()

      // Both sets of lines share the same deformation, keeping intersections joined.
      const point = (x: number, y: number, first: boolean) => {
        const dx = x - pointer.x
        const dy = y - pointer.y
        const influence = Math.max(0, 1 - Math.hypot(dx, dy) / LENS_RADIUS)
        const displacement = LENS_STRENGTH * pointer.strength * influence ** 2
        const warpedX = x + dx * displacement
        const warpedY = y + dy * displacement
        if (first) context.moveTo(warpedX, warpedY)
        else context.lineTo(warpedX, warpedY)
      }

      for (let x = 0; x <= width; x += GRID_SIZE) {
        for (let y = 0; y <= height + SAMPLE_STEP; y += SAMPLE_STEP) point(x, y, y === 0)
      }
      for (let y = 0; y <= height; y += GRID_SIZE) {
        for (let x = 0; x <= width + SAMPLE_STEP; x += SAMPLE_STEP) point(x, y, x === 0)
      }
      context.stroke()
    }

    const animate = (time: number) => {
      frame = null
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16
      previousTime = time
      const ease = 1 - Math.exp(-elapsed / 65)
      pointer.x += (target.x - pointer.x) * ease
      pointer.y += (target.y - pointer.y) * ease
      pointer.strength += (target.strength - pointer.strength) * ease
      const moving = Math.abs(target.x - pointer.x) + Math.abs(target.y - pointer.y) > 0.1
      const fading = Math.abs(target.strength - pointer.strength) > 0.002
      if (!fading) pointer.strength = target.strength
      draw()
      if (moving || fading) frame = requestAnimationFrame(animate)
      else previousTime = 0
    }
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(animate)
    }
    const readColors = () => {
      const computed = getComputedStyle(canvas)
      lineColor = computed.getPropertyValue('--grid-line').trim()
      accentColor = computed.getPropertyValue('--color-primary').trim()
      glowOpacity = document.documentElement.classList.contains('dark') ? 0.025 : 0.04
      schedule()
    }
    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      schedule()
    }
    const leave = () => {
      if (target.strength === 0) return
      target.strength = 0
      schedule()
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reducedMotion.matches) return
      const bounds = canvas.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      if (x < 0 || x > width || y < 0 || y > height) return leave()
      if (pointer.strength === 0) {
        pointer.x = x
        pointer.y = y
      }
      target.x = x
      target.y = y
      target.strength = 1
      schedule()
    }
    const changeMotion = () => {
      if (reducedMotion.matches) {
        pointer.strength = 0
        target.strength = 0
        schedule()
      }
    }

    readColors()
    resize()
    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(canvas)
    const themeObserver = new MutationObserver(readColors)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    eventSurface.addEventListener('pointermove', move, { passive: true })
    eventSurface.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    window.addEventListener('scroll', leave, { passive: true })
    reducedMotion.addEventListener('change', changeMotion)
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      sizeObserver.disconnect()
      themeObserver.disconnect()
      eventSurface.removeEventListener('pointermove', move)
      eventSurface.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
      window.removeEventListener('scroll', leave)
      reducedMotion.removeEventListener('change', changeMotion)
    }
  }, [containerRef])

  return (
    <div className={styles.gridBackdrop} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.gridCanvas} />
    </div>
  )
}

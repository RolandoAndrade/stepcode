import type { CSSProperties, ReactNode } from 'react'
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { C, MONO, SANS } from './theme'

/** Spring from 0 to 1 starting at `delay` frames. */
export function usePop(delay = 0, damping = 14, mass = 0.7): number {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: frame - delay, fps, config: { damping, mass, stiffness: 180 } })
}

/** Animated dark backdrop: slow-drifting blobs in the logo's hues plus a faint code grid. */
export const Background = ({ hue = 0 }: { hue?: number }) => {
  const frame = useCurrentFrame()
  const t = frame / 30
  const blob = (
    color: string,
    x: number,
    y: number,
    size: number,
    phase: number,
  ): CSSProperties => ({
    position: 'absolute',
    left: x + Math.sin(t * 0.6 + phase) * 90,
    top: y + Math.cos(t * 0.5 + phase) * 110,
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    filter: 'blur(140px)',
    opacity: 0.32,
  })
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={blob(C.blue, -200, 100, 760, 0 + hue)} />
      <div style={blob(C.orange, 560, 1150, 700, 2 + hue)} />
      <div style={blob(C.cyan, 520, -150, 520, 4 + hue)} />
      <div style={blob(C.keyword, -150, 1300, 560, 1 + hue)} />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          backgroundPosition: `0 ${(frame * 0.8) % 60}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </AbsoluteFill>
  )
}

/** Wraps a scene: quick punch-in on entry, scale-and-fade on exit. */
export const SceneShell = ({ duration, children }: { duration: number; children: ReactNode }) => {
  const frame = useCurrentFrame()
  const inP = interpolate(frame, [0, 7], [0, 1], { extrapolateRight: 'clamp' })
  const outP = interpolate(frame, [duration - 6, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <AbsoluteFill
      style={{
        opacity: inP * (1 - outP),
        transform: `scale(${1.04 - 0.04 * inP + 0.06 * outP})`,
        filter: `blur(${(1 - inP) * 8 + outP * 10}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  )
}

export type Word = { text: string; color?: string }

/** A line of words that slam up one after another. */
export const KineticLine = ({
  words,
  delay = 0,
  stagger = 3,
  size = 96,
  weight = 900,
  color = C.fg,
  style,
}: {
  words: Word[]
  delay?: number
  stagger?: number
  size?: number
  weight?: number
  color?: string
  style?: CSSProperties
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: size * 0.26,
        rowGap: 0,
        fontFamily: SANS,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: -size * 0.03,
        textAlign: 'center',
        color,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 13, mass: 0.6, stiffness: 200 },
        })
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static word list, never reordered
            key={`${w.text}-${i}`}
            style={{
              display: 'inline-block',
              color: w.color ?? color,
              opacity: interpolate(p, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }),
              transform: `translateY(${(1 - p) * size * 0.8}px) scale(${0.7 + 0.3 * p}) rotate(${(1 - p) * -6}deg)`,
            }}
          >
            {w.text}
          </span>
        )
      })}
    </div>
  )
}

/** Splits "Hola *mundo*" into words, marking *starred* words with the accent color. */
export function words(text: string, accent: string = C.accent): Word[] {
  return text
    .split(' ')
    .map((raw) =>
      raw.startsWith('*') && raw.endsWith('*')
        ? { text: raw.slice(1, -1), color: accent }
        : { text: raw },
    )
}

export const Logo = ({ size, style }: { size: number; style?: CSSProperties }) => (
  <Img
    src={staticFile('logo.png')}
    style={{ width: size, height: size, objectFit: 'contain', ...style }}
  />
)

/** Screenshot size in device pixels (430x932 CSS px at deviceScaleFactor 3). */
export const SHOT_W = 1290
export const SHOT_H = 2796

/**
 * A phone frame around a real screenshot. `scrollY` pans the screenshot (source pixels) and
 * `screenH` is how much of the phone is visible (CSS px in the video).
 */
export const Phone = ({
  src,
  width,
  screenH,
  scrollY = 0,
  style,
  children,
}: {
  src: string
  width: number
  screenH: number
  scrollY?: number
  style?: CSSProperties
  children?: ReactNode
}) => {
  const bezel = 16
  const inner = width - bezel * 2
  const k = inner / SHOT_W
  return (
    <div
      style={{
        position: 'relative',
        width,
        height: screenH + bezel * 2,
        borderRadius: 64,
        padding: bezel,
        background: 'linear-gradient(145deg, #3a3f4b, #14161b 60%, #2b2f38)',
        boxShadow:
          '0 50px 120px rgba(0,0,0,0.65), 0 0 0 2px rgba(255,255,255,0.08), inset 0 0 0 2px rgba(255,255,255,0.06)',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: inner,
          height: screenH,
          borderRadius: 50,
          overflow: 'hidden',
          background: C.editorBg,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            position: 'absolute',
            left: 0,
            top: -scrollY * k,
            width: inner,
            height: SHOT_H * k,
          }}
        />
        {children}
      </div>
    </div>
  )
}

/**
 * A crop of a real screenshot, blown up and lifted out of the phone so it reads on a small
 * screen. Region is in source pixels.
 */
export const Callout = ({
  src,
  region,
  width,
  style,
  glow = C.accent,
}: {
  src: string
  region: { x: number; y: number; w: number; h: number }
  width: number
  style?: CSSProperties
  glow?: string
}) => {
  const k = width / region.w
  return (
    <div
      style={{
        width,
        height: region.h * k,
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 3px ${glow}, 0 0 60px ${glow}66`,
        ...style,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          position: 'absolute',
          left: -region.x * k,
          top: -region.y * k,
          width: SHOT_W * k,
          height: SHOT_H * k,
        }}
      />
    </div>
  )
}

export const Pill = ({
  children,
  color = C.accent,
  style,
}: {
  children: ReactNode
  color?: string
  style?: CSSProperties
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 16,
      padding: '18px 34px',
      borderRadius: 999,
      background: `${color}22`,
      border: `3px solid ${color}`,
      color: C.fg,
      fontFamily: SANS,
      fontWeight: 800,
      fontSize: 44,
      letterSpacing: -0.5,
      ...style,
    }}
  >
    {children}
  </div>
)

export const Mono = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <span style={{ fontFamily: MONO, ...style }}>{children}</span>
)

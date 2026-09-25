import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion'
import {
  Background,
  Callout,
  KineticLine,
  Logo,
  Mono,
  Phone,
  Pill,
  SceneShell,
  usePop,
  words,
} from './components'
import { C, MONO, SAFE_TOP, SANS } from './theme'

type Scene = { id: string; duration: number; render: (duration: number) => ReactNode }

// ---------------------------------------------------------------------------------------------
// Shared layout for the feature scenes: headline in the top band, phone below, callout on top.

const PHONE_TOP = 540
const PHONE_W = 560
const PHONE_SCREEN_H = 880
/** Source-pixel scale of the phone's screen (inner width / 1290). */
const PHONE_K = (PHONE_W - 32) / 1290

const Headline = ({ lines, size = 88 }: { lines: string[]; size?: number }) => (
  <div style={{ position: 'absolute', top: SAFE_TOP + 40, left: 60, right: 60 }}>
    {lines.map((line, i) => (
      <KineticLine key={line} words={words(line)} delay={i * 7} size={size} />
    ))}
  </div>
)

const FeaturePhone = ({
  src,
  scrollFrom = 0,
  scrollTo = 0,
  duration,
  children,
}: {
  src: string
  scrollFrom?: number
  scrollTo?: number
  duration: number
  children?: ReactNode
}) => {
  const frame = useCurrentFrame()
  const p = usePop(6, 15, 0.8)
  const scrollY = interpolate(frame, [10, duration], [scrollFrom, scrollTo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const drift = interpolate(frame, [0, duration], [1, 1.035])
  return (
    <div
      style={{
        position: 'absolute',
        top: PHONE_TOP,
        left: (1080 - PHONE_W) / 2,
        transform: `translateY(${(1 - p) * 500}px) rotate(${(1 - p) * 8}deg) scale(${drift})`,
        opacity: p,
      }}
    >
      <Phone src={src} width={PHONE_W} screenH={PHONE_SCREEN_H} scrollY={scrollY}>
        {children}
      </Phone>
    </div>
  )
}

/** A callout that grows out of `sourceY` (source px inside the phone) to full width. */
const PopCallout = ({
  src,
  region,
  delay,
  top,
  glow,
  width = 980,
  scrollY = 0,
}: {
  src: string
  region: { x: number; y: number; w: number; h: number }
  delay: number
  top: number
  glow?: string
  width?: number
  scrollY?: number
}) => {
  const p = usePop(delay, 12, 0.7)
  const fromTop = PHONE_TOP + 16 + (region.y - scrollY) * PHONE_K
  const y = interpolate(p, [0, 1], [fromTop, top])
  const scale = interpolate(p, [0, 1], [(region.w * PHONE_K) / width, 1])
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: (1080 - width) / 2,
        transform: `scale(${scale})`,
        transformOrigin: 'center top',
        opacity: interpolate(p, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' }),
      }}
    >
      <Callout src={src} region={region} width={width} glow={glow} />
    </div>
  )
}

const Check = ({ color = C.green, size = 44 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill={color} />
    <path
      d="M7 12.5l3.2 3.2L17.5 8.5"
      stroke={C.bg}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// ---------------------------------------------------------------------------------------------
// Scenes

const Hook = () => {
  const sub = usePop(34)
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      <KineticLine words={words('¿Estás aprendiendo a')} size={104} stagger={3} />
      <KineticLine
        words={[{ text: 'programar?', color: C.yellow }]}
        size={150}
        delay={12}
        style={{ marginTop: 6 }}
      />
      <div
        style={{
          marginTop: 40,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 54,
          color: C.muted,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 40}px)`,
        }}
      >
        …o lo enseñas
      </div>
    </AbsoluteFill>
  )
}

const NewHome = () => {
  const logo = usePop(0, 10, 0.9)
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      <Logo
        size={380}
        style={{
          transform: `scale(${logo}) rotate(${(1 - logo) * -120}deg)`,
          filter: 'drop-shadow(0 20px 60px rgba(46,230,246,0.35))',
          marginBottom: 30,
        }}
      />
      <KineticLine words={words('StepCode tiene')} size={100} delay={10} />
      <KineticLine words={[{ text: 'nueva casa', color: C.cyan }]} size={138} delay={16} />
    </AbsoluteFill>
  )
}

const Domain = () => {
  const frame = useCurrentFrame()
  const label = usePop(0)
  const oldIn = usePop(4)
  const strike = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const oldDim = interpolate(frame, [30, 42], [1, 0.45], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const arrow = usePop(34)
  const line1 = 'stepcode.'
  const line2 = 'letsbuildsolutions.com'
  const total = line1.length + line2.length
  const typed = Math.floor(
    interpolate(frame, [40, 68], [0, total], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  )
  const cursorOn = frame < 76 && Math.floor(frame / 6) % 2 === 0
  const shown1 = line1.slice(0, typed)
  const shown2 = line2.slice(0, Math.max(0, typed - line1.length))
  const newGlow = usePop(68, 10)
  const pill = usePop(82)
  const sub = usePop(92)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 120 }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 46,
          color: C.muted,
          letterSpacing: 6,
          textTransform: 'uppercase',
          opacity: label,
        }}
      >
        Nueva dirección
      </div>
      <div
        style={{
          position: 'relative',
          marginTop: 70,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 92,
          color: C.error,
          opacity: oldIn * oldDim,
          transform: `scale(${0.6 + 0.4 * oldIn})`,
        }}
      >
        stepcode.online
        <div
          style={{
            position: 'absolute',
            left: -10,
            top: '52%',
            height: 10,
            borderRadius: 5,
            width: `calc(${strike * 100}% + ${strike * 20}px)`,
            background: C.error,
          }}
        />
      </div>
      <svg
        width="90"
        height="120"
        viewBox="0 0 90 120"
        style={{ marginTop: 30, opacity: arrow, transform: `translateY(${(1 - arrow) * -30}px)` }}
        aria-hidden="true"
      >
        <path
          d="M45 8 V100 M15 72 L45 104 L75 72"
          stroke={C.cyan}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div
        style={{
          marginTop: 30,
          padding: '34px 30px',
          borderRadius: 32,
          background: 'rgba(33,37,43,0.85)',
          border: `3px solid ${interpolate(newGlow, [0, 1], [0, 1]) > 0.5 ? C.cyan : 'rgba(255,255,255,0.12)'}`,
          boxShadow: `0 0 ${80 * newGlow}px rgba(46,230,246,${0.45 * newGlow})`,
          textAlign: 'center',
          fontFamily: MONO,
          fontWeight: 700,
          lineHeight: 1.15,
          minWidth: 960,
          minHeight: 240,
          transform: `scale(${1 + 0.05 * Math.sin(newGlow * Math.PI)})`,
        }}
      >
        <div style={{ fontSize: 72, color: C.fg }}>
          {shown1}
          {typed <= line1.length && cursorOn ? '▍' : ''}
        </div>
        <div style={{ fontSize: 62, color: C.cyan }}>
          {shown2}
          {typed > line1.length && cursorOn ? '▍' : ''}
        </div>
      </div>
      <div
        style={{
          marginTop: 70,
          opacity: pill,
          transform: `scale(${0.7 + 0.3 * pill})`,
        }}
      >
        <Pill color={C.green} style={{ fontSize: 42 }}>
          <Check />
          Tus enlaces viejos siguen funcionando
        </Pill>
      </div>
      <div
        style={{
          marginTop: 30,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 44,
          color: C.muted,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 30}px)`,
        }}
      >
        Te llevan solos a la nueva dirección
      </div>
    </AbsoluteFill>
  )
}

const Version = () => {
  const frame = useCurrentFrame()
  const big = usePop(8, 9, 0.8)
  const flash = interpolate(frame, [8, 12, 22], [0, 0.35, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      <KineticLine words={words('Y llega')} size={90} weight={800} color={C.muted} />
      <KineticLine words={words('StepCode')} size={170} delay={5} />
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 360,
          lineHeight: 1,
          letterSpacing: -14,
          backgroundImage: `linear-gradient(100deg, ${C.cyan}, ${C.blue} 35%, ${C.keyword} 60%, ${C.orange} 85%, ${C.yellow})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          transform: `scale(${big}) rotate(${(1 - big) * 10}deg)`,
          filter: `drop-shadow(0 0 ${40 * big}px rgba(97,175,239,0.45))`,
        }}
      >
        2.0
      </div>
    </AbsoluteFill>
  )
}

const Errors = ({ duration }: { duration: number }) => (
  <AbsoluteFill>
    <Headline lines={['Errores en *español*', 'antes de ejecutar']} />
    <FeaturePhone src="screens/error.png" duration={duration} />
    <PopCallout
      src="screens/error.png"
      region={{ x: 0, y: 1580, w: 1290, h: 150 }}
      delay={26}
      top={1240}
      glow={C.error}
    />
  </AbsoluteFill>
)

const Debugger = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame()
  // Real captures of the same paused run, one per loop iteration: the values tick up.
  const step = Math.min(5, Math.max(1, Math.floor((frame - 44) / 14) + 2))
  const src = `screens/debug-${step}.png`
  return (
    <AbsoluteFill>
      <Headline lines={['Paso a paso.', 'Mira tus *variables*']} />
      <FeaturePhone src={src} duration={duration} />
      <PopCallout
        src={src}
        region={{ x: 0, y: 452, w: 1290, h: 80 }}
        delay={18}
        top={830}
        glow={C.yellow}
      />
      <PopCallout
        src={src}
        region={{ x: 0, y: 1590, w: 1290, h: 250 }}
        delay={34}
        top={1210}
        glow={C.accent}
      />
    </AbsoluteFill>
  )
}

const Autocomplete = ({ duration }: { duration: number }) => {
  const arrow = usePop(46)
  return (
    <AbsoluteFill>
      <Headline lines={['Autocompletado', 'que te *explica*']} />
      <FeaturePhone src="screens/complete.png" duration={duration} />
      <PopCallout
        src="screens/complete.png"
        region={{ x: 288, y: 386, w: 950, h: 162 }}
        delay={20}
        top={1010}
        glow={C.keyword}
      />
      <div
        style={{
          position: 'absolute',
          top: 1480,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: arrow,
          transform: `translateY(${(1 - arrow) * 60}px)`,
        }}
      >
        <Pill color={C.operator} style={{ fontSize: 46 }}>
          Escribes <Mono style={{ color: C.operator, fontSize: 56 }}>{'<-'}</Mono> y sale{' '}
          <Mono style={{ color: C.operator, fontSize: 56 }}>←</Mono>
        </Pill>
      </div>
    </AbsoluteFill>
  )
}

const LANG_ROWS = [
  { name: 'Español', code: ['Escribir', "'Hola';"], color: C.yellow },
  { name: 'English', code: ['Write', "'Hello';"], color: C.cyan },
  { name: 'PSeInt', code: ['Escribir', "'Hola'"], color: C.orange },
]

const Languages = () => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 120 }}>
    <KineticLine words={words('Español, inglés')} size={92} />
    <KineticLine words={words('y compatible con *PSeInt*', C.orange)} size={74} delay={6} />
    <div style={{ marginTop: 90, display: 'flex', flexDirection: 'column', gap: 44 }}>
      {LANG_ROWS.map((row, i) => (
        <LangRow key={row.name} row={row} delay={14 + i * 7} />
      ))}
    </div>
  </AbsoluteFill>
)

const LangRow = ({ row, delay }: { row: (typeof LANG_ROWS)[number]; delay: number }) => {
  const p = usePop(delay)
  return (
    <div
      style={{
        width: 900,
        padding: '34px 44px',
        borderRadius: 30,
        background: 'rgba(40,44,52,0.9)',
        border: `3px solid ${row.color}`,
        boxShadow: `0 0 50px ${row.color}33`,
        opacity: p,
        transform: `translateX(${(1 - p) * (delay % 2 === 0 ? -600 : 600)}px)`,
      }}
    >
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: row.color }}>
        {row.name}
      </div>
      <div style={{ marginTop: 12, fontFamily: MONO, fontWeight: 700, fontSize: 64 }}>
        <span style={{ color: C.keyword }}>{row.code[0]}</span>{' '}
        <span style={{ color: C.string }}>{row.code[1]}</span>
      </div>
    </div>
  )
}

const Everywhere = ({ duration }: { duration: number }) => {
  const pills = usePop(44)
  return (
    <AbsoluteFill>
      <Headline lines={['En tu *celular*', 'y en tu *aula*']} />
      <FeaturePhone src="screens/embed.png" duration={duration} />
      <PopCallout
        src="screens/embed.png"
        region={{ x: 40, y: 1748, w: 1210, h: 156 }}
        delay={22}
        top={1110}
        glow={C.green}
      />
      <div
        style={{
          position: 'absolute',
          top: 1490,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          opacity: pills,
          transform: `translateY(${(1 - pills) * 60}px)`,
        }}
      >
        <Pill color={C.accent} style={{ fontSize: 36, padding: '16px 28px' }}>
          Instálalo como app
        </Pill>
        <Pill color={C.green} style={{ fontSize: 36, padding: '16px 28px' }}>
          Insértalo en Canvas
        </Pill>
      </div>
    </AbsoluteFill>
  )
}

const Cta = () => {
  const frame = useCurrentFrame()
  const logo = usePop(0, 11)
  const url = usePop(16, 12)
  const tags = usePop(34)
  const pulse = 1 + 0.025 * Math.sin((frame - 40) / 6) * (frame > 40 ? 1 : 0)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 140 }}>
      <Logo
        size={260}
        style={{
          transform: `scale(${logo}) rotate(${(1 - logo) * 90}deg)`,
          filter: 'drop-shadow(0 20px 60px rgba(46,230,246,0.35))',
        }}
      />
      <KineticLine words={words('Pruébalo')} size={150} delay={6} style={{ marginTop: 30 }} />
      <KineticLine words={[{ text: 'gratis', color: C.green }]} size={170} delay={10} />
      <div
        style={{
          marginTop: 70,
          padding: '40px 36px',
          width: 980,
          borderRadius: 36,
          background: 'rgba(33,37,43,0.92)',
          border: `4px solid ${C.cyan}`,
          boxShadow: `0 0 90px rgba(46,230,246,0.45)`,
          textAlign: 'center',
          fontFamily: MONO,
          fontWeight: 700,
          lineHeight: 1.15,
          opacity: url,
          transform: `translateY(${(1 - url) * 120}px) scale(${pulse})`,
        }}
      >
        <div style={{ fontSize: 74, color: C.fg }}>stepcode.</div>
        <div style={{ fontSize: 62, color: C.cyan }}>letsbuildsolutions.com</div>
      </div>
      <div
        style={{
          marginTop: 56,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 46,
          color: C.muted,
          opacity: tags,
          transform: `translateY(${(1 - tags) * 30}px)`,
        }}
      >
        Sin registro · Código abierto
      </div>
    </AbsoluteFill>
  )
}

// ---------------------------------------------------------------------------------------------

const SCENES: Scene[] = [
  { id: 'hook', duration: 72, render: () => <Hook /> },
  { id: 'new-home', duration: 84, render: () => <NewHome /> },
  { id: 'domain', duration: 150, render: () => <Domain /> },
  { id: 'version', duration: 54, render: () => <Version /> },
  { id: 'errors', duration: 114, render: (d) => <Errors duration={d} /> },
  { id: 'debugger', duration: 120, render: (d) => <Debugger duration={d} /> },
  { id: 'autocomplete', duration: 114, render: (d) => <Autocomplete duration={d} /> },
  { id: 'languages', duration: 78, render: () => <Languages /> },
  { id: 'everywhere', duration: 108, render: (d) => <Everywhere duration={d} /> },
  { id: 'cta', duration: 186, render: () => <Cta /> },
]

export const SCENE_STARTS: Record<string, number> = {}
let cursor = 0
for (const scene of SCENES) {
  SCENE_STARTS[scene.id] = cursor
  cursor += scene.duration
}
export const TOTAL_FRAMES = cursor

/** Thin progress bar along the top edge, in the logo's gradient. */
const Progress = () => {
  const frame = useCurrentFrame()
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: 10,
        width: `${(frame / TOTAL_FRAMES) * 100}%`,
        background: `linear-gradient(90deg, ${C.cyan}, ${C.blue}, ${C.keyword}, ${C.orange}, ${C.yellow})`,
      }}
    />
  )
}

export const Promo = () => {
  return (
    <AbsoluteFill>
      <Background />
      {SCENES.map((scene) => (
        <Sequence
          key={scene.id}
          from={SCENE_STARTS[scene.id]}
          durationInFrames={scene.duration}
          name={scene.id}
        >
          <SceneShell duration={scene.duration}>{scene.render(scene.duration)}</SceneShell>
        </Sequence>
      ))}
      <Progress />
    </AbsoluteFill>
  )
}

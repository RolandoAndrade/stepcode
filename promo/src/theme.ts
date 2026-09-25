import { loadFont } from '@remotion/google-fonts/Inter'
import { cancelRender, continueRender, delayRender, staticFile } from 'remotion'

// Display font for captions.
export const { fontFamily: SANS } = loadFont('normal', {
  weights: ['500', '700', '800', '900'],
  subsets: ['latin', 'latin-ext'],
})

// The editor's bundled mono font, copied from packages/editor/public/fonts.
export const MONO = '"JetBrains Mono", ui-monospace, monospace'
if (typeof document !== 'undefined') {
  const handle = delayRender('JetBrains Mono')
  const faces = [
    new FontFace(
      'JetBrains Mono',
      `url(${staticFile('fonts/JetBrainsMono-Regular.woff2')}) format('woff2')`,
      { weight: '400' },
    ),
    new FontFace(
      'JetBrains Mono',
      `url(${staticFile('fonts/JetBrainsMono-Bold.woff2')}) format('woff2')`,
      { weight: '700' },
    ),
  ]
  Promise.all(faces.map((f) => f.load()))
    .then((loaded) => {
      for (const f of loaded) document.fonts.add(f)
      continueRender(handle)
    })
    .catch((error) => cancelRender(error))
}

// One Dark tokens from packages/editor/src/theme/tokens.css, plus the logo's hues.
export const C = {
  bg: '#0d0f14',
  surface: '#21252b',
  editorBg: '#282c34',
  fg: '#e8ebf1',
  muted: '#8b93a3',
  accent: '#61afef',
  keyword: '#c678dd',
  string: '#98c379',
  number: '#d19a66',
  type: '#e5c07b',
  error: '#e06c75',
  operator: '#56b6c2',
  // Logo hexagon hues
  cyan: '#2ee6f6',
  blue: '#1e9bff',
  orange: '#ff7a2f',
  yellow: '#ffc21a',
  green: '#9be22d',
} as const

export const FPS = 30
export const WIDTH = 1080
export const HEIGHT = 1920
/** Keep captions inside this band so TikTok / Reels / Shorts chrome never covers them. */
export const SAFE_TOP = 170
export const SAFE_BOTTOM = HEIGHT - 260

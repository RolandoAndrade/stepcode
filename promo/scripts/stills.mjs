// Renders review stills, one per scene of interest, into out/.
// Frames are absolute; keep them in sync with SCENES in src/Promo.tsx.
import { execFileSync } from 'node:child_process'

const STILLS = {
  '01-hook': 55,
  '02-domain': 270,
  '03-version': 340,
  '04-errors': 445,
  '05-debugger': 560,
  '06-autocomplete': 680,
  '07-languages': 770,
  '08-everywhere': 870,
  '09-cta': 1030,
}

const only = process.argv.slice(2)
for (const [name, frame] of Object.entries(STILLS)) {
  if (only.length > 0 && !only.includes(name)) continue
  execFileSync(
    'npx',
    [
      'remotion',
      'still',
      'src/index.ts',
      'StepCodePromo',
      `out/still-${name}.png`,
      `--frame=${frame}`,
    ],
    { stdio: 'inherit' },
  )
}

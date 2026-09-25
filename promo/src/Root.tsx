import { Composition } from 'remotion'
import { Promo, TOTAL_FRAMES } from './Promo'
import { FPS, HEIGHT, WIDTH } from './theme'

export const Root = () => (
  <Composition
    id="StepCodePromo"
    component={Promo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
)

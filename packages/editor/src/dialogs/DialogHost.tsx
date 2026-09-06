import type { FileEnvironment } from '../files/actions'
import { About } from './About'
import { ConfirmSave } from './ConfirmSave'
import { Examples } from './Examples'
import { Settings } from './Settings/Settings'
import { Share } from './Share'
import { Toaster } from './Toaster'
import { Warnings } from './Warnings'

/** Spec §6, §8, §10: every dialog lives here, each one opened by the store's `dialog` field. */
export function DialogHost({ env }: { env: FileEnvironment }) {
  return (
    <>
      <Settings />
      <Examples />
      <Share />
      <About />
      <Warnings />
      <ConfirmSave env={env} />
      <Toaster />
    </>
  )
}

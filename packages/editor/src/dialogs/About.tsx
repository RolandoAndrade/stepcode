import { useEditorStore } from '../store/context'
import { stringsOf } from '../store/store'
import { APP_VERSION } from '../version'
import { Dialog } from './Dialog'

const DEFAULT_REPOSITORY = 'https://github.com/RolandoAndrade/stepcode'
const DEFAULT_ACADEMY = 'https://stepcode.online'

/** Spec §8.6: version, licence and the project's public links. */
export function About({
  repository = DEFAULT_REPOSITORY,
  academy = DEFAULT_ACADEMY,
}: {
  repository?: string
  academy?: string
}) {
  const strings = useEditorStore(stringsOf)
  return (
    <Dialog name="about" title={strings.about.title}>
      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/logo.png" alt="" width={48} height={48} />
        <div className="font-semibold text-sm">{strings.app.title}</div>
        <p className="text-muted text-sm">{strings.about.tagline}</p>
        <p className="text-muted text-xs">{strings.about.version(APP_VERSION)}</p>
        <div className="flex gap-3 text-sm">
          <a href={repository} target="_blank" rel="noreferrer" className="text-accent underline">
            {strings.about.repository}
          </a>
          <a href={academy} target="_blank" rel="noreferrer" className="text-accent underline">
            {strings.about.academy}
          </a>
        </div>
        <p className="text-muted text-xs">{strings.about.licence}</p>
      </div>
    </Dialog>
  )
}

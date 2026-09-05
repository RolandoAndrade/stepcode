import { builtinProfiles } from '@stepcode/profiles'
import { useMemo, useState } from 'react'
import { starterProgram } from '../../profiles/starter'
import { profileItems } from '../../shell/StatusBar'
import { useEditorStore } from '../../store/context'
import { customProfileOf, profileOf, stringsOf } from '../../store/store'
import { RadioCards, Section } from './controls'
import { ProfileBuilder } from './ProfileBuilder'

/** Spec §6: the profile picker plus the custom profile builder. */
export function Language() {
  const strings = useEditorStore(stringsOf)
  const profileId = useEditorStore((s) => s.profileId)
  const customProfiles = useEditorStore((s) => s.customProfiles)
  const settings = useEditorStore((s) => s.settings)
  const setProfile = useEditorStore((s) => s.setProfile)
  const [builderOpen, setBuilderOpen] = useState(false)
  const items = useMemo(
    () =>
      profileItems({ profileId, customProfiles, settings }).map((item) => ({
        id: item.id,
        name: item.name,
        preview: starterProgram(profileOf({ profileId: item.id, customProfiles }))
          .split('\n')
          .slice(0, 4)
          .join('\n'),
      })),
    [profileId, customProfiles, settings],
  )
  const t = strings.settings.language
  const isCustom = !builtinProfiles.has(profileId)
  const editing = isCustom ? customProfileOf({ customProfiles }, profileId) : undefined

  return (
    <Section title={strings.settings.sections.language} resetLabel={strings.settings.reset}>
      <RadioCards label={t.profile} value={profileId} options={items} onChange={setProfile} />
      <div className="mt-3">
        <button
          type="button"
          className="h-8 rounded border border-border px-3 text-sm hover:bg-surface-raised"
          onClick={() => setBuilderOpen((open) => !open)}
        >
          {t.customize}
        </button>
      </div>
      {builderOpen ? (
        <ProfileBuilder
          base={isCustom ? 'es' : profileId}
          {...(isCustom && editing !== undefined ? { editing } : {})}
          onDone={() => setBuilderOpen(false)}
        />
      ) : null}
    </Section>
  )
}

import { builtinProfiles, type ProfileInput } from '@stepcode/profiles'
import { useMemo, useState } from 'react'
import { starterProgram } from '../../profiles/starter'
import { profileItems } from '../../shell/StatusBar'
import { useEditorStore } from '../../store/context'
import { customProfileOf, profileOf, stringsOf } from '../../store/store'
import { Settings as GearIcon } from '../../ui/icons'
import { IconButton } from '../../ui/Tooltip'
import { RadioCards, Section } from './controls'
import { ProfileBuilder } from './ProfileBuilder'

interface BuilderTarget {
  readonly base: string
  readonly editing?: ProfileInput
}

/** The profile a custom input extends, or `es` if it somehow has none. */
function extendsOf(input: ProfileInput): string {
  return 'extends' in input ? input.extends : 'es'
}

/** Spec §6: the profile picker plus the custom profile builder. */
export function Language() {
  const strings = useEditorStore(stringsOf)
  const profileId = useEditorStore((s) => s.profileId)
  const customProfiles = useEditorStore((s) => s.customProfiles)
  const settings = useEditorStore((s) => s.settings)
  const setProfile = useEditorStore((s) => s.setProfile)
  const [builder, setBuilder] = useState<BuilderTarget | null>(null)
  const items = useMemo(
    () =>
      profileItems({ profileId, customProfiles, settings }).map((item) => {
        let preview: string | undefined
        try {
          // A persisted custom profile can be corrupted (e.g. edited by hand); resolving it
          // must not take down the whole dialog, just this one card's preview.
          preview = starterProgram(profileOf({ profileId: item.id, customProfiles }))
            .split('\n')
            .slice(0, 4)
            .join('\n')
        } catch {
          preview = undefined
        }
        return { id: item.id, name: item.name, ...(preview === undefined ? {} : { preview }) }
      }),
    [profileId, customProfiles, settings],
  )
  const t = strings.settings.language
  const isCustom = !builtinProfiles.has(profileId)
  const activeCustom = isCustom ? customProfileOf({ customProfiles }, profileId) : undefined
  // Always a fresh, empty profile: based on the active builtin, or on the active custom
  // profile's own parent (never on the active custom profile itself).
  const createBase = isCustom
    ? activeCustom !== undefined
      ? extendsOf(activeCustom)
      : 'es'
    : profileId

  return (
    <Section title={strings.settings.sections.language} resetLabel={strings.settings.reset}>
      <RadioCards label={t.profile} value={profileId} options={items} onChange={setProfile} />
      {customProfiles.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1">
          {customProfiles.map((custom) => (
            <li key={custom.id} className="flex items-center justify-between text-muted text-xs">
              <span className="truncate font-mono">{custom.id}</span>
              <IconButton
                label={t.builder}
                onClick={() => setBuilder({ base: extendsOf(custom), editing: custom })}
              >
                <GearIcon size={14} />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3">
        <button
          type="button"
          className="h-8 rounded border border-border px-3 text-sm hover:bg-surface-raised"
          onClick={() => setBuilder({ base: createBase })}
        >
          {t.customize}
        </button>
      </div>
      {builder !== null ? (
        <ProfileBuilder
          base={builder.base}
          {...(builder.editing === undefined ? {} : { editing: builder.editing })}
          onDone={() => setBuilder(null)}
        />
      ) : null}
    </Section>
  )
}

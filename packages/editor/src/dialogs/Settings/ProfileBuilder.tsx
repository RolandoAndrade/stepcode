import {
  BUILTIN_KEYS,
  builtinProfiles,
  DEFAULT_OPTIONS,
  KEYWORD_KEYS,
  OPERATOR_KEYS,
  type ProfileInput,
  type ProfileOptions,
  profiles,
  type ResolvedProfile,
  resolveProfile,
  TYPE_KEYS,
} from '@stepcode/profiles'
import { useMemo, useState } from 'react'
import { starterProgram } from '../../profiles/starter'
import { profileItems } from '../../shell/StatusBar'
import { useEditorStore, useEditorStoreApi } from '../../store/context'
import { PROFILE_IDS, profileOf, stringsOf } from '../../store/store'
import { Select, Toggle } from './controls'

type SectionKey = 'keywords' | 'types' | 'operators' | 'builtins'
type Spellings = Readonly<Record<string, readonly string[]>>

export interface BuilderForm {
  readonly id: string
  readonly base: string
  readonly locale?: string
  readonly keywords: Spellings
  readonly types: Spellings
  readonly operators: Spellings
  readonly builtins: Spellings
  readonly options: Partial<ProfileOptions>
}

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function textToSpellings(text: string): string[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

export function spellingsToText(list: readonly string[]): string {
  return list.join(', ')
}

/** Only the sections and options that differ from the base survive into the input. */
export function buildInput(form: BuilderForm): ProfileInput {
  const input: Record<string, unknown> = { id: form.id, extends: form.base }
  if (form.locale !== undefined) input.locale = form.locale
  for (const section of ['keywords', 'types', 'operators', 'builtins'] as const) {
    if (Object.keys(form[section]).length > 0) input[section] = form[section]
  }
  if (Object.keys(form.options).length > 0) input.options = form.options
  return input as ProfileInput
}

export function validateInput(
  input: ProfileInput,
  customs: readonly ProfileInput[],
): { ok: true; profile: ResolvedProfile } | { ok: false; message: string } {
  if (input.id === '') return { ok: false, message: 'id' }
  if (PROFILE_IDS.includes(input.id) || customs.some((c) => c.id === input.id)) {
    return { ok: false, message: 'duplicate' }
  }
  try {
    const registry = new Map(builtinProfiles)
    for (const custom of customs) registry.set(custom.id, custom)
    return { ok: true, profile: resolveProfile(input, registry) }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) }
  }
}

const OPTION_KEYS = Object.keys(DEFAULT_OPTIONS) as (keyof ProfileOptions)[]

function sectionOf(profile: ResolvedProfile, section: SectionKey): Spellings {
  return profile[section] as Spellings
}

export function ProfileBuilder({
  base = 'es',
  editing,
  onDone,
}: {
  base?: string
  editing?: ProfileInput
  onDone: () => void
}) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const customs = useEditorStore((s) => s.customProfiles)
  const settings = useEditorStore((s) => s.settings)
  // Editing a custom profile rebases on its own `extends`, never on the `base` prop (which
  // is only meaningful when creating a new profile): a profile extending `en` must stay on
  // `en` after a save, not silently move onto `es`.
  const editingExtends = editing !== undefined && 'extends' in editing ? editing.extends : undefined
  const effectiveBase = editingExtends ?? base
  const seed = editing as
    | (Partial<Record<SectionKey, Spellings>> & {
        options?: Partial<ProfileOptions>
        locale?: string
      })
    | undefined
  const [name, setName] = useState(editing?.id ?? '')
  const [form, setForm] = useState<BuilderForm>(() => ({
    id: editing?.id ?? '',
    base: effectiveBase,
    keywords: seed?.keywords ?? {},
    types: seed?.types ?? {},
    operators: seed?.operators ?? {},
    builtins: seed?.builtins ?? {},
    options: seed?.options ?? {},
    ...(seed?.locale === undefined ? {} : { locale: seed.locale }),
  }))
  // What each spelling field literally holds, keyed `<section>.<key>`. The parsed lists in
  // `form` are a lossy view of it ("Escribir," parses to one spelling), so the field can never
  // be rendered from them: the comma the author just typed would vanish under the cursor.
  const [texts, setTexts] = useState<Record<string, string>>({})
  const id = editing?.id ?? slugify(name)
  // A custom profile may extend another custom profile; only `profileOf` knows how to resolve
  // that chain, and a chain that no longer resolves must not take the builder down with it.
  const baseProfile = useMemo(() => {
    try {
      return profileOf({ profileId: form.base, customProfiles: customs })
    } catch {
      return profiles.es
    }
  }, [form.base, customs])
  const baseOptions = useMemo(
    () =>
      profileItems({ profileId: form.base, customProfiles: customs, settings })
        .filter((item) => item.id !== id)
        .map((item) => ({ value: item.id, label: item.name })),
    [form.base, customs, settings, id],
  )
  const input = useMemo(() => buildInput({ ...form, id }), [form, id])
  const others = editing === undefined ? customs : customs.filter((c) => c.id !== editing.id)
  const result = useMemo(() => validateInput(input, others), [input, others])
  const preview = result.ok ? starterProgram(result.profile) : ''
  const t = strings.settings.language

  const setSpellings = (section: SectionKey, key: string, text: string): void => {
    setTexts((previous) => ({ ...previous, [`${section}.${key}`]: text }))
    setForm((f) => {
      const next: Record<string, readonly string[]> = { ...f[section] }
      const list = textToSpellings(text)
      const baseList = sectionOf(baseProfile, section)[key] ?? []
      // Spelling by spelling: "De Otro Modo" and "De, Otro, Modo" are different profiles.
      const same = list.length === baseList.length && list.every((one, i) => one === baseList[i])
      if (same) delete next[key]
      else next[key] = list
      return { ...f, [section]: next }
    })
  }

  /** A new base means new spellings everywhere: nothing typed against the old one is kept. */
  const setBase = (next: string): void => {
    setTexts({})
    setForm((f) => ({ ...f, base: next }))
  }

  const table = (section: SectionKey, keys: readonly string[], title: string) => (
    <details className="mt-2" open={section === 'keywords'}>
      <summary className="cursor-pointer text-sm">{title}</summary>
      <div className="mt-1 grid gap-1 sm:grid-cols-2">
        {keys.map((key) => (
          <label key={key} className="flex items-center gap-2 text-xs">
            <span className="w-32 truncate font-mono text-muted">{key}</span>
            <input
              aria-label={key}
              value={
                texts[`${section}.${key}`] ??
                spellingsToText(form[section][key] ?? sectionOf(baseProfile, section)[key] ?? [])
              }
              onChange={(event) => setSpellings(section, key, event.target.value)}
              className="h-7 min-w-0 flex-1 rounded border border-border bg-surface px-2 font-mono text-fg"
            />
          </label>
        ))}
      </div>
    </details>
  )

  const message = result.ok
    ? null
    : result.message === 'duplicate'
      ? t.duplicate
      : result.message === 'id'
        ? t.nameHint
        : t.invalid(result.message)

  return (
    <div className="mt-3 rounded-md border border-border p-3">
      <h4 className="font-semibold text-sm">{t.builder}</h4>
      <label className="mt-2 flex items-center gap-2 text-sm">
        <span className="w-24">{t.name}</span>
        <input
          aria-label={t.name}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={editing !== undefined}
          className="h-8 flex-1 rounded border border-border bg-surface px-2 text-fg"
        />
      </label>
      <p className="mt-1 text-muted text-xs">
        {t.nameHint} · {t.spellingsHint}
      </p>
      <Select label={t.base} value={form.base} options={baseOptions} onChange={setBase} />
      {table('keywords', KEYWORD_KEYS, t.keywords)}
      {table('types', TYPE_KEYS, t.types)}
      {table('operators', OPERATOR_KEYS, t.operators)}
      {table('builtins', BUILTIN_KEYS, t.builtins)}
      <details className="mt-2">
        <summary className="cursor-pointer text-sm">{t.options}</summary>
        {OPTION_KEYS.map((key) => {
          const current = form.options[key] ?? baseProfile.options[key]
          const checked = key === 'indexBase' ? current === 1 : current === true
          return (
            <Toggle
              key={key}
              label={t.option[key]}
              checked={checked}
              onChange={(next) =>
                setForm((f) => ({
                  ...f,
                  options: { ...f.options, [key]: key === 'indexBase' ? (next ? 1 : 0) : next },
                }))
              }
            />
          )
        })}
      </details>
      <section aria-label={t.preview} className="mt-3">
        <h5 className="text-muted text-xs">{t.preview}</h5>
        <pre className="mt-1 rounded bg-bg p-2 font-mono text-xs">{preview}</pre>
      </section>
      {message !== null && name !== '' ? (
        <p role="alert" className="mt-2 text-error text-sm">
          {message}
        </p>
      ) : null}
      <div className="mt-3 flex justify-end gap-2">
        {editing !== undefined ? (
          <button
            type="button"
            className="h-8 rounded px-3 text-error text-sm hover:bg-surface-raised"
            onClick={() => {
              store.getState().deleteCustomProfile(editing.id)
              onDone()
            }}
          >
            {t.delete}
          </button>
        ) : null}
        <button
          type="button"
          disabled={!result.ok || id === ''}
          className="h-8 rounded bg-accent px-3 text-bg text-sm disabled:opacity-40"
          onClick={() => {
            store.getState().saveCustomProfile(input)
            store.getState().setProfile(input.id)
            onDone()
          }}
        >
          {t.save}
        </button>
      </div>
    </div>
  )
}

import * as Tabs from '@radix-ui/react-tabs'
import { useEffect, useState } from 'react'
import {
  DEFAULT_EMBED_HEIGHT,
  DEFAULT_EMBED_OPTIONS,
  type EmbedOptions,
  embedSnippet,
  embedUrl,
  MIN_EMBED_HEIGHT,
  PREVIEW_MAX_HEIGHT,
} from '../share/embed'
import { encodeShare, SHARE_WARN_LENGTH, shareUrl } from '../share/link'
import { useEditorStore, useEditorStoreApi } from '../store/context'
import { displayName } from '../store/document'
import { stringsOf } from '../store/store'
import { Dialog } from './Dialog'

interface Clipboard {
  writeText(text: string): Promise<void>
}

const TAB =
  'h-8 px-3 text-sm text-muted data-[state=active]:border-accent data-[state=active]:border-b-2 data-[state=active]:text-fg'

const FIELD = 'h-8 rounded border border-border bg-surface-raised px-2 text-sm text-fg'

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-accent"
      />
      {label}
    </label>
  )
}

/** Spec §5 and §8.5: the program as a link, or as an iframe a teacher pastes into a course page. */
export function Share({
  clipboard,
  base,
  origin,
}: {
  clipboard?: Clipboard
  base?: string
  origin?: string
}) {
  const store = useEditorStoreApi()
  const strings = useEditorStore(stringsOf)
  const source = useEditorStore((s) => s.source)
  const profileId = useEditorStore((s) => s.profileId)
  const name = useEditorStore((s) => s.name)
  const open = useEditorStore((s) => s.dialog === 'share')
  const [hash, setHash] = useState('')
  const [options, setOptions] = useState<EmbedOptions>(DEFAULT_EMBED_OPTIONS)
  const [height, setHeight] = useState(DEFAULT_EMBED_HEIGHT)
  const [tab, setTab] = useState<'link' | 'embed'>('link')

  // The dialog host keeps this component mounted for the whole session; without the gate every
  // keystroke in the editor would deflate the whole program again.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    encodeShare({ source, profileId, name })
      .then((next) => {
        if (!cancelled) setHash(next)
      })
      .catch((error: unknown) => {
        // Compression can fail or be torn down mid-flight; an empty field is the honest
        // result, and an unhandled rejection would take the page (or a test run) with it.
        if (cancelled) return
        console.warn('stepcode: could not build the share link', error)
        setHash('')
      })
    return () => {
      cancelled = true
    }
  }, [open, source, profileId, name])

  const url = hash === '' ? '' : shareUrl(hash, base)
  const frame = hash === '' ? '' : embedUrl(hash, options, origin)
  const snippet = frame === '' ? '' : embedSnippet(frame, height, displayName(name))

  const copy = async (text: string, confirmation: string): Promise<void> => {
    await (clipboard ?? navigator.clipboard).writeText(text)
    store.getState().notify(confirmation)
  }

  return (
    <Dialog name="share" title={strings.share.title} wide>
      <Tabs.Root value={tab} onValueChange={(next) => setTab(next as 'link' | 'embed')}>
        <Tabs.List
          aria-label={strings.share.title}
          className="mb-3 flex gap-1 border-border border-b"
        >
          {/* onClick mirrors Settings/Rail.tsx: Radix activates a tab on `mousedown`, which
              a plain `fireEvent.click` in tests never dispatches. */}
          <Tabs.Trigger value="link" onClick={() => setTab('link')} className={TAB}>
            {strings.share.tabs.link}
          </Tabs.Trigger>
          <Tabs.Trigger value="embed" onClick={() => setTab('embed')} className={TAB}>
            {strings.share.tabs.embed}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="link">
          <input
            type="text"
            readOnly
            aria-label={strings.share.link}
            value={url}
            className={`${FIELD} w-full`}
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => void copy(url, strings.share.copied)}
              className="h-8 rounded bg-accent px-3 text-bg text-sm hover:opacity-90"
            >
              {strings.share.copy}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-accent text-sm underline"
            >
              {strings.share.open}
            </a>
          </div>
          <p className="mt-3 text-muted text-xs">{strings.share.note}</p>
          {url.length > SHARE_WARN_LENGTH ? (
            <p className="mt-2 text-warning text-xs">{strings.share.tooLong}</p>
          ) : null}
        </Tabs.Content>

        <Tabs.Content value="embed">
          <div className="grid grid-cols-2 gap-2">
            <Toggle
              label={strings.share.readOnly}
              checked={options.readonly}
              onChange={(readonly) => setOptions((current) => ({ ...current, readonly }))}
            />
            <Toggle
              label={strings.share.autorun}
              checked={options.autorun}
              onChange={(autorun) => setOptions((current) => ({ ...current, autorun }))}
            />
            <Toggle
              label={strings.share.debug}
              checked={options.debug}
              onChange={(debug) => setOptions((current) => ({ ...current, debug }))}
            />
            <Toggle
              label={strings.share.showProfile}
              checked={options.showProfile}
              onChange={(showProfile) => setOptions((current) => ({ ...current, showProfile }))}
            />
          </div>
          <div className="mt-3 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              {strings.share.theme}
              <select
                value={options.theme}
                onChange={(event) =>
                  setOptions((current) => ({
                    ...current,
                    theme: event.target.value as EmbedOptions['theme'],
                  }))
                }
                className={FIELD}
              >
                <option value="system">{strings.settings.appearance.system}</option>
                <option value="light">{strings.settings.appearance.light}</option>
                <option value="dark">{strings.settings.appearance.dark}</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              {strings.share.height}
              <input
                type="number"
                min={MIN_EMBED_HEIGHT}
                value={height}
                onChange={(event) => {
                  // An emptied field is someone typing a new number, not a request for a 0 px
                  // frame: the last height stands until they finish.
                  if (event.target.value.trim() === '') return
                  const next = Number(event.target.value)
                  setHeight(Number.isFinite(next) ? next : DEFAULT_EMBED_HEIGHT)
                }}
                className={`${FIELD} w-24`}
              />
            </label>
          </div>
          {frame === '' ? (
            // No hash yet (still encoding, or the encode failed): an iframe with an empty `src`
            // resolves to the current document, which would load the whole editor recursively
            // inside its own dialog. A plain placeholder carries the same accessible name.
            <div
              role="img"
              aria-label={strings.share.preview}
              className="mt-3 flex w-full items-center justify-center rounded border border-border text-muted text-xs"
              style={{
                height: Math.min(Math.max(height, MIN_EMBED_HEIGHT), PREVIEW_MAX_HEIGHT),
              }}
            >
              {strings.share.preview}
            </div>
          ) : (
            <iframe
              title={strings.share.preview}
              src={frame}
              width="100%"
              height={Math.min(Math.max(height, MIN_EMBED_HEIGHT), PREVIEW_MAX_HEIGHT)}
              className="mt-3 w-full rounded border border-border"
            />
          )}
          <textarea
            readOnly
            aria-label={strings.share.tabs.embed}
            value={snippet}
            rows={3}
            className="mt-3 w-full rounded border border-border bg-surface-raised p-2 font-mono text-xs text-fg"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => void copy(snippet, strings.share.codeCopied)}
              className="h-8 rounded bg-accent px-3 text-bg text-sm hover:opacity-90"
            >
              {strings.share.copyCode}
            </button>
            <button
              type="button"
              onClick={() => void copy(frame, strings.share.copied)}
              className="h-8 rounded border border-border px-3 text-fg text-sm hover:bg-surface-raised"
            >
              {strings.share.copyUrl}
            </button>
          </div>
          <p className="mt-3 text-muted text-xs">{strings.share.note}</p>
          {frame.length > SHARE_WARN_LENGTH ? (
            <p className="mt-2 text-warning text-xs">{strings.share.tooLong}</p>
          ) : null}
        </Tabs.Content>
      </Tabs.Root>
    </Dialog>
  )
}

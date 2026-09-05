import type { ResolvedProfile } from '@stepcode/profiles'
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { typeLabel } from '../labels'
import { useEditorStore } from '../store/context'
import { type PendingInput, profileOf, stringsOf } from '../store/store'
import type { Strings } from '../strings'

function InputPrompt({
  pending,
  strings,
  profile,
  onSubmit,
}: {
  pending: PendingInput
  strings: Strings
  profile: ResolvedProfile
  onSubmit: (text: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  // A new request object (including a re-ask with `rejected`) takes focus back.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pending isn't read in the body, only used to detect a new request.
  useEffect(() => {
    input.current?.focus()
  }, [pending])
  const label =
    pending.target === null
      ? strings.console.pressKey
      : strings.console.read(pending.target.name, typeLabel(pending.target.type, profile, strings))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(text)
    setText('')
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (pending.target !== null) return
    event.preventDefault()
    onSubmit('')
  }
  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-1 border-t border-border p-2 font-mono text-sm"
    >
      {pending.rejected !== undefined && (
        <p role="alert" className="text-error">
          {pending.rejected}
        </p>
      )}
      <label className="flex items-center gap-2">
        <span className="text-accent">{label}</span>
        <input
          ref={input}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={pending.target === null ? '' : strings.console.placeholder}
          className="min-w-0 flex-1 rounded border border-border bg-surface px-2 py-1 text-fg outline-none focus:border-accent"
          autoComplete="off"
        />
      </label>
    </form>
  )
}

export function Console() {
  const strings = useEditorStore(stringsOf)
  const profile = useEditorStore(profileOf)
  const output = useEditorStore((s) => s.output)
  const pending = useEditorStore((s) => s.pendingInput)
  const wait = useEditorStore((s) => s.wait)
  const error = useEditorStore((s) => s.error)
  const submitInput = useEditorStore((s) => s.submitInput)
  const clearOutput = useEditorStore((s) => s.clearOutput)
  const pre = useRef<HTMLPreElement>(null)
  const stickToBottom = useRef(true)

  // Auto-scroll unless the reader scrolled up (spec §7.2).
  useEffect(() => {
    const element = pre.current
    if (element !== null && stickToBottom.current) element.scrollTop = element.scrollHeight
  })
  const onScroll = () => {
    const element = pre.current
    if (element === null) return
    stickToBottom.current = element.scrollTop + element.clientHeight >= element.scrollHeight - 4
  }

  return (
    <section
      aria-label={strings.console.title}
      className="flex h-full min-h-0 flex-col bg-surface text-fg"
    >
      <header className="flex items-center justify-between border-b border-border px-2 py-1 text-xs text-muted">
        <span>{strings.console.title}</span>
        <button
          type="button"
          onClick={clearOutput}
          className="rounded px-1 hover:bg-surface-raised hover:text-fg"
        >
          {strings.console.clear}
        </button>
      </header>
      <pre
        ref={pre}
        onScroll={onScroll}
        data-testid="console-output"
        className="m-0 min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-2 font-mono text-sm"
      >
        {output.dropped > 0 && (
          <span className="text-muted">{`${strings.console.dropped(output.dropped)}\n`}</span>
        )}
        {output.chunks.join('')}
        {wait !== null && (
          <span className="text-muted">{strings.console.waiting(wait.millis)}</span>
        )}
        {error !== null && (
          <span role="alert" className="text-error">
            {strings.console.errorAt(error.line, error.message)}
          </span>
        )}
      </pre>
      {pending !== null && (
        <InputPrompt pending={pending} strings={strings} profile={profile} onSubmit={submitInput} />
      )}
    </section>
  )
}

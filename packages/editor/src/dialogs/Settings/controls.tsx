import type { ReactNode } from 'react'

const ROW = 'flex min-h-8 items-center justify-between gap-4 py-1 text-sm'

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className={ROW}>
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors duration-150 ${checked ? 'bg-accent' : 'bg-border'}`}
      >
        <span
          className={`absolute top-0.5 left-0 h-4 w-4 rounded-full bg-surface transition-transform duration-150 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (next: T) => void
}) {
  return (
    <label className={ROW}>
      <span>{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-8 rounded border border-border bg-surface px-2 text-fg"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (next: number) => void
}) {
  return (
    <label className={ROW}>
      <span>{label}</span>
      <input
        type="number"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (Number.isInteger(next) && next >= min && next <= max) onChange(next)
        }}
        className="h-8 w-20 rounded border border-border bg-surface px-2 text-fg"
      />
    </label>
  )
}

export function RadioCards<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { id: T; name: string; preview?: ReactNode }[]
  onChange: (next: T) => void
}) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-2">
      <legend className="mb-1 text-sm">{label}</legend>
      {options.map((option) => (
        <label
          key={option.id}
          className={`cursor-pointer rounded-md border p-2 ${option.id === value ? 'border-accent bg-accent-soft' : 'border-border'}`}
        >
          <input
            type="radio"
            name={label}
            value={option.id}
            checked={option.id === value}
            onChange={() => onChange(option.id)}
            className="mr-2"
          />
          <span className="text-sm">{option.name}</span>
          {option.preview !== undefined ? (
            <pre className="mt-1 overflow-hidden text-muted text-xs">{option.preview}</pre>
          ) : null}
        </label>
      ))}
    </fieldset>
  )
}

/** `onReset` and `resetLabel` travel together: a section with nothing to reset passes neither. */
export function Section({
  title,
  onReset,
  resetLabel,
  children,
}: {
  title: string
  onReset?: () => void
  resetLabel?: string
  children: ReactNode
}) {
  return (
    <section aria-label={title} className="flex flex-col gap-1">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-base">{title}</h3>
        {onReset !== undefined && resetLabel !== undefined ? (
          <button type="button" onClick={onReset} className="text-muted text-xs hover:text-fg">
            {resetLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  )
}

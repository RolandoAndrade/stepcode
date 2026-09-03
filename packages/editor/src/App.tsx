import { packageName } from '@stepcode/codemirror'

export function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-neutral-950 text-neutral-100">
      <h1 className="text-4xl font-semibold">StepCode</h1>
      <p className="font-mono text-sm text-neutral-400">{packageName}</p>
    </main>
  )
}

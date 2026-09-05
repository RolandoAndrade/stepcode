# Editor shell (sub-project 4b) design

Date: 2026-09-05. Branch `RolandoAndrade/v2`. Builds on the editor core spec
(`2026-09-05-editor-core-design.md`) and the umbrella spec (`2026-09-03-stepcode-v2-design.md`,
§4). The core spec's protocol, driver, host, store slices, panels and theme tokens stay as they
are; this spec adds everything a person sees around them.

## 1. Goal and scope

4a proved the runtime and rendered four panels in a fixed grid. The result works and looks like an
unstyled prototype: icons without hierarchy, no status bar, no menu, no persistence, a phone
layout that does not exist. 4b turns it into the product: an editor that a person who has never
seen code can open, run an example in, and read the result of, without feeling they are inside an
IDE; and that a teacher can rearrange, float and project.

Design intent, in priority order:

1. **Calm by default.** The first screen is the editor and a run button. Everything else is
   present but collapsed, and unfolds when an event needs it.
2. **Words where it matters, icons where they are expected.** Toolbar actions are icons with
   tooltips (label plus shortcut). State, profile and problems are text in the status bar, where
   every editor puts them.
3. **Nothing gets lost.** Panels collapse, they never close. The document autosaves. A refresh
   restores text, name, profile, layout and settings.
4. **One design, three hosts.** The same panels mount inside dockview on a desktop, inside a fixed
   column with a bottom sheet on a phone, and (in 4c) inside the compact embed.
5. **Proven palette.** One Light and One Dark stay canonical; the accent is the blue those themes
   already define. The hexagon logo is the application icon and nothing else.

### 1.1 Split with 4c

| In 4b | In 4c |
|---|---|
| dockview layout, collapse, float, pop-out, persistence, reset | `?example=`, `?src=` loading, allowlist |
| toolbar, menu, filename, file actions | `readonly`, `autorun`, `hideProfile` flags |
| status bar | `/embed` route, `postMessage` API |
| settings dialog, custom profile builder | Playwright smoke tests (desktop, phone, embed) |
| open, save, save as, autosave, new | |
| examples gallery, example transposition | |
| share dialog, `#code=` encode **and decode** | |
| UI language separate from profile | |
| phone layout: top bar, symbol bar, bottom sheet | |
| PWA (manifest, service worker, update toast), About | |

Decoding `#code=` moves from 4c to 4b because a share link that nobody can open is not a
feature. The umbrella spec listed it under URLs; the split above supersedes that line.

### 1.2 Deviations from the umbrella spec

- The default layout contains only the editor plus one collapsed bottom group. The umbrella's
  "Editor, Console, Variables, Problems" all-visible default is replaced by progressive
  disclosure (§3.2).
- Panels cannot be closed, only collapsed (§3.3). The Vista menu therefore has no checkmarks; its
  items focus and expand.
- File actions are also toolbar icons, not menu-only (§4.2).
- The phone layout ships in 4b, not 4c.

## 2. Visual language

### 2.1 Bands

Four horizontal bands on a desktop:

| Band | Height | Content |
|---|---|---|
| Toolbar | 40 px | menu, filename, file actions · run cluster |
| Layout area | remaining | dockview (§3) |
| Status bar | 24 px | cursor · profile · problems · run state |

The toolbar and status bar use `--sc-surface`; the layout area uses `--sc-bg`; groups inside
dockview use `--sc-surface` for headers and `--sc-bg` for bodies. A 1 px hairline in
`--sc-border` separates bands. No other borders; shadows only on floating groups and dialogs.

### 2.2 Type, spacing, icons, motion

- **UI font:** the system stack (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`).
  Sizes: 14 px toolbar and dialogs, 13 px panel bodies, 12 px group headers, tabs and status bar.
- **Code font:** JetBrains Mono, self-hosted from `packages/editor/public/fonts` (woff2, Regular
  and Bold), `font-variant-ligatures: none`. 14 px desktop, 15 px phone; the size is a setting.
- **Spacing:** 4 px grid. Horizontal padding 8 px in bars, 12 px in dialogs.
- **Icons:** `lucide-react`, 16 px, stroke 1.75, `currentColor`. Every icon button has an
  accessible name and, on pointer devices, a tooltip "Label · Shortcut". The shortcut renders
  `⌘` on macOS and `Ctrl` elsewhere (`navigator.platform` check in one helper).
- **Focus:** 2 px ring in `--sc-accent`, offset 1 px, visible only for keyboard focus.
- **Motion:** 150 ms ease-out on opacity and transform for menus, popovers, dialogs, the bottom
  sheet and collapse; `prefers-reduced-motion` disables transforms.
- **Density:** buttons are 28 px tall in the toolbar and 32 px in dialogs; touch targets on the
  phone are at least 44 px.

### 2.3 Tokens

The 24 tokens from 4a stay. 4b adds, in the same file and both themes:

| Token | Use |
|---|---|
| `--sc-accent-soft` | drop targets, active tab background, selected rows (accent at ~15 %) |
| `--sc-overlay` | dialog backdrop |
| `--sc-shadow` | floating groups and dialogs |
| `--sc-changed` | Variables value flash (a soft yellow from the palette) |

Tailwind exposes them through the existing `@theme inline` block. The tokens-only test extends to
the new dockview and Radix styles: no literal colors outside `tokens.css`.

### 2.4 Theme preference

The stored preference is `'light' | 'dark' | 'system'`. `system` follows
`prefers-color-scheme` through a media listener and re-applies on change. The store's `theme`
field becomes `themePreference`; the resolved theme is derived. `applyTheme` and
`resolveInitialTheme` from 4a stay; the latter is called with the stored preference.

## 3. Layout area

### 3.1 Engine

`dockview-react` (latest 4.x at plan time, pinned). One `DockviewReact` at the root of the layout
area. Four panels are registered: `editor`, `console`, `problems`, `variables`. The panel
components are the 4a components unchanged; a thin wrapper per panel adapts the dockview props.

All dockview chrome is replaced by custom components:

- **Tab:** label only, 12 px, muted; the active tab of a multi-tab group has `--sc-fg` and a 2 px
  accent underline. No icons, no close button.
- **Group header:** the tabs on the left; on the right a collapse chevron and, for the console,
  panel-owned actions (clear, auto-scroll). A single-panel group renders its label like a heading
  rather than a tab. Height 28 px.
- **Drop overlay:** `--sc-accent-soft` fill with a 1 px accent border.
- **Floating group:** hairline border, `--sc-shadow`, 8 px radius, draggable by its header,
  resizable by its edges. Minimum size 240 × 160.
- **Watermark:** none.

The editor panel is locked: it cannot be floated, popped out, or moved into a tab group with
other panels; it accepts panels docked beside it. Dragging the editor tab does nothing.

### 3.2 Default layout

```
┌───────────────────────────────────────┐
│ editor                                │
│                                       │
│                                       │
├───────────────────────────────────────┤
│ Consola │ Problemas │ Variables    ⌄  │  ← collapsed bottom group, 28 px
└───────────────────────────────────────┘
```

One bottom group with the three panels as tabs, collapsed. Its expanded height is 30 % of the
area (minimum 120 px). "Restablecer diseño" returns to exactly this.

### 3.3 Collapse

Collapse is a shell feature layered over dockview; dockview has no primitive for it.

- Every docked group has a chevron. Collapsing sets a size constraint on the group equal to its
  header size (`maximumHeight` for groups on the top/bottom edge, `maximumWidth` for groups on the
  left/right edge) and remembers the previous size. Expanding lifts the constraint and restores
  the size.
- A side group collapsed to a vertical strip shows its labels rotated 90° reading bottom to top.
  Clicking a label in a collapsed strip expands the group and activates that tab.
- Floating and popped-out groups do not collapse; their chevron is absent.
- Dragging a tab out of a collapsed group expands nothing; the new group is expanded.
- A group that is collapsed when the user starts a drag onto it becomes a tab target as usual.

The set of collapsed group ids is stored next to dockview's JSON (§7).

### 3.4 Auto-expand

Events that expand a collapsed group and activate a tab, unless the user collapsed that group
since the current run started:

| Event | Activates |
|---|---|
| a run starts (`ready → running` or `→ paused` through Depurar) | Consola |
| the run pauses for the first time in this run (Depurar, breakpoint, F6) | Variables |
| the program asks for input | Consola, and focuses the input field |
| the status bar problems item is clicked | Problemas |
| a Vista menu item is chosen | that panel, always |

"Since the current run started" is a flag per group set by a manual collapse and cleared when the
next run starts. The Diseño setting "Mostrar consola al ejecutar" turns the first row off.

### 3.5 Pop-out

Dockview's popout groups open a browser window that clones the stylesheets of the opener.
CodeMirror in a popout works because its styles are injected into the document that hosts the
view; the console, problems and variables panels use Tailwind classes that arrive with the cloned
sheets. Popped-out groups are not persisted: on reload they return to their last docked position
(dockview's own behavior). One smoke test mounts a panel in a second `window` object under
happy-dom; real popout behavior is checked in 4c's Playwright pass.

### 3.6 Panel refinements

Changes to the 4a panels, all inside the panel files:

- **Consola.** Header actions: Limpiar (trash icon) and Desplazamiento automático (toggle). A
  finished run appends a muted line "— Programa terminado —"; an error run appends the formatted
  diagnostic in `--sc-error` with a "ver línea N" button that reveals the span. The input field
  shows a `↵` hint on the right. Output text uses the code font.
- **Problemas.** Rows are focusable (`role="row"`, arrow keys move, Enter reveals). Empty state:
  a check icon and "Sin problemas". Header shows the counts.
- **Variables.** Each frame is a collapsible section (open by default). A value whose rendered
  text differs from the previous paused snapshot gets a 600 ms `--sc-changed` background flash.
  Empty state while not paused: "Pausa el programa para ver las variables".
- **Editor.** Options from settings (§6.2) applied through compartments: font size, line numbers,
  word wrap, autocomplete, tab size. The current-line band and breakpoint dot use the tokens
  already defined.

## 4. Toolbar

### 4.1 Layout

```
[≡] [hola.stepcode ●]  [Nuevo] [Abrir] [Guardar]        [Ejecutar] [Depurar] … [Pausar] [Detener]
```

Left to right: menu button (hexagon icon 20 px, tooltip "Menú"), filename, file actions. The run
cluster is right-aligned. Nothing in the center.

### 4.2 Filename

An inline text input styled as plain text (no border until hover or focus), 14 px, width fits
content with a 32 ch maximum. Enter or blur commits; Escape reverts; an empty name reverts. The
name is the document name (§8), extension included. A `●` after the name marks a document whose
text differs from the last file save (or from the starter program, for a document never saved).
The browser title is `● name · StepCode` or `name · StepCode`.

### 4.3 Run cluster

Icon buttons, visibility by run state (states from the core spec):

| State | Visible |
|---|---|
| `ready`, `done`, `error` | Ejecutar (F5), Depurar |
| `running` | Pausar (F6), Detener (Shift+F5) |
| `paused` | Continuar (F5), Paso (F10), Entrar (F11), Salir (Shift+F11), Detener (Shift+F5) |
| `input`, `waiting` | Detener (Shift+F5) |

Depurar sends `start` with `mode: 'step'`, which pauses on the first statement. The stepping
buttons appear whenever the state is `paused`, whatever caused the pause. Hidden buttons keep a
zero-width placeholder with a 150 ms width transition so visible buttons slide rather than jump.

### 4.4 Menu

Opened from the hexagon (Radix DropdownMenu on a desktop, a full-height left sheet on a phone):

```
Nuevo                    Ctrl+N
Abrir…                   Ctrl+O
Guardar                  Ctrl+S
Guardar como…            Ctrl+Shift+S
──────────
Ejemplos…
Compartir…
──────────
Perfil            ▸  Español · English · PSeInt · [custom…] · ── · Personalizar…
Vista             ▸  Consola · Problemas · Variables · ── · Restablecer diseño
──────────
Ajustes…                 Ctrl+,
Acerca de
```

Perfil items show a check on the active one. Vista items focus and expand (§3.4). Ctrl+N is
intercepted only while the editor has focus; browsers reserve it otherwise.

### 4.5 Shortcuts

4a's F5, Shift+F5, F6, F10, F11, Shift+F11 stay, with the same swallow rule. Added: Ctrl+N (see
above), Ctrl+O, Ctrl+S, Ctrl+Shift+S, Ctrl+, and Escape (closes the topmost dialog, popover or
menu; Radix handles its own). `⌘` replaces Ctrl on macOS.

## 5. Status bar

24 px, 12 px text in `--sc-fg-muted`, items are buttons with a hover background:

| Position | Item | Click |
|---|---|---|
| left | `Ln 12, Col 4` | focuses the editor |
| left | profile name with a chevron | profile popover: the same list as Perfil ▸ |
| left | `✓ Sin problemas` or `✖ 2  ▲ 1` | expands Problemas |
| right | run state | focuses the console |

Run state text by state: `Listo`, `Ejecutando…` with a 12 px spinner, `En pausa en la línea N`,
`Esperando entrada`, `Esperando…` (wait), `Terminado`, `Error en la línea N`. The bar is hidden in
the embed route (4c); the phone keeps profile and problems only (§9).

## 6. Settings

Ctrl+, or the menu opens a Radix Dialog, 720 × 520 max, with a left rail of sections and one
scrolling body. On a phone the dialog is full screen and the rail becomes a top tab strip. Every
control writes to the store immediately; there is no Save button. "Restablecer" per section
resets that section's defaults.

### 6.1 Lenguaje

- Profile picker: radio cards for Español, English, PSeInt and each custom profile, each with a
  four-line sample program in that spelling.
- "Personalizar…" opens the builder inline below: choose a base (`extends`), a name (becomes
  `id` after slugging, must be unique), then a table of keyword, type, operator and builtin keys
  with editable spellings (comma-separated alternatives, first is primary), and the seven option
  toggles (`indexBase`, `caseSensitive`, `foldAccents`, `implicitDeclarations`,
  `requireSemicolons`, `typedParameters`, `assignWithEquals`). The builder validates through
  `resolveProfile` on every change and shows its errors; a live preview re-renders the sample
  through the transposer (§8.4). Guardar stores the `ProfileInput`; Eliminar removes a custom
  profile (falling back to its base if active).

### 6.2 Editor

Font size (12–20), line numbers, word wrap, autocomplete, tab size (2 or 4), highlight the
current line.

### 6.3 Ejecución

- Avisar antes de ejecutar con advertencias (default on): a confirm dialog listing the warnings
  with Ejecutar igualmente / Cancelar. Errors never run; the run button is enabled but shows the
  Problemas panel instead.
- Limpiar la consola al ejecutar (default on).

### 6.4 Apariencia

Theme: Sistema / Claro / Oscuro. Interface language: Automático / Español / English. Automático
follows the active profile's locale. `stringsFor` receives the resolved UI locale; the profile's
locale keeps driving diagnostic text and runtime rendering.

### 6.5 Diseño

Restablecer diseño; Mostrar consola al ejecutar (default on).

## 7. Persistence

### 7.1 Settings and layout: `localStorage`

One key `stepcode.editor`, one JSON document:

```ts
interface PersistedV1 {
  version: 1
  settings: {
    profileId: string
    customProfiles: ProfileInput[]
    editor: { fontSize: number; lineNumbers: boolean; wordWrap: boolean; autocomplete: boolean; tabSize: 2 | 4; highlightLine: boolean }
    execution: { warnOnWarnings: boolean; clearConsoleOnRun: boolean }
    appearance: { theme: 'light' | 'dark' | 'system'; uiLocale: 'auto' | 'es' | 'en' }
    layout: { showConsoleOnRun: boolean }
  }
  layout: { dockview: SerializedDockview | null; collapsed: string[]; sheet: 'collapsed' | 'half' | 'full' }
}
```

Loading validates with zod. Unknown version, parse failure or validation failure → defaults, and
a console warning; nothing throws. `version` increments with a migration function list
(`migrations[n]: (prev) => next`), and the first release ships the empty list. Writes are
debounced 250 ms and coalesced; the `storage` event does not sync tabs (last writer wins).

Dockview JSON is validated shallowly (it is dockview's format); if `fromJSON` throws, the shell
logs, discards it and applies the default layout.

### 7.2 Document: IndexedDB

Database `stepcode`, store `documents`, one record `current`:

```ts
interface StoredDocument {
  id: 'current'
  name: string
  source: string
  profileId: string
  savedSource: string | null   // text at the last file save, for the unsaved dot
  updatedAt: number
}
```

Written 500 ms after the last change through `idb-keyval` (small, proven). On load the record is
restored before the editor mounts; missing record → starter program. File handles are not stored
(they do not survive a reload reliably); after a reload Guardar behaves as Guardar como.

## 8. Files, examples, share

### 8.1 Document model

The shell has one document: `name`, `source`, `profileId`, `savedSource`, and a transient
`handle: FileSystemFileHandle | null`. `dirty = source !== savedSource` where `savedSource` is
the starter program for a new document. Every action that replaces the document (Nuevo, Abrir, an
example, a share link) first asks when `dirty` and `source.trim() !== ''`: a dialog "¿Guardar los
cambios de *name*?" with Guardar / No guardar / Cancelar. Replacing the document resets
CodeMirror's history.

### 8.2 Actions

- **Nuevo:** starter program named `sin título.stepcode`. The starter is a four-line program in
  the active profile's spelling with a comment "Escribe tu programa aquí".
- **Abrir:** `showOpenFilePicker` when present (`.stepcode`, `.psc`, `.txt`, `.sc`), otherwise an
  `<input type="file">`. The file name becomes the name; the handle is kept.
- **Guardar:** writes to the handle; without one, Guardar como. Fallback browsers: a download
  through an object URL, and `savedSource` updates as if saved.
- **Guardar como:** `showSaveFilePicker` with `.stepcode` suggested; fallback download.
- All failures (permission denied, abort) show a toast; abort is silent.

### 8.3 Examples

Files under `packages/editor/examples/<topic>/<slug>.stepcode`, written in the `es` profile, with a
header comment block:

```
// título: Hola mundo
// descripción: Escribe un saludo en la consola
```

A Vite plugin (or a build-time script) turns the folder into an `examples.ts` index: topic order
from a `topics.json` (Primeros pasos, Condicionales, Ciclos, Arreglos, Funciones, Un poco más),
then title, description, source. A per-profile override `<slug>.<profileId>.stepcode` replaces the
transposed source for that profile when options make the transposition invalid.

The Ejemplos dialog is a grid of cards (title, description, three-line preview in the active
profile's spelling) grouped by topic, searchable by title. Choosing one follows §8.1, names the
document after the file, and keeps the active profile.

Test: every example, transposed to every built-in profile (or its override), compiles with zero
diagnostics.

### 8.4 Transposer

`transpose(source, from: ResolvedProfile, to: ResolvedProfile): string` in
`packages/editor/src/profiles/transpose.ts`: tokenize with `from`; for every token of kind
`keyword`, `type`, `builtin` or `operator` replace `text` with the primary spelling of the same
key in `to`, preserving the original casing pattern (all-caps, capitalized, lower); every other
token keeps its text. Comments are untouched. Options are not translated; that is what overrides
are for. Used by examples, the starter program and the profile builder preview.

### 8.5 Share

`packages/editor/src/share/link.ts`: `encodeShare({ source, profileId }) → string` producing
`#code=<base64url(deflate-raw(utf8))>&profile=<id>` with `CompressionStream('deflate-raw')`, and
`decodeShare(hash) → { source, profileId } | null`. On load, a `#code=` hash wins over the stored
document (after the §8.1 prompt if dirty), the hash is removed with `history.replaceState`, and
the document is named `compartido.stepcode`. A custom profile id that does not exist locally falls
back to `es` with a toast.

The Compartir dialog shows the link in a read-only field, Copiar (toast "Enlace copiado"), and a
note that the program travels inside the link. Links longer than 8 000 characters show a warning
that some apps truncate them.

## 9. Phone layout

Below 768 px (`matchMedia`, re-evaluated on resize) the shell renders `MobileShell` instead of
`DesktopShell`. Both mount the same panel components; dockview is not imported on the phone path
(dynamic import in the desktop shell keeps it out of the phone bundle).

```
┌──────────────────────────────┐
│ ≡  hola.stepcode ●   ▶ ■ ⋯   │  44 px
├──────────────────────────────┤
│ editor                       │
│                              │
├──────────────────────────────┤
│ <- ( ) [ ] , " : Si Entonces │  symbol bar, 40 px, only while editing
├──────────────────────────────┤
│ ═══ Consola Problemas Vars   │  sheet handle, 36 px
│ (sheet body: half / full)    │
├──────────────────────────────┤
│ Español          ✓ Sin probl.│  status, 24 px
└──────────────────────────────┘
```

- **Top bar:** menu, filename, Ejecutar/Detener by state, and `⋯` opening a popover with
  Depurar and, while paused, the stepping actions. File actions live in the menu sheet.
- **Symbol bar:** shown while the editor has focus and the visual viewport is shorter than the
  layout viewport by more than 100 px (VisualViewport API); on coarse-pointer devices without the
  API, shown while the editor has focus. Keys: `<-` (the profile's assign spelling), `(`, `)`,
  `[`, `]`, `,`, `"`, `:`, `;`, then the profile's primary spellings for `if`, `then`, `else`,
  `endIf`, `while`, `do`, `endWhile`, `for`, `to`, `endFor`, `write`, `read`, `define`, `as`,
  and the type keys. Tap inserts at the cursor with a trailing space for keywords and refocuses
  the editor. Horizontal scroll, no wrap.
- **Bottom sheet:** three positions, `collapsed` (handle only), `half` (45 % of height), `full`
  (top bar remains). Drag the handle or tap it to cycle; swipe down from `half` collapses. Tabs
  in the handle switch pages; pages are the panel components. Auto-expand events (§3.4) move it
  to `half`; an input request moves it to `full` and focuses the field. Position persists (§7.1).
- **Status bar:** profile (opens the picker as a bottom popover) and problems only.
- Dialogs are full screen; the menu is a left sheet; tooltips are disabled on touch.

## 10. PWA and About

- `vite-plugin-pwa` with `registerType: 'prompt'`, the v1 icon set copied into
  `packages/editor/public`, manifest name "StepCode", `display: standalone`,
  `theme_color`/`background_color` from the light tokens. A toast "Hay una versión nueva ·
  Recargar" when a waiting worker exists.
- Acerca de: a small dialog with the hexagon, "StepCode editor", the version from `package.json`
  (injected by Vite `define`), links to the repository and the academy, licence line.

## 11. Strings

`strings.ts` grows by feature; `stringsFor(locale)` stays the only entry. The UI locale is
`settings.appearance.uiLocale` resolved against the profile locale. Every new string exists in
`es` and `en`; a test compares key sets. The host's `'worker error'` literal moves into
`strings.ts` (closing the handoff item).

## 12. Package changes

Dependencies: `dockview-react`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`,
`@radix-ui/react-popover`, `@radix-ui/react-tooltip`, `@radix-ui/react-tabs`,
`@radix-ui/react-toast`, `lucide-react`, `idb-keyval`, `zod` (already in the workspace catalog),
`vite-plugin-pwa` (dev), JetBrains Mono woff2 files (public). All pinned through the catalog.

New source layout under `packages/editor/src`:

```
shell/
  DesktopShell.tsx      dockview host, collapse, auto-expand, layout persistence
  MobileShell.tsx       column layout, sheet, symbol bar host
  dock/                 tab, header, floating frame, collapse helpers, default layout
  sheet/                BottomSheet, gestures
  SymbolBar.tsx
  Toolbar.tsx           (replaces components/Toolbar.tsx)
  Filename.tsx
  Menu.tsx
  StatusBar.tsx
  shortcuts.ts          (moved from components/)
dialogs/
  Settings/…            rail, sections, ProfileBuilder
  Examples.tsx
  Share.tsx
  About.tsx
  ConfirmSave.tsx
store/
  settings.ts           settings slice, defaults, zod schema, migrations
  document.ts           document slice (name, savedSource, handle), dirty
  persist.ts            localStorage + IndexedDB adapters
files/                  open/save with FSA and fallbacks
examples/               index plugin output, loader
profiles/transpose.ts
share/link.ts
pwa/                    registration, update toast hook
```

`App.tsx` chooses the shell by viewport; `main.tsx` loads persistence before rendering.

## 13. Testing

Vitest with happy-dom, per file opt-in as in 4a. Coverage by area:

- store: settings defaults, every setter, zod rejection → defaults, migration list runner,
  document dirty rules, theme preference resolution with a mocked media query.
- persist: round trip through fake `localStorage` and a fake IndexedDB (`fake-indexeddb`),
  debounce, corrupted payloads.
- transpose: keyword, type, builtin, operator replacement; casing preservation; comments and
  strings untouched; every example × every built-in profile compiles clean.
- share: encode/decode round trip, empty, oversize warning threshold, unknown profile fallback.
- files: FSA path with a fake `showOpenFilePicker`, fallback path with a fake input, error toasts.
- shell: default layout serialization, collapse constraints and restore, auto-expand rules with
  the manual-collapse flag, Vista actions, reset; dockview mocked at its React API for unit tests
  and mounted for real in one smoke test; popout smoke test.
- toolbar, filename, menu, status bar, dialogs: rendering per state, shortcuts, `⌘`/Ctrl
  labels, keyboard navigation in Problems, settings rail, profile builder validation.
- mobile: shell selection by `matchMedia`, sheet positions and auto-expand, symbol bar derivation
  per profile and insertion, viewport rule with a fake VisualViewport.
- strings: key parity `es`/`en`.
- tokens-only and contrast tests extended to the new components.

Real gestures, drag-and-drop, floating and popout behavior are 4c's Playwright pass and are listed
there as deferred, not skipped.

## 14. Decisions

- Dockview kept (the umbrella's choice) because the user wants floating and rearranging; noise is
  controlled by the default layout and by collapse, not by removing the engine.
- No closing of panels: nothing can be lost, and the Vista menu stays a list of places to go.
- Editor panel locked in place; a floating editor has no use here and breaks the mental model.
- Icons with tooltips for actions, text for state (status bar), per the user's preference.
- Palette unchanged; accent is the existing blue; logo is only the icon.
- Radix primitives and JetBrains Mono chosen because both are proven and accessible; no custom
  dialog or menu code.
- Share decode moves to 4b (§1.1).
- Examples authored once in `es` and transposed, with overrides; a test guards every profile.
- File handles are not persisted; a reload turns Guardar into Guardar como.
- Phone layout is a separate shell over the same panels; dockview is not loaded on phones.
- `#code=` beats the stored document on load, so a shared link always shows what was shared.

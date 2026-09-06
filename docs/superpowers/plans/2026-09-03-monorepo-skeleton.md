# Monorepo Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn this repository (branch `RolandoAndrade/v2`) into the StepCode v2 pnpm monorepo: v1 code removed, five empty packages wired together, one passing test each, lint/typecheck/test/build green locally and in GitHub Actions.

**Architecture:** pnpm workspaces with a version catalog; four libraries built by tsdown and one Vite app; each library exposes `src/` through a `development` export condition so tests and the editor's dev server consume source without builds, while `publishConfig.exports` points published packages at `dist/`. One Biome config, one Vitest config using `projects`, one base tsconfig.

**Tech Stack:** pnpm 11.25, Node 24, TypeScript 7.0, Biome 2.5, Vitest 4.1, tsdown 0.22, Changesets 3, Vite 8.2, React 19.2, Tailwind 4.3, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md` (sections 3, 5, 7, 8).

## Global Constraints

- Package manager: pnpm; `pnpm -r` topological builds; no Turborepo.
- TypeScript `strict`, ESM only (`"type": "module"` everywhere).
- Lint/format: Biome. Tests: Vitest with `projects`. Library builds: tsdown. Versioning: Changesets.
- Node 24 LTS via `.nvmrc` and `packageManager`.
- Dependency direction: `profiles ← language ← codemirror ← editor`, `profiles ← textmate`. Nothing else.
- Published names: `stepcode`, `@stepcode/profiles`, `@stepcode/codemirror`, `@stepcode/textmate`. Editor is private (`@stepcode/editor`).
- Versions pinned in this plan (verified against the npm registry on 2026-09-03):
  pnpm 11.25.0 · typescript ^7.0.2 · @biomejs/biome 2.5.12 · vitest ^4.1.11 (not 5.0.0, released today) ·
  tsdown ^0.22.14 · @changesets/cli ^3.0.1 · @changesets/changelog-github ^1.0.0 · @types/node ^24.13.3 ·
  vite ^8.2.2 · @vitejs/plugin-react ^6.1.1 · react ^19.2.8 · react-dom ^19.2.8 · @types/react ^19.2.18 ·
  @types/react-dom ^19.2.7 · tailwindcss ^4.3.3 · @tailwindcss/vite ^4.3.3 · happy-dom ^20.13.2 ·
  @testing-library/react ^16.3.3.
- Commit messages: conventional (`chore:`, `feat:`, `docs:`, `ci:`), no attribution trailers.
- v1 code is deleted, not kept alongside. v1 tests are preserved as raw corpus fixtures, not run.

## File Structure

```
.nvmrc                              node major version
.gitignore                          replaces v1's
package.json                        private root: scripts, shared devDependencies
pnpm-workspace.yaml                 packages glob + version catalog
tsconfig.base.json                  shared compiler options
biome.json                          lint + format
vitest.config.ts                    projects: packages/*
.changeset/config.json              changesets config
.github/workflows/ci.yml            lint, typecheck, test, build
.github/workflows/release.yml       changesets version PR + npm publish
README.md                           monorepo overview (replaces readme.md)
LICENSE.txt                         kept
packages/profiles/                  @stepcode/profiles
packages/language/                  stepcode; test/corpus/v1/ holds v1 fixtures
packages/codemirror/                @stepcode/codemirror
packages/textmate/                  @stepcode/textmate
packages/editor/                    @stepcode/editor (Vite app)
```

Each library package: `package.json`, `tsconfig.json`, `tsdown.config.ts`, `src/index.ts`, `test/index.test.ts`.

---

### Task 1: Remove v1 and create the workspace root

**Files:**
- Delete: `src/`, `Dockerfile`, `docker-compose.yml`, `vite.config.ts`, `tsconfig.json`, `package-lock.json`
- Move: `test/` → `packages/language/test/corpus/v1/` (done here so nothing is lost; the package itself is created in Task 4)
- Modify: `package.json` (full rewrite), `.gitignore` (full rewrite)
- Create: `.nvmrc`, `pnpm-workspace.yaml`, `tsconfig.base.json`

**Interfaces:**
- Produces: the root `package.json` scripts `lint`, `typecheck`, `test`, `build`, `dev` that every later task and CI call; the catalog entries `typescript`, `vitest`, `tsdown`, `@types/node` referenced as `catalog:` by packages.

- [ ] **Step 1: Delete v1 sources and move the v1 tests aside**

```bash
git rm -r -q src Dockerfile docker-compose.yml vite.config.ts tsconfig.json package-lock.json
mkdir -p packages/language/test/corpus
git mv test packages/language/test/corpus/v1
for f in packages/language/test/corpus/v1/*.test.ts; do git mv "$f" "${f%.test.ts}.v1.ts"; done
ls packages/language/test/corpus/v1
```

Expected: the listing shows `*.v1.ts` files and a `programs/` directory; no `*.test.ts` remain (so Vitest's default include pattern never picks them up).

- [ ] **Step 2: Write `.nvmrc`**

```
24
```

- [ ] **Step 3: Write `.gitignore`**

```
node_modules/
dist/
coverage/
.vite/
*.tsbuildinfo
*.log
.DS_Store
.env
.env.*
.idea/
.vscode/*
!.vscode/extensions.json
```

- [ ] **Step 4: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - packages/*

catalog:
  typescript: ^7.0.2
  vitest: ^4.1.11
  tsdown: ^0.22.14
  '@types/node': ^24.13.3
```

- [ ] **Step 5: Write the root `package.json`**

```json
{
  "name": "stepcode-monorepo",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.25.0",
  "engines": {
    "node": ">=24"
  },
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "typecheck": "pnpm -r --parallel typecheck",
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "pnpm -r build",
    "dev": "pnpm --filter @stepcode/editor dev",
    "changeset": "changeset",
    "changeset:version": "changeset version",
    "release": "pnpm build && changeset publish"
  },
  "devDependencies": {
    "@biomejs/biome": "2.5.12",
    "@changesets/cli": "^3.0.1",
    "@changesets/changelog-github": "^1.0.0",
    "@types/node": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

- [ ] **Step 6: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "customConditions": ["development"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": []
  }
}
```

`customConditions: ["development"]` makes `tsc` resolve workspace packages to their `src/index.ts` (see Task 3's `exports`), so typechecking never needs a prior build.

- [ ] **Step 7: Install and verify the workspace resolves**

```bash
pnpm install
pnpm --version
```

Expected: `pnpm install` completes, prints `Done`, creates `pnpm-lock.yaml`; `pnpm --version` prints `11.25.0`. The machine has pnpm 10.33 installed; pnpm 10+ honours the root `packageManager` field (`manage-package-manager-versions`, on by default) and switches itself to the pinned 11.25.0 on first run. If no pnpm is installed at all, run `corepack enable` first.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: remove v1 sources and create the pnpm workspace root"
```

---

### Task 2: Biome lint and format

**Files:**
- Create: `biome.json`

**Interfaces:**
- Produces: `pnpm lint` and `pnpm lint:fix` working on the whole repo; the code style every later file must satisfy (2-space indent, single quotes, no semicolons, line width 100).

- [ ] **Step 1: Write `biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.12/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "includes": ["**", "!**/dist", "!**/node_modules", "!packages/language/test/corpus/v1/**"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "all"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

The v1 corpus is excluded: it is frozen fixture data, not code we maintain.

- [ ] **Step 2: Run lint, expect failures from the v1 style, then fix and rerun**

```bash
pnpm lint || true
pnpm lint:fix
pnpm lint
```

Expected: the first run may report formatting differences in `package.json`/`pnpm-workspace.yaml`-adjacent JSON; after `lint:fix`, `pnpm lint` exits 0 with `Checked N files`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: add Biome lint and format config"
```

---

### Task 3: Vitest root config and the `@stepcode/profiles` package (the package template)

**Files:**
- Create: `vitest.config.ts`
- Create: `packages/profiles/package.json`, `packages/profiles/tsconfig.json`, `packages/profiles/tsdown.config.ts`, `packages/profiles/src/index.ts`, `packages/profiles/test/index.test.ts`

**Interfaces:**
- Produces: `export const packageName = '@stepcode/profiles'` from `@stepcode/profiles`; the package layout that Tasks 4 and 5 copy exactly.

- [ ] **Step 1: Write `vitest.config.ts` at the root**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*'],
  },
})
```

Vitest treats each folder matching the glob as a project, using that folder's `vite.config.ts`/`vitest.config.ts` when present and defaults otherwise. Libraries need no config; the editor (Task 6) supplies one.

- [ ] **Step 2: Write the failing test `packages/profiles/test/index.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { packageName } from '../src/index'

describe('@stepcode/profiles', () => {
  it('exposes its package name', () => {
    expect(packageName).toBe('@stepcode/profiles')
  })
})
```

- [ ] **Step 3: Write `packages/profiles/package.json`**

```json
{
  "name": "@stepcode/profiles",
  "version": "0.0.0",
  "description": "Keyword profiles (es, en, pseint, custom) for the StepCode language",
  "license": "MIT",
  "author": "Rolando Andrade",
  "repository": {
    "type": "git",
    "url": "https://github.com/RolandoAndrade/stepcode",
    "directory": "packages/profiles"
  },
  "type": "module",
  "sideEffects": false,
  "files": ["dist"],
  "exports": {
    ".": {
      "development": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    }
  },
  "scripts": {
    "build": "tsdown",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "tsdown": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

Why two `exports` blocks: inside the workspace, Vite/Vitest set the `development` condition (any mode but production) and `tsc` sets it via `customConditions`, so everything resolves to `src/`. pnpm replaces `exports` with `publishConfig.exports` at publish time, so consumers only ever see `dist/`.

- [ ] **Step 4: Write `packages/profiles/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src", "test"]
}
```

- [ ] **Step 5: Write `packages/profiles/tsdown.config.ts`**

```ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
})
```

- [ ] **Step 6: Install and run the test to verify it fails**

```bash
pnpm install
pnpm vitest run --project @stepcode/profiles
```

Expected: FAIL — `Cannot find module '../src/index'` (or "Failed to resolve import").

- [ ] **Step 7: Write `packages/profiles/src/index.ts`**

```ts
export const packageName = '@stepcode/profiles'
```

- [ ] **Step 8: Run test, typecheck, build**

```bash
pnpm vitest run --project @stepcode/profiles
pnpm --filter @stepcode/profiles typecheck
pnpm --filter @stepcode/profiles build
ls packages/profiles/dist
```

Expected: 1 test passed; `tsc` silent; `dist/index.js` and `dist/index.d.ts` exist.

- [ ] **Step 9: Lint and commit**

```bash
pnpm lint
git add -A
git commit -m "feat(profiles): scaffold @stepcode/profiles and the Vitest projects config"
```

---

### Task 4: The `stepcode` language package with the v1 corpus

**Files:**
- Create: `packages/language/package.json`, `packages/language/tsconfig.json`, `packages/language/tsdown.config.ts`, `packages/language/src/index.ts`, `packages/language/test/index.test.ts`, `packages/language/test/corpus/README.md`
- Already present from Task 1: `packages/language/test/corpus/v1/**`

**Interfaces:**
- Consumes: `packageName` from `@stepcode/profiles`.
- Produces: `export const packageName = 'stepcode'` and `export { packageName as profilesPackageName } from '@stepcode/profiles'` — the re-export proves cross-package resolution through the `development` condition.

- [ ] **Step 1: Write the failing test `packages/language/test/index.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { packageName, profilesPackageName } from '../src/index'

describe('stepcode', () => {
  it('exposes its package name', () => {
    expect(packageName).toBe('stepcode')
  })

  it('resolves @stepcode/profiles from source through the workspace', () => {
    expect(profilesPackageName).toBe('@stepcode/profiles')
  })
})
```

- [ ] **Step 2: Write `packages/language/package.json`**

```json
{
  "name": "stepcode",
  "version": "0.0.0",
  "description": "StepCode: a PSeInt-compatible pseudocode language. Parser, checker and steppable interpreter.",
  "license": "MIT",
  "author": "Rolando Andrade",
  "keywords": ["stepcode", "pseudocode", "pseint", "interpreter", "spanish"],
  "repository": {
    "type": "git",
    "url": "https://github.com/RolandoAndrade/stepcode",
    "directory": "packages/language"
  },
  "type": "module",
  "sideEffects": false,
  "files": ["dist"],
  "exports": {
    ".": {
      "development": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    }
  },
  "scripts": {
    "build": "tsdown",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@stepcode/profiles": "workspace:*"
  },
  "devDependencies": {
    "tsdown": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

Note `"version": "0.0.0"`: the npm package `stepcode` is at 0.12.0. Changesets will bump this to 2.0.0 at release time; it must not be published before then.

- [ ] **Step 3: Write `packages/language/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src", "test/**/*.test.ts"]
}
```

`test/corpus/v1/**` is excluded on purpose: those files import v1 modules that no longer exist.

- [ ] **Step 4: Write `packages/language/tsdown.config.ts`**

```ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
})
```

- [ ] **Step 5: Write `packages/language/test/corpus/README.md`**

```markdown
# Conformance corpus

`v1/` holds the StepCode v1 (0.12.0) test files verbatim, renamed from `*.test.ts` to
`*.v1.ts` so Vitest ignores them. They import v1 modules that no longer exist and are not
meant to run; they are the source material for the v2 conformance corpus, which the language
sub-projects build up here as `(program, inputs, profile) → outputs / diagnostics` cases.

Do not edit `v1/`. Delete it once every program it contains has a v2 equivalent.
```

- [ ] **Step 6: Install and run the test to verify it fails**

```bash
pnpm install
pnpm vitest run --project stepcode
```

Expected: FAIL — cannot resolve `../src/index`.

- [ ] **Step 7: Write `packages/language/src/index.ts`**

```ts
export const packageName = 'stepcode'
export { packageName as profilesPackageName } from '@stepcode/profiles'
```

- [ ] **Step 8: Run test, typecheck, build**

```bash
pnpm vitest run --project stepcode
pnpm --filter stepcode typecheck
pnpm --filter stepcode build
```

Expected: 2 tests passed; typecheck silent (this proves `customConditions` resolves `@stepcode/profiles` to `src/`); build produces `packages/language/dist/index.js` that imports `@stepcode/profiles` (tsdown externalizes dependencies by default — confirm with `grep profiles packages/language/dist/index.js`).

- [ ] **Step 9: Lint and commit**

```bash
pnpm lint
git add -A
git commit -m "feat(language): scaffold the stepcode package and preserve the v1 test corpus"
```

---

### Task 5: `@stepcode/codemirror` and `@stepcode/textmate`

**Files:**
- Create: `packages/codemirror/{package.json,tsconfig.json,tsdown.config.ts,src/index.ts,test/index.test.ts}`
- Create: `packages/textmate/{package.json,tsconfig.json,tsdown.config.ts,src/index.ts,test/index.test.ts}`

**Interfaces:**
- Consumes: `packageName` from `stepcode` (codemirror) and from `@stepcode/profiles` (textmate).
- Produces: `packageName` and a re-export from each, matching Task 4's pattern; `@stepcode/codemirror` is what the editor (Task 6) depends on.

- [ ] **Step 1: Write the failing tests**

`packages/codemirror/test/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { languagePackageName, packageName } from '../src/index'

describe('@stepcode/codemirror', () => {
  it('exposes its package name', () => {
    expect(packageName).toBe('@stepcode/codemirror')
  })

  it('resolves stepcode from source through the workspace', () => {
    expect(languagePackageName).toBe('stepcode')
  })
})
```

`packages/textmate/test/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { packageName, profilesPackageName } from '../src/index'

describe('@stepcode/textmate', () => {
  it('exposes its package name', () => {
    expect(packageName).toBe('@stepcode/textmate')
  })

  it('resolves @stepcode/profiles from source through the workspace', () => {
    expect(profilesPackageName).toBe('@stepcode/profiles')
  })
})
```

- [ ] **Step 2: Write `packages/codemirror/package.json`**

```json
{
  "name": "@stepcode/codemirror",
  "version": "0.0.0",
  "description": "CodeMirror 6 language support and debug extensions for StepCode",
  "license": "MIT",
  "author": "Rolando Andrade",
  "repository": {
    "type": "git",
    "url": "https://github.com/RolandoAndrade/stepcode",
    "directory": "packages/codemirror"
  },
  "type": "module",
  "sideEffects": false,
  "files": ["dist"],
  "exports": {
    ".": {
      "development": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    }
  },
  "scripts": {
    "build": "tsdown",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "stepcode": "workspace:*"
  },
  "devDependencies": {
    "tsdown": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

- [ ] **Step 3: Write `packages/textmate/package.json`**

```json
{
  "name": "@stepcode/textmate",
  "version": "0.0.0",
  "description": "Generates TextMate grammars (for Shiki, VS Code) from StepCode profiles",
  "license": "MIT",
  "author": "Rolando Andrade",
  "repository": {
    "type": "git",
    "url": "https://github.com/RolandoAndrade/stepcode",
    "directory": "packages/textmate"
  },
  "type": "module",
  "sideEffects": false,
  "files": ["dist"],
  "exports": {
    ".": {
      "development": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    }
  },
  "scripts": {
    "build": "tsdown",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@stepcode/profiles": "workspace:*"
  },
  "devDependencies": {
    "tsdown": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

- [ ] **Step 4: Write both `tsconfig.json` files (identical content)**

`packages/codemirror/tsconfig.json` and `packages/textmate/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src", "test"]
}
```

- [ ] **Step 5: Write both `tsdown.config.ts` files (identical content)**

`packages/codemirror/tsdown.config.ts` and `packages/textmate/tsdown.config.ts`:

```ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
})
```

- [ ] **Step 6: Install and verify both tests fail**

```bash
pnpm install
pnpm vitest run --project @stepcode/codemirror --project @stepcode/textmate
```

Expected: both FAIL on unresolved `../src/index`.

- [ ] **Step 7: Write the sources**

`packages/codemirror/src/index.ts`:

```ts
export const packageName = '@stepcode/codemirror'
export { packageName as languagePackageName } from 'stepcode'
```

`packages/textmate/src/index.ts`:

```ts
export const packageName = '@stepcode/textmate'
export { packageName as profilesPackageName } from '@stepcode/profiles'
```

- [ ] **Step 8: Run the whole workspace: test, typecheck, build**

```bash
pnpm test
pnpm typecheck
pnpm build
```

Expected: 7 tests pass across 4 projects; typecheck silent; `pnpm build` runs the four packages in topological order — the output shows `profiles` before `language`, and `language` before `codemirror`.

- [ ] **Step 9: Lint and commit**

```bash
pnpm lint
git add -A
git commit -m "feat: scaffold @stepcode/codemirror and @stepcode/textmate"
```

---

### Task 6: The editor app (`@stepcode/editor`)

**Files:**
- Create: `packages/editor/package.json`, `packages/editor/tsconfig.json`, `packages/editor/vite.config.ts`, `packages/editor/index.html`, `packages/editor/src/main.tsx`, `packages/editor/src/App.tsx`, `packages/editor/src/index.css`, `packages/editor/test/setup.ts`, `packages/editor/test/App.test.tsx`

**Interfaces:**
- Consumes: `packageName` from `@stepcode/codemirror`.
- Produces: a Vite app that renders `<h1>StepCode</h1>` and the codemirror package name, proving the full chain `editor → codemirror → language → profiles` resolves from source in both Vitest and the Vite dev server.

- [ ] **Step 1: Write the failing test `packages/editor/test/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../src/App'

describe('App', () => {
  it('renders the StepCode heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'StepCode' })).toBeDefined()
  })

  it('resolves @stepcode/codemirror through the workspace', () => {
    render(<App />)
    expect(screen.getByText('@stepcode/codemirror')).toBeDefined()
  })
})
```

- [ ] **Step 2: Write `packages/editor/test/setup.ts`**

```ts
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 3: Write `packages/editor/package.json`**

```json
{
  "name": "@stepcode/editor",
  "version": "0.0.0",
  "private": true,
  "description": "The StepCode web editor (PWA)",
  "license": "MIT",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@stepcode/codemirror": "workspace:*",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@testing-library/react": "^16.3.3",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "happy-dom": "^20.13.2",
    "tailwindcss": "^4.3.3",
    "typescript": "catalog:",
    "vite": "^8.2.2",
    "vitest": "catalog:"
  }
}
```

- [ ] **Step 4: Write `packages/editor/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "types": ["vite/client"]
  },
  "include": ["src", "test", "vite.config.ts"]
}
```

- [ ] **Step 5: Write `packages/editor/vite.config.ts`**

```ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
  },
})
```

`defineConfig` from `vitest/config` is a superset of Vite's, so one file serves both `vite` and `vitest`.

- [ ] **Step 6: Write `packages/editor/index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StepCode</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write `packages/editor/src/index.css`**

```css
@import 'tailwindcss';
```

- [ ] **Step 8: Write `packages/editor/src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Missing #root element')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: Install and verify the test fails**

```bash
pnpm install
pnpm vitest run --project @stepcode/editor
```

Expected: FAIL — cannot resolve `../src/App`.

- [ ] **Step 10: Write `packages/editor/src/App.tsx`**

```tsx
import { packageName } from '@stepcode/codemirror'

export function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-neutral-950 text-neutral-100">
      <h1 className="text-4xl font-semibold">StepCode</h1>
      <p className="font-mono text-sm text-neutral-400">{packageName}</p>
    </main>
  )
}
```

- [ ] **Step 11: Run test, typecheck, build**

```bash
pnpm vitest run --project @stepcode/editor
pnpm --filter @stepcode/editor typecheck
pnpm --filter @stepcode/editor build
ls packages/editor/dist
```

Expected: 2 tests pass; typecheck silent; `dist/index.html` and `dist/assets/*.js` exist. `vite build` runs in production mode, so it resolves `@stepcode/codemirror` through the `default` condition to `dist/index.js` — which exists because Task 5 built it. (This is why `pnpm -r build` must stay topological.)

- [ ] **Step 12: Verify the dev server resolves source, not dist**

```bash
rm -rf packages/profiles/dist packages/language/dist packages/codemirror/dist
(cd packages/editor && timeout 20 pnpm exec vite --port 5199 --strictPort > /tmp/claude-1001/-home-ubuntu-orca-workspaces-stepcode-v2/700795e7-3931-496e-921f-cffbea8d1363/scratchpad/vite.log 2>&1 &) ; sleep 6
curl -s http://localhost:5199/src/App.tsx | head -5
pkill -f 'vite --port 5199' || true
pnpm build
```

Expected: `curl` returns the transformed module (its import of `@stepcode/codemirror` resolved to a `/@fs/.../packages/codemirror/src/index.ts` URL) with no "Failed to resolve" error in `vite.log`, even though every `dist/` was deleted. The final `pnpm build` restores them.

- [ ] **Step 13: Lint and commit**

```bash
pnpm lint:fix
pnpm lint
git add -A
git commit -m "feat(editor): scaffold the React 19 + Vite 8 + Tailwind 4 editor app"
```

---

### Task 7: Changesets

**Files:**
- Create: `.changeset/config.json`, `.changeset/README.md`

**Interfaces:**
- Produces: `pnpm changeset`, `pnpm changeset:version`, `pnpm release` working; the editor excluded from versioning.

- [ ] **Step 1: Initialize and inspect**

```bash
pnpm changeset init
cat .changeset/config.json
```

Expected: `.changeset/config.json` and `.changeset/README.md` are created.

- [ ] **Step 2: Replace `.changeset/config.json`**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.1/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "RolandoAndrade/stepcode" }],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "master",
  "updateInternalDependencies": "patch",
  "ignore": ["@stepcode/editor"]
}
```

- [ ] **Step 3: Verify Changesets sees the four publishable packages**

```bash
pnpm changeset status --verbose || true
pnpm exec changeset version --help > /dev/null && echo ok
```

Expected: status reports no changesets (that is fine — none exist yet) and lists no errors about the config; `ok` is printed.

- [ ] **Step 4: Lint and commit**

```bash
pnpm lint:fix
pnpm lint
git add -A
git commit -m "chore: configure Changesets"
```

---

### Task 8: GitHub Actions CI and release workflows

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/release.yml`

**Interfaces:**
- Consumes: root scripts `lint`, `typecheck`, `test`, `build`, `release`, `changeset:version`.
- Produces: a green `CI` check on pushes to `master` and `RolandoAndrade/v2` and on pull requests; a `Release` workflow that opens the Changesets "Version Packages" PR and publishes on merge.

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [master, RolandoAndrade/v2]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

`pnpm/action-setup@v4` reads the version from the root `packageManager` field, so there is one source of truth for the pnpm version.

- [ ] **Step 2: Write `.github/workflows/release.yml`**

```yaml
name: Release

on:
  push:
    branches: [master]

concurrency: release

permissions:
  contents: write
  pull-requests: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
        with:
          node-version-file: .nvmrc
          cache: pnpm
          registry-url: https://registry.npmjs.org
      - run: pnpm install --frozen-lockfile
      - uses: changesets/action@v1
        with:
          version: pnpm changeset:version
          publish: pnpm release
          title: 'chore: version packages'
          commit: 'chore: version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

This deviates from the spec's "publish on tag" wording in the way Changesets works: merging the generated "Version Packages" PR into `master` publishes and tags. Manual steps for the repository owner, outside this plan: add the `NPM_TOKEN` secret (an npm granular token with publish rights on `stepcode` and the `@stepcode` scope), and create the `stepcode` npm organization if it is not already owned — `@stepcode/*` is unpublished as of 2026-09-03, but org ownership can only be checked while logged in.

- [ ] **Step 3: Validate the YAML parses**

```bash
node -e "const y=require('node:fs').readFileSync('.github/workflows/ci.yml','utf8');console.log(y.split('\n').length,'lines')"
pnpm lint
```

Expected: a line count is printed (the file is readable) and Biome passes (it does not lint YAML, so this only confirms nothing else broke).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "ci: add CI and Changesets release workflows"
```

---

### Task 9: README and final verification

**Files:**
- Move: `readme.md` → `README.md` (full rewrite)

**Interfaces:**
- Produces: the repository's front page describing the monorepo and the commands used by every later sub-project.

- [ ] **Step 1: Rewrite the README**

```bash
git mv readme.md README.md
```

Content of `README.md`:

```markdown
# StepCode

StepCode is a pseudocode language for learning to program, compatible with
[PSeInt](http://pseint.sourceforge.net/) and available in Spanish, English, and any
keyword profile you define. This repository is the v2 monorepo; v1 (0.12.0) lives on `master`
until v2 reaches parity.

## Packages

| Package | Path | What it is |
|---|---|---|
| `stepcode` | `packages/language` | Lexer, parser, checker, and steppable interpreter |
| `@stepcode/profiles` | `packages/profiles` | Keyword profiles (`es`, `en`, `pseint`) and their schema |
| `@stepcode/codemirror` | `packages/codemirror` | CodeMirror 6 language support and debug extensions |
| `@stepcode/textmate` | `packages/textmate` | TextMate grammar generator for Shiki / VS Code |
| `@stepcode/editor` | `packages/editor` | The web editor (private, deployed to Cloudflare Pages) |

Dependencies flow one way: `profiles ← language ← codemirror ← editor`, `profiles ← textmate`.

## Development

Requires Node 24 and pnpm 11 (`corepack enable` picks the pinned version).

```sh
pnpm install
pnpm dev          # editor dev server
pnpm test         # all packages
pnpm typecheck
pnpm lint         # biome; `pnpm lint:fix` to format
pnpm build        # all packages, in dependency order
```

Libraries expose `src/` through a `development` export condition, so tests and the dev server
never need a build. Published packages resolve to `dist/`.

## Releasing

`pnpm changeset` records a change; merging the generated "Version Packages" PR publishes to npm.

## Design

See `docs/superpowers/specs/2026-09-03-stepcode-v2-design.md`.

## License

MIT — see `LICENSE.txt`.
```

- [ ] **Step 2: Run everything from a clean state**

```bash
rm -rf node_modules packages/*/node_modules packages/*/dist
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git status --short
```

Expected: every command exits 0; `pnpm test` reports 9 tests passing across 5 projects; `git status` shows only `README.md` (renamed + modified) — no stray generated files (if `dist/` or lockfile changes appear, `.gitignore` or the lockfile step above is wrong; fix before committing).

- [ ] **Step 3: Commit and push, then confirm CI**

```bash
git add -A
git commit -m "docs: rewrite README for the v2 monorepo"
git push -u origin RolandoAndrade/v2
gh run watch --exit-status $(gh run list --branch RolandoAndrade/v2 --workflow CI --limit 1 --json databaseId --jq '.[0].databaseId')
```

Expected: the `CI` run completes with `✓` on every step. If it fails, read the log with `gh run view --log-failed`, fix locally, commit, push, and re-watch — the skeleton is not done until CI is green.

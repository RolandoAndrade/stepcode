# StepCode v2 promo

A 36-second vertical promo (1080x1920, 30 fps, Spanish captions, no audio) made with
[Remotion](https://www.remotion.dev). It is a standalone npm project, not part of the pnpm
workspace, so install it on its own:

```sh
cd promo
npm install
```

## Commands

```sh
npm run studio    # live preview in the browser
npm run render    # out/stepcode-v2-promo.mp4 (H.264)
npm run stills    # review PNGs in out/still-*.png (pass names to render only some)
npm run screens   # recapture public/screens/*.png from the live editor
```

Remotion downloads its own headless Chrome and bundles ffmpeg on the first render.

## Screenshots

`scripts/capture-screens.mjs` drives the live editor at stepcode.letsbuildsolutions.com with
Playwright at a 430x932 phone viewport (deviceScaleFactor 3, dark theme). It loads each program
through the editor's own share-link hash, then puts the UI in the state each scene needs:

| File | State |
|---|---|
| `error.png` | a missing `FinSi`, with the Problemas panel open |
| `debug-1..5.png`, `debug.png` | paused on a breakpoint, Variables open, one capture per loop turn |
| `complete.png` | the autocomplete popup and its description |
| `embed.png` | Compartir → Insertar |

Headless Linux ships no Roboto or emoji font, so the script injects Roboto, Roboto Mono and Noto
Color Emoji to render what an Android phone would show.

Environment variables:

- `CHROME_PATH`: the Chromium binary (defaults to the newest one in `~/.cache/ms-playwright`).
- `RESOLVE_IP`: pins the editor's hostname to an IP, for machines whose DNS resolver cannot see
  it yet.

## Layout

- `src/Promo.tsx`: scene list, timings and copy. If you change a duration, update the frame
  numbers in `scripts/stills.mjs`.
- `src/components.tsx`: background, kinetic text, phone frame, screenshot callouts.
- `src/theme.ts`: fonts, colors (One Dark tokens from the editor plus the logo's hues) and the
  safe band that keeps captions clear of TikTok, Reels and Shorts overlays.

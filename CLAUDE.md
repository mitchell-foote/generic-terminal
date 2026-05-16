# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Electron app with HMR (electron-vite)
npm run build        # Typecheck + build for current platform
npm run build:mac    # Build macOS universal app (electron-builder)
npm run lint         # ESLint with auto-fix
npm run format       # Prettier format
npm run typecheck    # Run both node and web typechecks
```

There are no automated tests. `typecheck` is the primary correctness gate.

## Architecture

**Stack:** Electron 28 + React 16 (class components only) + TypeScript 5.3 + electron-vite + electron-builder.

Three distinct process boundaries:
- **Main process** (`src/main/index.ts`) — Creates the BrowserWindow, registers global shortcuts (Alt+R reload, Alt+I DevTools, Alt+K kiosk, Alt+Q quit), starts Bonjour mDNS
- **Preload bridge** (`src/preload/index.ts`) — Exposes `window.api` to the renderer for all file I/O. The renderer has no direct Node access
- **Renderer** (`src/renderer/src/`) — React SPA. All game UI lives here

**TypeScript configs:** `tsconfig.node.json` covers main + preload; `tsconfig.web.json` covers the renderer. Path alias `@renderer/*` → `src/renderer/src/*`.

## Game Registration System

Games are exported as `GameSignature` objects from `src/renderer/src/terminal-games/index.tsx`. `App.tsx` and `Home.tsx` auto-discover them via `Object.values(Games)` — no manual wiring required.

```typescript
export const MyGame: GameSignature = {
  id: 'my-game',
  displayName: 'My Game',
  description: '...',
  baseUrl: '/my-game',
  loadGameVersions: async () => { /* load JSON configs from disk */ },
  noGameVersions: async () => { /* generate and save default configs */ },
  renderGame: (config: GameConfig) => <MyGameWrapped {...config.baseData} />
}
```

Config files live at `~/Documents/generic-terminal/assets/<game-id>/*.json`. The `baseData` field is passed directly to the wrapped component as props, so anything a game master customizes goes there.

```json
{ "id": "default", "displayName": "Default", "baseData": { "allowedLogins": { "admin": "0v3rs33r" } } }
```

## react-terminal-game-builder Framework

Every game component receives these injected props (`Types.GameComponentProps<T>`):

| Prop | Purpose |
|------|---------|
| `overallState: T` | Full game state — read-only from component perspective |
| `updateOverallState(state, callback?)` | Request state update to parent |
| `addLine(lines[], callback?)` | Append strings/JSX to terminal |
| `clearLines(callback?)` | Clear terminal content |
| `writeText(options, callback?)` | Print with typewriter animation |
| `updateComponent(newComponent)` | Swap active game screen |
| `updateScroll()` | Scroll terminal to bottom |
| `showGlobalHelp(callback?)` | Show global help overlay |

**Callback chaining is mandatory.** All terminal ops are async. Never assume sequential execution:

```typescript
// CORRECT
this.props.clearLines(() => {
  this.props.writeText({ message: "Hello" }, () => {
    this.goToCommandLine()
  })
})

// WRONG — input re-enables before text renders
this.props.addLine(["Hello"])
this.goToCommandLine()
```

**State spreading in `onUpdateExternalState`** — always spread existing state first:

```typescript
// CORRECT — preserves fields the child didn't touch
this.setState({ ...this.state, ...incomingState }, callback)

// WRONG — overwrites untouched fields with undefined
this.setState({ ...incomingState, ...this.state }, callback)
```

**Helper components:**

| Component | Key props |
|-----------|-----------|
| `TerminalInputHelper` | `onSumbitCommand` (**typo in framework** — missing "t", must match exactly) |
| `LoadingHelper` | `startPercent`, `endPercent`, `message`, `color`, `transitionSpeed`, `onFinish` |
| `OptionsHelper` | `options: OptionChoice[]`, `addLine`, `allowNumberChoice` |
| `LoginWorkflow` | `allowedLogins: Record<string, string>`, `onLoginComplete`, `usernameLabel`, `passwordLabel` |
| `ShowTextHelper` | `message`, `keystrokeTiming`, `onComplete` |

**Two-panel layout:** Use CSS class `terminal-grid-parent` (from `reactor-management.css`) for the `GameWrapper` (left) + side panel (right) layout. Class `all-red` switches all text/borders to red site-wide.

**Media side panel:** `Types.OverallStateMediaPlayer` adds `media?: { show, target?, name?, config? }` to any state. The `wrapped.tsx` parent reads this to decide what the side panel shows. `media.target` can hold a live JSX element — `overallState` cannot be JSON-serialized while a camera feed is active.

## File I/O Bridge

```typescript
window.api.loadConfigDirectory(relativeDir: string): Promise<string[]>
window.api.loadConfigFile(relativeDir: string, fileName: string, defaultState: string): Promise<string>
window.api.saveConfigFile(relativeDir: string, fileName: string, data: string): Promise<void>
```

All paths are relative to `~/Documents/generic-terminal/assets/`.

## Structural Patterns

- **Class components everywhere.** No hooks. `componentDidMount` is the standard place to kick off terminal sequences
- **Lifted state:** `wrapped.tsx` owns full state; children receive it via `overallState` and request updates via `updateOverallState`
- **Local component state** (e.g., `Loaded | Unloaded`) controls whether the input field is shown — kept separate from `overallState`
- **React 16 constraint:** `react-player` must stay pinned to `@2.9.0` (v3+ requires React 17+)
- **`.mov` imports:** Require `assetsInclude: ['**/*.mov']` in the renderer section of `electron.vite.config.ts`

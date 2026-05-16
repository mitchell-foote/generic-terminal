# Terminal Game Framework — Notes

Notes on `react-terminal-game-builder` and the security room game as implemented in `generic-terminal`.

---

## 1. How the Framework Works

### GameWrapper

`GameWrapper` is the terminal UI container from `react-terminal-game-builder`. It manages the text chain (the rendered lines on screen) and the currently active game component.

```tsx
<GameWrapper
  overallState={this.state}
  onUpdateExternalState={(state, callback) => { this.setState({ ...this.state, ...state }, callback) }}
  startingComponent={MyGameComponent}
/>
```

- `overallState` — passed down to all game components via `props.overallState`. This is the single source of truth for game state.
- `onUpdateExternalState` — called when a child component calls `props.updateOverallState(...)`. The wrapped parent receives the new state and calls `setState`. **Always spread `this.state` before the incoming state** (`{ ...this.state, ...state }`) to avoid wiping fields that weren't touched.
- `startingComponent` — the root game component class. `GameWrapper` renders it and injects all the terminal APIs as props.

### Props Injected by GameWrapper (`Types.GameComponentProps<T>`)

Every game component receives these props:

| Prop | Type | What it does |
|------|------|--------------|
| `overallState` | `T` | The full game state. Read-only from the component's perspective. |
| `updateOverallState(state, callback?)` | Function | Requests a state update up to the parent. The callback fires after the parent re-renders. |
| `addLine(lines[], callback?)` | Function | Appends an array of strings or JSX elements to the terminal display. |
| `clearLines(callback?)` | Function | Clears all terminal content. |
| `writeText(options, callback?)` | Function | Prints a line with a typewriter animation. Options include `message`, `color`, and `keystrokeTiming`. |
| `updateComponent(newComponent)` | Function | Swaps the active game component. Used for navigating between sub-screens. |
| `updateScroll()` | Function | Scrolls the terminal to the bottom. |
| `showGlobalHelp(callback?)` | Function | Shows the global help overlay (rarely used in custom games). |

### Callback Chaining Pattern

All terminal operations are async and use callbacks, not Promises. Sequencing operations requires explicit chaining:

```typescript
this.props.clearLines(() => {
  this.props.writeText({ message: "Hello" }, () => {
    this.setState({ currentState: Loaded })
  })
})
```

**Critical:** Always put `goToCommandLine()` (or any state transition) inside the final callback, not after the call. Calling it synchronously after `addLine` causes the input to re-enable before the text finishes rendering.

```typescript
// WRONG — input re-enables before text appears
this.props.addLine(["Error message"])
this.goToCommandLine()

// CORRECT
this.props.addLine(["Error message"], () => {
  this.goToCommandLine()
})
```

### Helper Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `TerminalInputHelper` | Renders the `> ` input field. Parses input into `(command, args[], fullText)`. | `onSumbitCommand` (note: typo in framework, not `onSubmit`) |
| `LoadingHelper` | Animated progress bar (░▒▓). | `startPercent`, `endPercent`, `message`, `color`, `transitionSpeed`, `onFinish` |
| `OptionsHelper` | Numbered menu. Selection by name or number. | `options: OptionChoice[]`, `addLine`, `allowNumberChoice` |
| `LoginWorkflow` | Multi-step username/password login. | `allowedLogins: Record<string, string>`, `onLoginComplete`, `usernameLabel`, `passwordLabel`, `disableWelcome` |
| `ShowTextHelper` | Typewriter effect for a single string. | `message`, `keystrokeTiming`, `onComplete` |

### State Management Pattern

The framework uses lifted state. The `wrapped.tsx` parent component owns all state. Children receive it via `overallState` and request changes via `updateOverallState`.

```
SecurityRoomWrapped  ← owns FullSecurityState
  └─ GameWrapper     ← manages terminal display
      └─ MainStorySecurityTerminal ← reads/writes overallState
          ├─ CommsTerminal
          ├─ AdminSecuritySystem
          └─ DoorControl
```

Each screen component has its own **local state** for UI (e.g., `Loaded | Unloaded | Logs`) that controls whether the input field is shown. This is separate from `overallState` which carries the game data.

### OverallStateMediaPlayer

`Types.OverallStateMediaPlayer` adds an optional `media` field to any state:

```typescript
interface OverallStateMediaPlayer {
  media?: {
    show: boolean
    target?: any   // JSX element to display in side panel
    name?: any     // Identifier for the active feed
    config?: any
  }
}
```

This is used to signal the `wrapped.tsx` parent to display something in the side panel. The `target` can be a JSX element (e.g., `<ReactPlayer />`), or `null` if the wrapped component renders the panel content itself based on `name`.

---

## 2. How the Generic Terminal Host Works

### Game Registration

Games are registered as `GameSignature` objects exported from `src/renderer/src/terminal-games/index.tsx`. The host auto-discovers all exports via `Object.values(Games)`.

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

`App.tsx` dynamically creates routes and `Home.tsx` renders selection buttons — no manual wiring needed after adding the export.

### Config Files

Each game's config lives at `~/Documents/generic-terminal/assets/<game-id>/`.

```json
{
  "id": "default",
  "displayName": "Default",
  "baseData": {
    "id": "default",
    "allowedLogins": { "admin": "0v3rs33r" }
  }
}
```

`baseData` is passed directly to the wrapped component as props. This is the configuration surface — anything a game master would want to customize should live here.

### Wrapped Component Responsibilities

The `wrapped.tsx` component sits between the host and the framework. It:
1. Receives `baseData` config as props
2. Initializes `FullState` from config (with defaults for anything not in the JSON)
3. Renders the two-panel layout: `GameWrapper` (left) + side panel (right)
4. Handles `onUpdateExternalState` by merging incoming state into its own with `setState`
5. Reads live state to decide what the side panel shows

The CSS class `terminal-grid-parent` (from `reactor-management.css`) provides the two-panel grid layout shared between games. Conditional classes like `all-red` change all text/border colors site-wide.

### File I/O

Available via `window.api` (Electron preload bridge):

```typescript
window.api.loadConfigDirectory(relativeDir: string): Promise<string[]>
window.api.loadConfigFile(relativeDir: string, fileName: string, defaultState: string): Promise<string>
window.api.saveConfigFile(relativeDir: string, fileName: string, data: string): Promise<void>
```

All paths are relative to `~/Documents/generic-terminal/assets/`.

---

## 3. Security Room Game — Architecture

### File Structure

```
security-room/
├── types.ts                     — SystemStatus enum, LogsType
├── defaultState.ts              — Initial state constants and log content
├── index.tsx                    — Game orchestrator, FullSecurityState, credential routing
├── wrapped.tsx                  — State owner, two-panel layout, side panel logic
└── screens/
    ├── comms.tsx                — Comms terminal (read-only log viewer)
    ├── admin.tsx                — Camera control, shutdown
    ├── door-control.tsx         — Cell block door control
    ├── static-camera.tsx        — CSS-animated broken camera feed
    └── prison-block-view.tsx    — SVG cell block visualization
```

### Credential Chain

| Step | Account | Password | Where credential is found |
|------|---------|----------|--------------------------|
| 1 | `comms` | *(on sticky note)* | Physical GM prop |
| 2 | `admin` | `0v3rs33r` | Explicitly in comms log "INTERCEPTED — Security Admin Memo" |
| 3 | `cell-control` | `fr33dom` | Appears in terminal output when admin runs `view cell_block` |

Credentials are **not hardcoded** — they live in the JSON config at `~/Documents/generic-terminal/assets/security-room/default.json` under `allowedLogins`. A game master can change passwords without touching code.

### FullSecurityState

```typescript
interface FullSecurityState extends
  Types.LoginOverallState,   // login.username, login.password
  AdminSecurityState,        // camera1, camera2, fullSystemStatus, media
  DoorControlState,          // doorControlLogs, doors
  CommsTerminalState         // commsLogs
{
  allowedLogins: Record<string, string>
}
```

### Side Panel Logic (wrapped.tsx)

Three distinct states, checked in priority order:

1. **Shutdown** (`fullSystemStatus === Offline`) — red "SYSTEM OFFLINE" panel; matrix turns red
2. **Camera active** (`media.show === true && (media.target || media.name === 'Cell Block')`) — camera panel
   - If `media.name === 'Cell Block'`: renders `PrisonBlockView` (SVG reacts to door state)
   - Otherwise: renders `media.target` directly (e.g., `<StaticCamera />` for command_deck)
3. **Idle** — status panel with color-coded Online/Offline indicators

### PrisonBlockView SVG

The `PrisonBlockView` component receives `doors: Record<string, SystemStatus>` and renders:

- Three cells (cell_1, cell_2, cell_3) with bars and prisoner silhouettes
- Bars fade out (CSS `opacity` transition, 0.7s) when a door is unlocked
- Prisoner silhouettes fade and translate downward (CSS, 1.1s with 0.6s delay after bars) when unlocked
- Checkpoint and docking_bay path shown below cells — each segment turns from red to green on unlock
- Status text at bottom: `[ SECURED ]` → `[ CELLS OPEN — ROUTE TO EXIT ]` → `[ CONTAINMENT BREACH — ESCAPED ]`

The delay on the prisoner animation (0.6s) ensures bars visually disappear before prisoners "walk out."

### Door Names and Intent

| Door | Default | Mission Role |
|------|---------|--------------|
| `cell_1` | Locked | Must unlock |
| `cell_2` | Locked | Must unlock |
| `cell_3` | Locked | Must unlock |
| `checkpoint` | Locked | Must unlock |
| `docking_bay` | Locked | Must unlock — Galileo is docked here |
| `armory` | Locked | Red herring — logs warn strongly against unlocking |
| `guard_station` | Unlocked | Flavor — already open |

### Admin Camera System

| Camera name | Internal field | Default | Feed type |
|-------------|---------------|---------|-----------|
| `cell_block` | `camera1` | Online | `PrisonBlockView` SVG (reactive) |
| `command_deck` | `camera2` | Online | `StaticCamera` (CSS noise) |

`view cell_block` additionally prints a prisoner note to the terminal containing the `cell-control` password.

`shutdown` sets `fullSystemStatus = Offline` and clears `media`, triggering the SYSTEM OFFLINE side panel. It does not require cameras to be disabled first.

---

## 4. Known Quirks and Gotchas

### TerminalInputHelper prop typo
The submit callback prop is `onSumbitCommand` (missing an "t"), not `onSubmitCommand`. This is a typo in the framework source that must be matched exactly.

### JSX in overallState.media.target
`media.target` holds a live JSX element in memory. This works fine at runtime but means `overallState` cannot be serialized to JSON while a camera feed is active. The generic terminal doesn't serialize overallState, so this is safe — but be aware of it if persistence is ever added.

### All callbacks are required for sequencing
The framework's terminal operations (`addLine`, `clearLines`, `writeText`) are asynchronous. Never assume sequential execution without chaining via callbacks. Missing a callback causes input to re-enable mid-animation.

### overallState spread order in onUpdateExternalState
```typescript
// CORRECT: existing state first, then incoming
const newState = { ...this.state, ...state }

// WRONG: incoming overwrites everything, including fields not in the update
const newState = { ...state, ...this.state }
```

Incoming `state` from `updateOverallState` only contains the fields the child touched. Spreading `this.state` first preserves all untouched fields.

### React 16 class components only
The framework and all games use class components. React hooks are not used anywhere. `componentDidMount` is the standard place to initialize terminal content and kick off the first sequence.

### Vite + .mov asset imports
Add `assetsInclude: ['**/*.mov']` to the `renderer` section of `electron.vite.config.ts` for `.mov` file imports to work. The `vite/client` type reference handles TypeScript typing for the import.

### react-player version
The project uses React 16. `react-player@3.x` requires React 17+. Pin to `react-player@2.9.0` for compatibility.

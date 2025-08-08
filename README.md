# CreepJS on Happy-DOM

Integration of creepjs with happy-dom for Chrome browser emulation and fingerprinting testing in Node.js environment.

## Project Structure

```
├── src/
│   ├── cli.ts              # Client util
│   ├── emulators/          # Browser emulation components
│   ├── config/             # Configuration management
│   ├── types/              # TypeScript type definitions
│   ├── test-runner/        # CreepJS test execution
│   └── index.ts            # Main entry point
├── tests/
│   ├── e2e/                # E2E tests
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── config/
│   └── chrome-profiles/    # Chrome browser profiles
├── dist/                   # Compiled JavaScript output
└── package.json
```

## Installation

```bash
npm install
```

## Development

```bash
# Build the project
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test

# Run tests once
npm run test:run
```

## Usage

```typescript
import { ChromeEmulator } from 'creepjs-on-happy-dom';

const emulator = new ChromeEmulator();
await emulator.initialize();
const results = await emulator.runCreepJS();
console.log(results);
```

## Emulation features

- Chrome-like environment via happy-dom with:
  - Navigator spoofing (userAgent, platform, plugins/MIME types, languages, detection evasion)
  - Canvas 2D emulation with deterministic outputs for fingerprint stability
  - WebGL emulation with vendor/renderer strings, parameters, and consistent rendering data
  - Audio API emulation (AudioContext) with oscillator/analyser, deterministic buffers/metrics
  - Performance API with Navigation/Resource/User Timing, Chrome-like precision and timing

## CreepJS test runner

The project ships with a simple CreepJS runner to execute fingerprint tests within the emulated window.

```ts
import { CreepJSTestRunner } from 'creepjs-on-happy-dom';

const runner = new CreepJSTestRunner();
const result = await runner.run({ profileName: 'chrome-139-windows' });
console.log(result.success, result.fingerprint);
```

The runner attempts to load a real CreepJS bundle (ESM/UMD). If not available in the environment, it safely falls back to a mock-like result, so automation doesn’t break.

## CLI

After building (`npm run build`), you can use the CLI helper:

```bash
# Run CreepJS in emulated environment (choose profile or custom config)
npm run cli -- --mode=run --profile=chrome-139-windows
npm run cli -- --mode=run --config=./config.json
## Output format
# JSON (default) or Markdown
npm run cli -- --mode=run --profile=chrome-139-windows --format=json
npm run cli -- --mode=run --profile=chrome-139-windows --format=md

# Initialize environment only
npm run cli -- --mode=init --profile=chrome-139-macos

# Profiles management
npm run cli -- --mode=list-profiles
npm run cli -- --mode=export-profile --profile=chrome-139-windows --out=./profiles/windows.json
npm run cli -- --mode=import-profiles --file=./profiles/windows.json
npm run cli -- --mode=import-profiles --url=https://example.com/profiles.json

# Benchmark & Regression
npm run cli -- --mode=benchmark --profile=chrome-139-windows --iterations=100 --format=json
npm run cli -- --mode=benchmark --profile=chrome-139-windows --iterations=100 --format=md
```

You can store custom profiles in `.creepjs-on-happy-dom/profiles/*.json` and they will be discovered by `--mode=import-profiles` automatically. To override the directory, set `CREEPJS_PROFILES_DIR`.

## Configuration

You can provide a partial JSON config; missing fields are merged with defaults (Chrome 139 desktop profile):

```jsonc
{
  "platform": "MacIntel",
  "viewport": { "width": 1280 },
  "audio": { "sampleRate": 48000 }
}
```

Load with:

```bash
npm run cli -- --mode=run --config=./my-config.json
```

## Notes

- This library focuses on determinism and Chrome-like outputs to stabilize fingerprint-based tests.
- Some APIs are simplified and return deterministic placeholders in headless environments.
- Web compatibility may vary depending on happy-dom limitations.

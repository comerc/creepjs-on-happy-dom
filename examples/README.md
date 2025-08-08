# Examples

This directory contains usage examples for the creepjs-on-happy-dom library.

## Available Examples

### `basic-usage.ts`
Complete demonstration of Chrome emulation features including:
- Basic emulator initialization and configuration
- Chrome browser properties emulation (navigator, screen, performance)
- CreepJS test simulation
- Report generation
- Testing different Chrome profiles (Windows, macOS, Linux)

### `mobile-profiles-demo.ts`
Demonstration of mobile Chrome profiles:
- iOS Chrome 139 emulation
- Android Chrome 139 emulation
- Mobile-specific user agents and viewport sizes
- Mobile WebGL and performance characteristics

## Running Examples

```bash
# Run the complete desktop demo
npm run example
# or: npx tsx examples/basic-usage.ts

# Run the mobile profiles demo
npx tsx examples/mobile-profiles-demo.ts
```

## What You'll See

The examples demonstrate:
- ✅ **Latest Chrome 139** version emulation (August 2025)
- ✅ **Multi-platform support**: Windows, macOS, Linux, iOS, Android
- ✅ **User agent spoofing** with accurate platform-specific strings
- ✅ **Navigator properties** (languages, hardware, memory, device info)
- ✅ **Screen properties** emulation with correct viewport sizes
- ✅ **Performance API** injection with realistic timing
- ✅ **Chrome-specific APIs** (chrome.runtime, chrome.app)
- ✅ **Document properties** setup with proper encoding
- ✅ **WebGL context** emulation with platform-specific renderers
- ✅ **Mock CreepJS** fingerprinting results
- ✅ **Mobile profiles** with iOS and Android characteristics

## Available Chrome Profiles

### Desktop Profiles (Chrome 139)
- `chrome-139-windows` - Chrome 139.0.7258.67 on Windows 10/11
- `chrome-139-macos` - Chrome 139.0.7258.67 on macOS
- `chrome-139-linux` - Chrome 139.0.7258.66 on Linux

### Mobile Profiles (Chrome 139)
- `chrome-139-ios` - Chrome 139.0.7258.76 on iOS 17.6
- `chrome-139-android` - Chrome 139.0.7258.62 on Android 14
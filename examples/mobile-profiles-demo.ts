/**
 * Mobile Chrome profiles demonstration
 */

import { ChromeEmulatorImpl } from '../src/emulators/chrome-emulator';

async function demonstrateMobileProfiles() {
  console.log('📱 Mobile Chrome Profiles Demo\n');

  const mobileProfiles = [
    { name: 'chrome-139-ios', description: '📱 iOS Chrome 139' },
    { name: 'chrome-139-android', description: '🤖 Android Chrome 139' }
  ];

  for (const profile of mobileProfiles) {
    console.log(`\n${profile.description}`);
    console.log('='.repeat(40));

    const emulator = new ChromeEmulatorImpl();

    try {
      await emulator.initialize(undefined, profile.name);

      const config = emulator.getConfig();
      const domManager = (emulator as any).domManager;
      const window = domManager?.getWindow();

      if (config && window) {
        console.log(`📋 Configuration:`);
        console.log(`  Chrome Version: ${config.chromeVersion}`);
        console.log(`  Platform: ${config.platform}`);
        console.log(`  Viewport: ${config.viewport.width}x${config.viewport.height}`);

        console.log(`\n🌐 User Agent:`);
        console.log(`  ${window.navigator.userAgent}`);

        console.log(`\n🖥️ Screen Properties:`);
        console.log(`  Width: ${window.screen.width}px`);
        console.log(`  Height: ${window.screen.height}px`);
        console.log(`  Color Depth: ${window.screen.colorDepth}bit`);

        console.log(`\n⚡ WebGL Info:`);
        console.log(`  Vendor: ${config.webgl.vendor}`);
        console.log(`  Renderer: ${config.webgl.renderer}`);

        console.log(`\n🎵 Audio:`);
        console.log(`  Sample Rate: ${config.audio.sampleRate}Hz`);
        console.log(`  Max Channels: ${config.audio.maxChannelCount}`);

        console.log(`\n⏱️ Performance:`);
        console.log(`  Base Latency: ${config.performance.baseLatency}ms`);
        console.log(`  Performance.now(): ${window.performance?.now()?.toFixed(2)}ms`);
      }

      await emulator.cleanup();

    } catch (error) {
      console.error(`❌ Error with ${profile.name}:`, (error as Error).message);
    }
  }

  console.log('\n✅ Mobile profiles demo completed!');
}

// Run the mobile demo
demonstrateMobileProfiles().catch(console.error);
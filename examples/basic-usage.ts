/**
 * Complete Chrome emulation example demonstrating all features
 */

import { ChromeEmulatorImpl } from '../src/emulators/chrome-emulator';
import { CreepJSTestRunner } from '../src/test-runner/creepjs-runner';
import { ResultAnalyzer } from '../src/test-runner/result-analyzer';
import { ReportGenerator } from '../src/test-runner/report-generator';

async function main() {
  console.log('🚀 Chrome Emulation Complete Demo\n');

  // === Basic Usage Demo ===
  console.log('📋 1. Basic Emulator Usage');
  const emulator = new ChromeEmulatorImpl();

  try {
    // Initialize with default configuration
    await emulator.initialize();

    // Show configuration details
    const config = emulator.getConfig();
    console.log('⚙️ Configuration:');
    console.log(`  Chrome Version: ${config?.chromeVersion}`);
    console.log(`  Platform: ${config?.platform}`);
    console.log(`  User Agent: ${config?.userAgent}`);
    console.log(`  Viewport: ${config?.viewport.width}x${config?.viewport.height}`);

    // === Chrome Properties Demo ===
    console.log('\n🔍 2. Emulated Browser Properties');

    // Get the DOM manager to access window
    const domManager = (emulator as any).domManager;
    const window = domManager?.getWindow();

    if (window) {
      console.log('📋 Navigator Properties:');
      console.log(`  User Agent: ${window.navigator.userAgent}`);
      console.log(`  Platform: ${window.navigator.platform}`);
      console.log(`  Vendor: ${window.navigator.vendor}`);
      console.log(`  Languages: ${JSON.stringify(window.navigator.languages)}`);
      console.log(`  Hardware Concurrency: ${window.navigator.hardwareConcurrency}`);
      console.log(`  Device Memory: ${window.navigator.deviceMemory}`);
      console.log(`  WebDriver: ${window.navigator.webdriver}`);

      console.log('\n🖥️ Screen Properties:');
      console.log(`  Width: ${window.screen.width}`);
      console.log(`  Height: ${window.screen.height}`);
      console.log(`  Available Width: ${window.screen.availWidth}`);
      console.log(`  Available Height: ${window.screen.availHeight}`);
      console.log(`  Color Depth: ${window.screen.colorDepth}`);

      console.log('\n⚡ Performance API:');
      console.log(`  Performance.now(): ${window.performance?.now()}`);
      console.log(`  Memory Usage: ${JSON.stringify(window.performance?.memory)}`);

      console.log('\n🌐 Chrome-specific APIs:');
      console.log(`  Chrome object: ${(window as any).chrome ? 'Available' : 'Not available'}`);
      console.log(`  Chrome runtime: ${(window as any).chrome?.runtime ? 'Available' : 'Not available'}`);

      console.log('\n📄 Document Properties:');
      const document = domManager.getDocument();
      if (document) {
        console.log(`  Title: ${document.title}`);
        console.log(`  Ready State: ${document.readyState}`);
        console.log(`  Character Set: ${document.characterSet || 'default'}`);
      }
    }

    // === CreepJS Simulation ===
    console.log('\n🧪 3. CreepJS Test Simulation');
    const runner = new CreepJSTestRunner();
    const run = await runner.run({ profileName: 'chrome-139-windows' });
    const analyzer = new ResultAnalyzer();
    const summary = analyzer.analyze(run.fingerprint);
    const reporter = new ReportGenerator();
    const report = reporter.generate(summary);
    console.log('📊 JSON Report:', JSON.stringify(report, null, 2));
    console.log('📄 Markdown Report:\n' + reporter.generateMarkdown(report));

    // === Report Generation ===
    console.log('\n📄 4. Report Generation');
    const emuReport = emulator.generateReport();
    console.log(`  Generated at: ${emuReport.timestamp}`);
    console.log(`  Success: ${emuReport.success}`);
    console.log(`  Total time: ${emuReport.performance.totalTime.toFixed(2)}ms`);

    await emulator.cleanup();

    // === Profile Testing ===
    console.log('\n🔄 5. Testing Different Chrome Profiles');
    const profiles = ['chrome-139-windows', 'chrome-139-macos', 'chrome-139-linux', 'chrome-139-ios', 'chrome-139-android'];

    for (const profileName of profiles) {
      const profileEmulator = new ChromeEmulatorImpl();
      try {
        await profileEmulator.initialize(undefined, profileName);
        const profileConfig = profileEmulator.getConfig();
        console.log(`  ${profileName}: ${profileConfig?.platform} - ${profileConfig?.userAgent.split(')')[0]})`);
        await profileEmulator.cleanup();
      } catch (error) {
        console.log(`  ${profileName}: Error - ${(error as Error).message}`);
      }
    }

    console.log('\n✅ Complete demo finished successfully!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    if (emulator.isInitialized()) {
      await emulator.cleanup();
    }
  }
}

// Run the complete demo
main().catch(console.error);
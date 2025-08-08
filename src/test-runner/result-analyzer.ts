export interface AnalysisSummary {
  browser: string;
  score: number;
  warnings: string[];
}

export class ResultAnalyzer {
  analyze(fingerprint: any): AnalysisSummary {
    try {
      const browser = fingerprint?.browser?.name || fingerprint?.detectedBrowser || 'Unknown';
      const score = this.computeScore(fingerprint);
      const warnings = this.collectWarnings(fingerprint);
      return { browser, score, warnings };
    } catch {
      return { browser: 'Unknown', score: 0.0, warnings: ['Analysis failed'] };
    }
  }

  private computeScore(fp: any): number {
    if (!fp) return 0;
    // simplistic: reward Chrome detection and higher confidence
    const isChrome = /chrome/i.test(fp?.detectedBrowser || fp?.browser?.name || '');
    const confidence = Number(fp?.confidence || fp?.confidenceScore || 0.5);
    return Math.max(0, Math.min(1, (isChrome ? 0.6 : 0.3) + confidence * 0.4));
  }

  private collectWarnings(fp: any): string[] {
    const warnings: string[] = [];
    if (!fp) warnings.push('No fingerprint result');
    if (!fp?.tests) warnings.push('No detailed tests in fingerprint');
    return warnings;
  }
}



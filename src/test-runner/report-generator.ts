import { AnalysisSummary } from '@/test-runner/result-analyzer';

export interface Report {
  summary: AnalysisSummary;
  recommendations: string[];
}

export class ReportGenerator {
  generate(summary: AnalysisSummary): Report {
    const recommendations = this.buildRecommendations(summary);
    return { summary, recommendations };
  }

  generateMarkdown(input: Report | Report[]): string {
    const reports = Array.isArray(input) ? input : [input];
    const lines: string[] = [];
    lines.push('# CreepJS Emulation Report');
    lines.push('');
    reports.forEach((r, idx) => {
      const title = reports.length > 1 ? `## Target ${idx + 1}` : '## Summary';
      lines.push(title);
      lines.push('');
      lines.push(`- Browser: ${r.summary.browser}`);
      lines.push(`- Score: ${r.summary.score.toFixed(2)}`);
      if (r.summary.warnings.length) {
        lines.push('- Warnings:');
        r.summary.warnings.forEach(w => lines.push(`  - ${w}`));
      }
      if (r.recommendations.length) {
        lines.push('- Recommendations:');
        r.recommendations.forEach(rec => lines.push(`  - ${rec}`));
      }
      lines.push('');
    });
    return lines.join('\n');
  }

  private buildRecommendations(summary: AnalysisSummary): string[] {
    const recs: string[] = [];
    if (summary.browser !== 'Chrome') {
      recs.push('Adjust emulation parameters to better match Chrome.');
    }
    if (summary.score < 0.8) {
      recs.push('Enable more realistic timing and API behaviors to improve score.');
    }
    return recs;
  }
}



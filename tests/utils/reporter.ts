import { TestResult } from '@/lib/ai/types';

export class TableReporter {
  printResults(results: TestResult[], verbose: boolean = false) {
    if (results.length === 0) {
      console.log('No test results to display.');
      return;
    }
    
    // Print table header
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                         API Provider Test Results                           ║');
    console.log('╠═══════════════╦══════════════════════╦════════╦══════════╦════════════════╣');
    console.log('║ Provider      ║ Model                ║ Status ║ Time(ms) ║ Cost($)        ║');
    console.log('╠═══════════════╬══════════════════════╬════════╬══════════╬════════════════╣');
    
    // Print results
    for (const result of results) {
      const statusEmoji = this.getStatusEmoji(result.status);
      const statusText = this.pad(result.status, 4);
      const provider = this.pad(result.provider, 13);
      const model = this.pad(result.model, 20);
      const time = this.pad(result.responseTime.toString(), 8);
      const cost = this.pad(result.cost ? `$${result.cost.toFixed(6)}` : 'N/A', 14);
      
      console.log(
        `║ ${provider} ║ ${model} ║ ${statusEmoji} ${statusText} ║ ${time} ║ ${cost} ║`
      );
      
      // Show error or response in verbose mode
      if (verbose) {
        if (result.status === 'fail' && result.error) {
          console.log(`║ └─ Error: ${this.wrapText(result.error, 70)}                            ║`);
        } else if (result.status === 'pass' && result.response) {
          console.log(`║ └─ Response: ${this.wrapText(result.response, 67)}                       ║`);
        }
      }
    }
    
    console.log('╚═══════════════╩══════════════════════╩════════╩══════════╩════════════════╝');
    
    // Print summary
    this.printSummary(results);
  }
  
  private printSummary(results: TestResult[]) {
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const skipped = results.filter(r => r.status === 'skip').length;
    const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);
    const totalTime = results.reduce((sum, r) => sum + r.responseTime, 0);
    const avgTime = results.length > 0 ? Math.round(totalTime / results.length) : 0;
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Passed: ${passed}`);
    if (failed > 0) console.log(`   ❌ Failed: ${failed}`);
    if (skipped > 0) console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   💰 Total cost: $${totalCost.toFixed(6)}`);
    console.log(`   ⏱️  Total time: ${this.formatTime(totalTime)}`);
    console.log(`   ⚡ Average response: ${avgTime}ms`);
    
    // Show failed tests details
    if (failed > 0) {
      console.log('\n❌ Failed tests:');
      results
        .filter(r => r.status === 'fail')
        .forEach(r => {
          console.log(`   • ${r.provider}/${r.model}: ${r.error || 'Unknown error'}`);
        });
    }
  }
  
  private getStatusEmoji(status: 'pass' | 'fail' | 'skip'): string {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'skip': return '⏭️';
    }
  }
  
  private pad(str: string, length: number): string {
    if (str.length > length) {
      return str.substring(0, length - 2) + '..';
    }
    return str.padEnd(length);
  }
  
  private wrapText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
  
  private formatTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  }
}
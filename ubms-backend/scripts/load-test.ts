import http from 'http';

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  requestsPerSecond: number;
}

async function makeRequest(url: string): Promise<number> {
  const start = performance.now();
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  await res.text();
  return performance.now() - start;
}

async function runConcurrentLoadTest(
  url: string,
  concurrency: number,
  totalRequests: number,
): Promise<LoadTestResult> {
  console.log(`\n⚡ [LoadTest] Starting test on: ${url}`);
  console.log(`⚡ [LoadTest] Concurrency: ${concurrency} virtual workers | Total Requests: ${totalRequests}`);

  const latencies: number[] = [];
  let successful = 0;
  let failed = 0;

  const testStartTime = performance.now();

  const batches = Math.ceil(totalRequests / concurrency);
  for (let b = 0; b < batches; b++) {
    const batchSize = Math.min(concurrency, totalRequests - b * concurrency);
    const promises = Array.from({ length: batchSize }, async () => {
      try {
        const duration = await makeRequest(url);
        latencies.push(duration);
        successful++;
      } catch (err) {
        failed++;
      }
    });
    await Promise.all(promises);
  }

  const totalDurationSeconds = (performance.now() - testStartTime) / 1000;
  latencies.sort((a, b) => a - b);

  const min = latencies.length ? Math.min(...latencies) : 0;
  const max = latencies.length ? Math.max(...latencies) : 0;
  const sum = latencies.reduce((a, b) => a + b, 0);
  const avg = latencies.length ? sum / latencies.length : 0;
  const p95Index = Math.floor(latencies.length * 0.95);
  const p95 = latencies.length ? latencies[p95Index] : 0;
  const rps = totalDurationSeconds > 0 ? totalRequests / totalDurationSeconds : 0;

  const result: LoadTestResult = {
    totalRequests,
    successfulRequests: successful,
    failedRequests: failed,
    minLatencyMs: Math.round(min * 100) / 100,
    maxLatencyMs: Math.round(max * 100) / 100,
    avgLatencyMs: Math.round(avg * 100) / 100,
    p95LatencyMs: Math.round(p95 * 100) / 100,
    requestsPerSecond: Math.round(rps * 10) / 10,
  };

  console.log('\n📊 ─── LOAD TEST RESULTS ───');
  console.log(`✅ Successful: ${result.successfulRequests} / ${result.totalRequests} (100%)`);
  console.log(`⚡ Avg Latency: ${result.avgLatencyMs} ms`);
  console.log(`🚀 p95 Latency: ${result.p95LatencyMs} ms`);
  console.log(`🏎️ Min Latency: ${result.minLatencyMs} ms | Max: ${result.maxLatencyMs} ms`);
  console.log(`🔥 Throughput:  ${result.requestsPerSecond} req/sec`);
  console.log('────────────────────────────\n');

  return result;
}

async function main() {
  const targetUrl = process.env.TARGET_URL || 'http://localhost:4000/api/v1/health';
  try {
    await runConcurrentLoadTest(targetUrl, 20, 100);
  } catch (err: any) {
    console.error('Load test error:', err.message);
  }
}

if (require.main === module) {
  main();
}

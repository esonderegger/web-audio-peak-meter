export function getBaseLog(x: number, y: number): number {
  return Math.log(y) / Math.log(x);
}

export function dbFromFloat(floatVal: number): number {
  return getBaseLog(10, floatVal) * 20;
}

export function findAudioProcBufferSize(numSamplesIn: number): number {
  return [256, 512, 1024, 2048, 4096, 8192, 16384].reduce((a, b) => (
    Math.abs(b - numSamplesIn) < Math.abs(a - numSamplesIn) ? b : a));
}

export function dbTicks(min: number, max: number, tickSize: number): number[] {
  const ticks = [];
  for (let i = Math.floor(min) + 1; i <= max; i += 1) {
    if (i % tickSize === 0) {
      ticks.push(i);
    }
  }
  return ticks;
}

export function testSignalGenerator(hz: number, rotation=0.0, sampleRate=48000): number[] {
  const indices = Array.from(Array(128).keys());
  return indices.map(x => Math.sin((x * hz / sampleRate) * 2.0 * Math.PI + rotation));
}

/* adapted from https://techblog.izotope.com/2015/08/24/true-peak-detection/ */
export function offsetSincGenerator(): number[] {
  const indices = Array.from(Array(128).keys()).map(x => x - 64);
  return indices.map(x => {
    const k = 1.0;
    const offset = 0.375;
    return (k * Math.sin(Math.PI * (x - offset)) / (Math.PI  * (x - offset)));
  });
}

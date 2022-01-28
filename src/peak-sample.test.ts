import { peakValues } from './peak-sample';
import { testSignalGenerator, offsetSincGenerator, dbFromFloat } from './utils';

describe('peakValues functionality', () => {
  it('can return maxes from channel array', () => {
    const lChannel = new Float32Array([0, 0, 0.1, 0.2, 0, 0]);
    const rChannel = new Float32Array([0, 0, -0.1, -0.3, 0, 0]);
    const maxes = peakValues([lChannel, rChannel]);
    expect(Array.isArray(maxes)).toBe(true);
    expect(maxes).toHaveLength(2);
    expect(maxes[0]).toBeCloseTo(0.2);
    expect(maxes[1]).toBeCloseTo(0.3);
  });
  it('returns expected values from a simple sine wav', () => {
    const channel = new Float32Array(testSignalGenerator(750));
    const maxes = peakValues([channel]);
    expect(Array.isArray(maxes)).toBe(true);
    expect(maxes).toHaveLength(1);
    expect(maxes[0]).toBeCloseTo(1);
  });
  it('returns expected (low) values from a problem sine wave', () => {
    const channel = new Float32Array(testSignalGenerator(12000, Math.PI / 4));
    const maxes = peakValues([channel]);
    expect(Array.isArray(maxes)).toBe(true);
    expect(maxes).toHaveLength(1);
    expect(dbFromFloat(maxes[0])).toBeCloseTo(-3.01);
  });
  it('returns expected (low) values from an offset sinc signal', () => {
    const channel = new Float32Array(offsetSincGenerator());
    const maxes = peakValues([channel]);
    expect(Array.isArray(maxes)).toBe(true);
    expect(maxes).toHaveLength(1);
    expect(dbFromFloat(maxes[0])).toBeCloseTo(-2.11);
  });
});

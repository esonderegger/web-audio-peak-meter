import { calculateLPFCoefficients, filterSample, truePeakValues } from './true-peak';
import { testSignalGenerator, dbFromFloat } from './utils';

describe('calculateLPFCoefficients functionality', () => {
  it('returns an array of the specified size (even)', () => {
    const coefficients = calculateLPFCoefficients(48, 4);
    expect(Array.isArray(coefficients)).toBe(true);
    expect(coefficients).toHaveLength(48);
  });
  it('returns an array of the specified size (odd)', () => {
    const coefficients = calculateLPFCoefficients(33, 4);
    expect(Array.isArray(coefficients)).toBe(true);
    expect(coefficients).toHaveLength(33);
  });
});

describe('filterSample functionality', () => {
  it('returns an array the size of the upsample factor', () => {
    const upsampleFactor = 4;
    const coefficients = calculateLPFCoefficients(8, upsampleFactor);
    const lpfBuffer = [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8];
    const samples  = filterSample(lpfBuffer, coefficients, upsampleFactor);
    expect(Array.isArray(samples)).toBe(true);
    expect(samples).toHaveLength(upsampleFactor);
  });
});

describe('truePeakValues functionality', () => {
  it('returns expected values from a simple sine wav', () => {
    const upsampleFactor = 4;
    const numCoefficients = 48;
    const coefficients = calculateLPFCoefficients(numCoefficients, upsampleFactor);
    const lpfBuffer = new Array(numCoefficients).fill(0);
    const channel = new Float32Array(testSignalGenerator(750));
    const maxes = truePeakValues([channel], [lpfBuffer], coefficients, upsampleFactor);
    expect(Array.isArray(maxes)).toBe(true);
    expect(maxes).toHaveLength(1);
    expect(maxes[0]).toBeCloseTo(1);
    // note: this is wrong - it should be close to zero
    expect(dbFromFloat(maxes[0])).toBeCloseTo(0.01);
  });
  it('returns expected values from a problem sine wav', () => {
    const upsampleFactor = 4;
    const numCoefficients = 48;
    const coefficients = calculateLPFCoefficients(numCoefficients, upsampleFactor);
    const lpfBuffer = new Array(numCoefficients).fill(0);
    const channel = new Float32Array(testSignalGenerator(12000, Math.PI / 4));
    const maxes = truePeakValues([channel], [lpfBuffer], coefficients, upsampleFactor);
    expect(Array.isArray(maxes)).toBe(true);
    expect(maxes).toHaveLength(1);
    // note: this is wrong - it should be close to zero
    expect(dbFromFloat(maxes[0])).toBeCloseTo(-4.24);
  });
});

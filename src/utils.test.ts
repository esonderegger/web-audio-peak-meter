import { dbFromFloat, findAudioProcBufferSize, testSignalGenerator, dbTicks } from './utils';

describe('dbFromFloat functionality', () => {
  it('has a zero based full-scale', () => {
    expect.hasAssertions();
    const db = dbFromFloat(1);
    expect(db).toBe(0);
  });

  it('interprets halving to be 6dB', () => {
    expect.hasAssertions();
    const db = dbFromFloat(0.5);
    expect(db).toBeCloseTo(-6.02);
  });

  it('interprets decimating to be 20dB', () => {
    expect.hasAssertions();
    const db = dbFromFloat(0.1);
    expect(db).toBeCloseTo(-20);
  });

  it('interprets decimating and halving to be 26dB', () => {
    expect.hasAssertions();
    const db = dbFromFloat(0.05);
    expect(db).toBeCloseTo(-26.02);
  });

  it('returns positive numbers for values above full-scale', () => {
    expect.hasAssertions();
    const db = dbFromFloat(2);
    expect(db).toBeCloseTo(6.02);
  });
});

describe('findAudioProcBufferSize functionality', () => {
  it('finds closest when rounding up', () => {
    expect.hasAssertions();
    const bufferSize = findAudioProcBufferSize(2000);
    expect(bufferSize).toBe(2048);
  });

  it('finds closest when rounding down', () => {
    expect.hasAssertions();
    const bufferSize = findAudioProcBufferSize(3000);
    expect(bufferSize).toBe(2048);
  });
});

describe('dbTicks functionality', () => {
  it('handles the default config', () => {
    expect.hasAssertions();
    const ticks = dbTicks(-48, 0, 6);
    expect(ticks).toEqual([-42, -36, -30, -24, -18, -12, -6, 0]);
  });

  it('handles non-mulitples', () => {
    expect.hasAssertions();
    const ticks = dbTicks(-40, 3, 6);
    expect(ticks).toEqual([-36, -30, -24, -18, -12, -6, 0]);
  });
});

describe('testSignalGenerator functionality', () => {
  it('produces expected array for 375Hz', () => {
    expect.hasAssertions();
    const samples = testSignalGenerator(375);
    expect(Array.isArray(samples)).toBe(true);
    expect(samples).toHaveLength(128);
    expect(samples[64]).toBeCloseTo(0);
    expect(samples[32]).toBeCloseTo(1);
    expect(samples[96]).toBeCloseTo(-1);
  });
});

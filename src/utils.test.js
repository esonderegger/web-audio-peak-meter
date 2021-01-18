const utils = require('./utils');

describe('dbFromFloat functionality', () => {
  it('has a zero based full-scale', () => {
    expect.hasAssertions();
    const db = utils.dbFromFloat(1);
    expect(db).toBe(0);
  });

  it('interprets halving to be 6dB', () => {
    expect.hasAssertions();
    const db = utils.dbFromFloat(0.5);
    expect(db).toBeCloseTo(-6.02);
  });

  it('interprets decimating to be 20dB', () => {
    expect.hasAssertions();
    const db = utils.dbFromFloat(0.1);
    expect(db).toBeCloseTo(-20);
  });

  it('interprets decimating and halving to be 26dB', () => {
    expect.hasAssertions();
    const db = utils.dbFromFloat(0.05);
    expect(db).toBeCloseTo(-26.02);
  });

  it('returns positive numbers for values above full-scale', () => {
    expect.hasAssertions();
    const db = utils.dbFromFloat(2);
    expect(db).toBeCloseTo(6.02);
  });
});

describe('findAudioProcBufferSize functionality', () => {
  it('finds closest when rounding up', () => {
    expect.hasAssertions();
    const bufferSize = utils.findAudioProcBufferSize(2000);
    expect(bufferSize).toBe(2048);
  });

  it('finds closest when rounding down', () => {
    expect.hasAssertions();
    const bufferSize = utils.findAudioProcBufferSize(3000);
    expect(bufferSize).toBe(2048);
  });
});

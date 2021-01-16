const peakSample = require('./peak-sample');

describe('calculateMaxValues functionality', () => {
  it('calculateMaxValues can return maxes from input buffer', () => {
    expect.hasAssertions();
    const testBuffer = {
      numberOfChannels: 2,
      getChannelData: (i) => {
        if (i === 0) {
          return [0, 0, 0.1, 0.2, 0];
        }
        return [0, 0, -0.1, -0.3, 0];
      },
    };
    const maxes = peakSample.calculateMaxValues(testBuffer);
    expect(Array.isArray(maxes)).toBe(true);
    expect(maxes).toHaveLength(2);
    expect(maxes[0]).toBe(0.2);
    expect(maxes[1]).toBe(0.3);
  });
});

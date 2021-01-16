const markup = require('./markup');

describe('audioClipPath functionality', () => {
  it('can handle values in the middle of the range (vertical)', () => {
    expect.hasAssertions();
    const clipPath = markup.audioClipPath(-12, 48, true);
    expect(clipPath).toBe('inset(25% 0 0)');
  });
  it('can handle values in the middle of the range (horizontal)', () => {
    expect.hasAssertions();
    const clipPath = markup.audioClipPath(-24, 48, false);
    expect(clipPath).toBe('inset(0 50% 0 0)');
  });
});

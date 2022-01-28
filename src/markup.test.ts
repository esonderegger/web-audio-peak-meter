import {audioClipPath} from './markup';

describe('audioClipPath functionality', () => {
  it('can handle values in the middle of the range (vertical)', () => {
    expect.hasAssertions();
    const clipPath = audioClipPath(-12, -48, 0, true);
    expect(clipPath).toBe('inset(25% 0 0)');
  });
  it('can handle values in the middle of the range (horizontal)', () => {
    expect.hasAssertions();
    const clipPath = audioClipPath(-24, -48, 0, false);
    expect(clipPath).toBe('inset(0 50% 0 0)');
  });
});

export function calculateMaxValues(inputBuffer: AudioBuffer): Array<number> {
  const channelMaxes = [];
  const { numberOfChannels } = inputBuffer;

  for (let c = 0; c < numberOfChannels; c += 1) {
    channelMaxes[c] = 0.0;
    const channelData = inputBuffer.getChannelData(c);
    for (let s = 0; s < channelData.length; s += 1) {
      if (Math.abs(channelData[s]) > channelMaxes[c]) {
        channelMaxes[c] = Math.abs(channelData[s]);
      }
    }
  }
  return channelMaxes;
}

export function peakValues(input:Float32Array[]): number[] {
  return input.map(channel => {
    let max = 0;
    for (let s = 0; s < channel.length; s++) {
      const sAbs = Math.abs(channel[s]);
      if (sAbs > max) {
        max = sAbs;
      }
    }
    return max;
  });
}

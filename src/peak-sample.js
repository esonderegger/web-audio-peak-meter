function calculateMaxValues(inputBuffer) {
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

module.exports = {
  calculateMaxValues,
};

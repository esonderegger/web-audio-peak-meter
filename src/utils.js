const debugMode = false;

function log(...args) {
  if (debugMode) {
    console.log(...args);
  }
}

function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

function dbFromFloat(floatVal) {
  return getBaseLog(10, floatVal) * 20;
}

function findAudioProcBufferSize(numSamplesIn) {
  return [256, 512, 1024, 2048, 4096, 8192, 16384].reduce((a, b) => (
    Math.abs(b - numSamplesIn) < Math.abs(a - numSamplesIn) ? b : a));
}

module.exports = {
  log,
  dbFromFloat,
  findAudioProcBufferSize,
};

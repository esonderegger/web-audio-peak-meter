const markup = require('./markup');
const peakSample = require('./peak-sample');
const truePeak = require('./true-peak');
const utils = require('./utils');

const defaultConfig = {
  borderSize: 2,
  fontSize: 9,
  backgroundColor: 'black',
  tickColor: '#ddd',
  labelColor: '#ddd',
  gradient: ['red 1%', '#ff0 16%', 'lime 45%', '#080 100%'],
  dbRange: 48,
  dbTickSize: 6,
  maskTransition: '0.1s',
  audioMeterStandard: 'peak-sample', // Could be "true-peak" (ITU-R BS.1770) or "peak-sample"
  refreshEveryApproxMs: 20,
};

function createMeterNode(sourceNode, audioCtx, options = {}) {
  // eslint-disable-next-line prefer-object-spread
  const config = Object.assign({}, defaultConfig, options);
  const { refreshEveryApproxMs } = config;
  const { channelCount, sampleRate } = sourceNode;

  // Calculate refresh interval
  const resfreshIntervalSamples = (refreshEveryApproxMs / 1000) * sampleRate * channelCount;
  const bufferSize = utils.findAudioProcBufferSize(resfreshIntervalSamples);
  const meterNode = audioCtx.createScriptProcessor(bufferSize, channelCount, channelCount);
  sourceNode.connect(meterNode).connect(audioCtx.destination);
  return meterNode;
}

function updateMeter(audioProcessingEvent, config, meterData) {
  const { inputBuffer } = audioProcessingEvent;
  const { audioMeterStandard } = config;
  let channelMaxes = [];

  // Calculate peak levels
  if (audioMeterStandard === 'true-peak') {
    // This follows ITU-R BS.1770 (True Peak meter)
    channelMaxes = truePeak.calculateTPValues(inputBuffer, meterData);
  } else {
    // Just get the peak level
    channelMaxes = peakSample.calculateMaxValues(inputBuffer);
  }
  // Update peak & text values
  for (let i = 0; i < channelMaxes.length; i += 1) {
    meterData.tempPeaks[i] = channelMaxes[i];
    if (channelMaxes[i] > meterData.heldPeaks[i]) {
      meterData.heldPeaks[i] = channelMaxes[i];
    }
  }
}

function createMeter(domElement, meterNode, options = {}) {
  // eslint-disable-next-line prefer-object-spread
  const config = Object.assign({}, defaultConfig, options);

  const meterElement = markup.createContainerDiv(domElement, config);
  const meterData = markup.createTicks(meterElement, config);

  const { channelCount } = meterNode;

  meterData.tempPeaks = new Array(channelCount).fill(0.0);
  meterData.heldPeaks = new Array(channelCount).fill(0.0);
  meterData.channelCount = channelCount;

  meterData.channelBars = markup.createBars(meterElement, config, meterData);
  meterData.channelMasks = markup.createMasks(meterElement, config, meterData);
  meterData.textLabels = markup.createPeakLabels(meterElement, config, meterData);

  if (config.audioMeterStandard === 'true-peak') {
    meterData.lpfCoefficients = [];
    meterData.lpfBuffer = [];
    meterData.upsampleFactor = 4;
    meterData.lastChannelTP = [];
    meterData.decayFactor = 0.99999;
  }

  meterNode.onaudioprocess = (evt) => updateMeter(evt, config, meterData);
  meterElement.addEventListener('click', () => {
    meterData.heldPeaks.fill(0.0);
  }, false);
  markup.paintMeter(config, meterData);
}

module.exports = {
  createMeterNode,
  createMeter,
};

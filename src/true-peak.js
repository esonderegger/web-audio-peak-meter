const utils = require('./utils');

function findAudioProcBufferSize(numSamplesIn) {
  return [256, 512, 1024, 2048, 4096, 8192, 16384].reduce((a, b) => (
    Math.abs(b - numSamplesIn) < Math.abs(a - numSamplesIn) ? b : a));
}

function calculateLPFCoefficients(numCoefficients, upsampleFactor) {
  const retCoefs = [];
  const fcRel = 1.0 / (4.0 * upsampleFactor);
  const coefsLim = Math.floor((numCoefficients - 1) / 2);
  for (let n = -coefsLim; n <= coefsLim; n += 1) {
    const wn = 0.54 + 0.46 * Math.cos((2.0 * Math.PI * n) / numCoefficients);
    let hn = 0.0;
    if (n === 0) {
      hn = 2.0 * fcRel;
    } else {
      hn = Math.sin(2.0 * Math.PI * fcRel * n) / (Math.PI * n);
    }
    // Adapt windows & upsampler factor
    hn = (wn * hn) * upsampleFactor;
    retCoefs.push(hn);
  }
  return retCoefs;
}

function filterSample(sample, meterData) {
  const { lpfBuffer, lpfCoefficients, upsampleFactor } = meterData;
  const ret = [];
  lpfBuffer.push(sample);
  if (lpfBuffer.length >= lpfCoefficients.length) {
    lpfBuffer.shift();
  }
  for (let nA = 0; nA < upsampleFactor; nA += 1) {
    let nT = 0;
    let retVal = 0;
    for (let nc = nA; nc < lpfCoefficients.length; nc += upsampleFactor) {
      retVal += (lpfCoefficients[nc] * lpfBuffer[lpfBuffer.length - 1 - nT]);
      nT += 1;
    }
    ret.push(retVal);
  }
  return ret;
}

function audioOverSampleAndFilter(channelData, inputFs, meterData) {
  let res = [];
  // Initialize filter coefficients and buffer
  if (meterData.lpfCoefficients.length <= 0) {
    utils.log(`Initialing filter components for ITU-R BS.1770, fs: ${inputFs}`);
    if (inputFs >= 96000) {
      meterData.upsampleFactor = 2;
    }
    meterData.lpfCoefficients = calculateLPFCoefficients(33, meterData.upsampleFactor);
    meterData.lpfBuffer = new Array(meterData.lpfCoefficients.length).fill(0.0);
    utils.log(`Initialized lpfCoefficients lpfCoefficients=[${meterData.lpfCoefficients.join(',')}], and lpfBuffer: [${meterData.lpfBuffer.join(',')}]`);
  }
  for (let ni = 0; ni < channelData.length; ni += 1) {
    // 1 input sample -> generated upsampleFactor samples
    const samplesOut = filterSample(channelData[ni], meterData);
    res = res.concat(samplesOut);
  }
  return res;
}

function calculateTPValues(inputBuffer, meterData) {
  const { lastChannelTP, channelCount } = meterData;
  const { sampleRate } = inputBuffer;
  // Ini TP values
  if (lastChannelTP.length <= 0) {
    utils.log(`Initialing TP values for ${channelCount}channels`);
    meterData.lastChannelTP = new Array(channelCount).fill(0.0);
    // Decay time ms = 1700 and -20Db
    const attFactor = Math.pow(10.0, -20 / 10.0);
    const decayTimeS = 1700 / 1000;
    meterData.decayFactor = Math.pow(attFactor, 1.0 / (sampleRate * decayTimeS));
    utils.log(`Initialized with decayFactor ${meterData.decayFactor}`);
  }
  for (let c = 0; c < channelCount; c += 1) {
    const channelData = inputBuffer.getChannelData(c);
    // Process according to ITU-R BS.1770
    const overSampledAndLPF = audioOverSampleAndFilter(channelData, sampleRate, meterData);
    for (let s = 0; s < overSampledAndLPF.length; s += 1) {
      lastChannelTP[c] *= meterData.decayFactor;
      if (Math.abs(overSampledAndLPF[s]) > lastChannelTP[c]) {
        lastChannelTP[c] = Math.abs(overSampledAndLPF[s]);
      }
    }
  }
  return lastChannelTP;
}

module.exports = {
  findAudioProcBufferSize,
  calculateLPFCoefficients,
  filterSample,
  audioOverSampleAndFilter,
  calculateTPValues,
};

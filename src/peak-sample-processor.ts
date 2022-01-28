import { peakValues } from './peak-sample';

class PeakSampleProcessor extends AudioWorkletProcessor {
  process(inputs:Float32Array[][]) {
    const input = inputs[0];
    const maxes = peakValues(input);
    this.port.postMessage({type: 'peaks', peaks: maxes});
    return true;
  }
}

try {
  registerProcessor('peak-sample-processor', PeakSampleProcessor);
} catch (err) {
  console.info('Failed to register peak-sample-processor. This probably means it was already registered.');
}

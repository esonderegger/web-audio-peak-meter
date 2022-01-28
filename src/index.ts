import { PeakMeterConfig, defaultConfig } from "./config";
import {
  audioClipPath,
  createContainerDiv,
  createTicks,
  createChannelElements,
  createBars,
  createPeakLabels,
} from './markup';
import { dbFromFloat } from "./utils";
import peakSampleProcessor from "./peak-sample-processor.txt";
import truePeakProcessor from "./true-peak-processor.txt";

export class WebAudioPeakMeter {
  channelCount: number;
  srcNode: AudioNode;
  node?: AudioWorkletNode;
  config: PeakMeterConfig;
  parent?: HTMLElement;
  ticks?: Array<HTMLElement>;
  channelElements?: Array<HTMLElement>;
  bars?: Array<HTMLElement>;
  peakLabels?: Array<HTMLElement>;
  tempPeaks: Array<number>;
  heldPeaks: Array<number>;
  peakHoldTimeouts: Array<number>;

  constructor(src:AudioNode, ele: HTMLElement, options = {}) {
    this.srcNode = src;
    this.config = Object.assign({...defaultConfig}, options);
    this.channelCount = src.channelCount;
    this.tempPeaks = new Array(this.channelCount).fill(0.0);
    this.heldPeaks = new Array(this.channelCount).fill(0.0);
    this.peakHoldTimeouts = new Array(this.channelCount).fill(0);
    if (ele) {
      this.parent = createContainerDiv(ele, this.config);
      this.channelElements = createChannelElements(this.parent, this.config, this.channelCount);
      this.peakLabels = createPeakLabels(this.channelElements, this.config);
      this.bars = createBars(this.channelElements, this.config);
      this.ticks = createTicks(this.parent, this.config);
      this.parent.addEventListener('click', () => this.clearPeaks());
      this.paintMeter();
    }
    this.initNode();
  }

  async initNode() {
    const { audioMeterStandard } = this.config;
    try {
      this.node = new AudioWorkletNode(this.srcNode.context, `${audioMeterStandard}-processor`, { parameterData: { foo: 5 }});
    } catch (err) {
      const workletString = audioMeterStandard === 'true-peak' ? truePeakProcessor : peakSampleProcessor;
      const blob = new Blob([workletString], {type: 'application/javascript'});
      const objectURL = URL.createObjectURL(blob);
      await this.srcNode.context.audioWorklet.addModule(objectURL);
      this.node = new AudioWorkletNode(this.srcNode.context, `${audioMeterStandard}-processor`, { parameterData: { foo: 5 }});
    }
    this.node.port.onmessage = (ev:MessageEvent) => this.handleNodePortMessage(ev);
    this.srcNode.connect(this.node).connect(this.srcNode.context.destination);
  }

  handleNodePortMessage(ev:MessageEvent) {
    if (ev.data.type === 'message') {
      console.log(ev.data.message);
    }
    if (ev.data.type === 'peaks') {
      const { peaks } = ev.data;
      for (let i = 0; i < this.tempPeaks.length; i += 1) {
        if (peaks.length > i) {
          this.tempPeaks[i] = peaks[i];
        } else {
          this.tempPeaks[i] = 0.0
        }
      }
      // this.tempPeaks = peaks;
      if (peaks.length < this.channelCount) {
        this.tempPeaks.fill(0.0, peaks.length);
      }
      for (let i = 0; i < peaks.length; i += 1) {
        if (peaks[i] > this.heldPeaks[i]) {
          this.heldPeaks[i] = peaks[i];
          if (this.peakHoldTimeouts[i]) {
            clearTimeout(this.peakHoldTimeouts[i]);
          }
          if (this.config.peakHoldDuration) {
            this.peakHoldTimeouts[i] = window.setTimeout(() => {
              this.clearPeak(i);
            }, this.config.peakHoldDuration);
          }
        }
      }
    }
  }

  paintMeter() {
    const { dbRangeMin, dbRangeMax, vertical } = this.config;
    if (this.bars) {
      this.bars.forEach((barDiv, i) => {
        const tempPeak = dbFromFloat(this.tempPeaks[i]);
        const clipPath = audioClipPath(tempPeak, dbRangeMin, dbRangeMax, vertical);
        barDiv.style.clipPath = clipPath;
      });
    }
    if (this.peakLabels) {
      this.peakLabels.forEach((textLabel, i) => {
        if (this.heldPeaks[i] === 0.0) {
          textLabel.textContent = '-∞';
        } else {
          const heldPeak = dbFromFloat(this.heldPeaks[i]);
          textLabel.textContent = heldPeak.toFixed(1);
        }
      });
    }
    window.requestAnimationFrame(() => this.paintMeter());
  }

  clearPeak(i: number) {
    this.heldPeaks[i] = this.tempPeaks[i];
  }

  clearPeaks() {
    for (let i = 0; i < this.heldPeaks.length; i += 1) {
      this.clearPeak(i);
    }
  }
}

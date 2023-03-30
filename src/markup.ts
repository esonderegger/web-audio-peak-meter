import { PeakMeterConfig } from './config';
import { dbFromFloat, dbTicks } from './utils';

const horizontalLabelWidth = 3;
const verticalLabelHeight = 1.5;
const horizontalTickHeight = 1.5;
const verticalTickWidth = 2;

export function audioClipPath(
  db: number,
  dbRangeMin: number,
  dbRangeMax: number,
  vertical: boolean
): string {
  let clipPercent = Math.floor(((dbRangeMax - db) * 100) / (dbRangeMax - dbRangeMin));
  if (clipPercent > 100) {
    clipPercent = 100;
  }
  if (clipPercent < 0) {
    clipPercent = 0;
  }
  if (vertical) {
    return `inset(${clipPercent}% 0 0)`;
  }
  return `inset(0 ${clipPercent}% 0 0)`;
}

export function createContainerDiv(parent: HTMLElement, config: PeakMeterConfig): HTMLElement {
  const { backgroundColor, borderSize, vertical } = config;
  const meterElement = document.createElement('div');
  meterElement.style.backgroundColor = backgroundColor;
  meterElement.style.boxSizing = 'border-box';
  meterElement.style.height = '100%';
  meterElement.style.padding = `${borderSize}px`;
  if (vertical) {
    meterElement.style.display = 'flex';
    meterElement.style.flexDirection = 'row-reverse';
  }
  parent.appendChild(meterElement);
  return meterElement;
}

export function createTicks(parent: HTMLElement, config: PeakMeterConfig): Array<HTMLElement> {
  const { dbRangeMin, dbRangeMax, dbTickSize, fontSize, borderSize, tickColor, vertical } = config;
  const ticks = dbTicks(dbRangeMin, dbRangeMax, dbTickSize);
  const ticksDiv = document.createElement('div');
  ticksDiv.style.position = 'relative';
  if (vertical) {
    ticksDiv.style.height = `calc(100% - ${fontSize * verticalLabelHeight}px)`;
    ticksDiv.style.width = `${fontSize * verticalTickWidth}px`;
    ticksDiv.style.marginTop = `${fontSize * verticalLabelHeight}px`;
  } else {
    ticksDiv.style.height = `${fontSize * horizontalTickHeight}px`;
    ticksDiv.style.width = `calc(100% - ${fontSize * horizontalLabelWidth}px)`;
    ticksDiv.style.marginRight = `${fontSize * horizontalLabelWidth}px`;
  }
  parent.appendChild(ticksDiv);
  const tickDivs = ticks.map((t) => {
    const tickDiv = document.createElement('div');
    ticksDiv.appendChild(tickDiv);
    tickDiv.style.position = 'absolute';
    tickDiv.style.color = tickColor;
    tickDiv.style.fontSize = `${fontSize}px`;
    tickDiv.textContent = t.toString();
    const percentInRange = ((dbRangeMax - t) / (dbRangeMax - dbRangeMin)) * 100;
    if (vertical) {
      tickDiv.style.top = `calc(${percentInRange}% - ${fontSize / 2}px)`;
      tickDiv.style.right = `${borderSize}px`;
      tickDiv.style.textAlign = 'right';
    } else {
      tickDiv.style.right = `${percentInRange}%`;
      tickDiv.style.transform = 'translateX(50%)';
    }
    return tickDiv;
  });
  return tickDivs;
}

export function createChannelElements(
  parent: HTMLElement,
  config: PeakMeterConfig,
  channelCount: number
): Array<HTMLElement> {
  const { fontSize, vertical, borderSize } = config;
  const outerDiv = document.createElement('div');
  outerDiv.style.display = 'flex';
  outerDiv.style.justifyContent = 'space-between';
  if (vertical) {
    outerDiv.style.height = '100%';
    outerDiv.style.width = `calc(100% - ${fontSize * verticalTickWidth}px)`;
  } else {
    outerDiv.style.height = `calc(100% - ${fontSize * horizontalTickHeight}px)`;
    outerDiv.style.width = '100%';
    outerDiv.style.flexDirection = 'column';
  }
  parent.appendChild(outerDiv);
  const totalBorder = (channelCount - 1) * borderSize;
  const channelDivs = Array.from(Array(channelCount).keys()).map(() => {
    const channelDiv = document.createElement('div');
    if (vertical) {
      channelDiv.style.height = '100%';
      channelDiv.style.width = `calc((100% - ${totalBorder}px) / ${channelCount})`;
    } else {
      channelDiv.style.display = 'flex';
      channelDiv.style.height = `calc((100% - ${totalBorder}px) / ${channelCount})`;
      channelDiv.style.width = '100%';
      channelDiv.style.flexDirection = 'row-reverse';
    }
    outerDiv.appendChild(channelDiv);
    return channelDiv;
  });
  return channelDivs;
}

export function createPeakLabels(
  parents: HTMLElement[],
  config: PeakMeterConfig
): Array<HTMLElement> {
  const { labelColor, fontSize, vertical } = config;
  const labelDivs = parents.map((parent) => {
    const label = document.createElement('div');
    // label.style.textAlign = 'center';
    label.style.color = labelColor;
    label.style.fontSize = `${fontSize}px`;
    label.textContent = '-∞';
    if (vertical) {
      label.style.height = `${fontSize * verticalLabelHeight}px`;
      label.style.width = '100%';
      label.style.textAlign = 'center';
    } else {
      // label.style.height = '100%';
      label.style.width = `${fontSize * horizontalLabelWidth}px`;
      // label.style.transform = `translateY(calc(50% - ${fontSize / 2}px))`;
      label.style.display = 'flex';
      label.style.justifyContent = 'center';
      label.style.alignItems = 'center';
    }
    parent.appendChild(label);
    return label;
  });
  return labelDivs;
}

export function createBars(parents: HTMLElement[], config: PeakMeterConfig): Array<HTMLElement> {
  const { gradient, vertical, fontSize, maskTransition } = config;
  // const initialClipPath = audioClipPath(dbRange, dbRange, vertical);
  const barDivs = parents.map((parent) => {
    const barDiv = document.createElement('div');
    barDiv.style.transition = `clip-path ${maskTransition}`;
    if (vertical) {
      barDiv.style.height = `calc(100% - ${fontSize * verticalLabelHeight}px)`;
      barDiv.style.width = '100%';
      barDiv.style.backgroundImage = `linear-gradient(to bottom, ${gradient.join(', ')})`;
    } else {
      barDiv.style.height = '100%';
      // barDiv.style.minHeight = '1rem';
      barDiv.style.width = `calc(100% - ${fontSize * horizontalLabelWidth}px)`;
      barDiv.style.backgroundImage = `linear-gradient(to left, ${gradient.join(', ')})`;
    }
    parent.appendChild(barDiv);
    return barDiv;
  });
  return barDivs;
}

export function maskSize(floatVal: number, dbRange: number, meterDimension: number): number {
  const d = dbRange * -1;
  const numPx = Math.floor((dbFromFloat(floatVal) * meterDimension) / d);
  if (numPx > meterDimension) {
    return meterDimension;
  }
  if (numPx < 0) {
    return 0;
  }
  return numPx;
}

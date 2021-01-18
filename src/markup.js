const utils = require('./utils');

function audioClipPath(db, dbRange, vertical) {
  let clipPercent = Math.floor((db * -100) / dbRange);
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

function createContainerDiv(parent, config) {
  const { clientWidth, clientHeight } = parent;
  const { backgroundColor } = config;
  const meterElement = document.createElement('div');
  meterElement.style.position = 'relative';
  meterElement.style.width = `${clientWidth}px`;
  meterElement.style.height = `${clientHeight}px`;
  meterElement.style.backgroundColor = backgroundColor;
  parent.appendChild(meterElement);
  return meterElement;
}

function createTicks(parent, config) {
  const { clientWidth, clientHeight } = parent;
  const {
    dbRange, dbTickSize, fontSize, borderSize, tickColor,
  } = config;
  const numTicks = Math.floor(dbRange / dbTickSize);
  const tickDivs = Array.from(Array(numTicks).keys()).map((i) => {
    const tickDiv = document.createElement('div');
    parent.appendChild(tickDiv);
    tickDiv.style.position = 'absolute';
    tickDiv.style.color = tickColor;
    tickDiv.style.textAlign = 'right';
    tickDiv.style.fontSize = `${fontSize}px`;
    tickDiv.textContent = `-${dbTickSize * i}`;
    return tickDiv;
  });
  const vertical = clientHeight > clientWidth;
  if (vertical) {
    const tickWidth = fontSize * 2.0;
    const meterTop = fontSize * 1.5 + borderSize;
    const dbTickTop = fontSize + borderSize;
    const meterHeight = clientHeight - meterTop - borderSize;
    const meterWidth = clientWidth - tickWidth - borderSize;
    const tickSpacing = meterHeight / numTicks;
    tickDivs.forEach((tickDiv, i) => {
      tickDiv.style.width = `${tickWidth}px`;
      tickDiv.style.top = `${(tickSpacing * i) + dbTickTop}px`;
    });
    return {
      vertical, tickWidth, meterHeight, meterWidth, meterTop,
    };
  }
  const tickWidth = fontSize * 1.5;
  const meterHeight = (clientHeight - tickWidth) - (borderSize * 2);
  const meterTop = fontSize * 3;
  const meterWidth = (clientWidth - meterTop) - (borderSize * 2);
  const tickSpacing = meterWidth / numTicks;
  tickDivs.forEach((tickDiv, i) => {
    tickDiv.style.width = `${meterTop}px`;
    tickDiv.style.bottom = `${borderSize}px`;
    tickDiv.style.right = `${(tickSpacing * i) + meterTop}px`;
  });
  return {
    vertical, tickWidth, meterHeight, meterWidth, meterTop,
  };
}

function createBars(parent, config, meterData) {
  const { gradient, borderSize } = config;
  const {
    channelCount, vertical, meterWidth, meterHeight, meterTop, tickWidth,
  } = meterData;
  // const initialClipPath = audioClipPath(dbRange, dbRange, vertical);
  const barDivs = Array.from(Array(channelCount).keys()).map(() => {
    const barDiv = document.createElement('div');
    parent.appendChild(barDiv);
    barDiv.style.position = 'absolute';
    // barDiv.style.clipPath = initialClipPath;
    // barDiv.style.WebkitClipPath = initialClipPath;
    return barDiv;
  });
  if (vertical) {
    const barWidth = (meterWidth / channelCount) - borderSize;
    const gradientStyle = `linear-gradient(to bottom, ${gradient.join(', ')})`;
    barDivs.forEach((barDiv, i) => {
      barDiv.style.height = `${meterHeight}px`;
      barDiv.style.width = `${barWidth}px`;
      barDiv.style.backgroundImage = gradientStyle;
      barDiv.style.top = `${meterTop}px`;
      barDiv.style.left = `${((barWidth + borderSize) * i) + tickWidth + borderSize}px`;
    });
  } else {
    const barWidth = (meterHeight / channelCount) - borderSize;
    const gradientStyle = `linear-gradient(to left, ${gradient.join(', ')})`;
    barDivs.forEach((barDiv, i) => {
      barDiv.style.height = `${barWidth}px`;
      barDiv.style.width = `${meterWidth}px`;
      barDiv.style.backgroundImage = gradientStyle;
      barDiv.style.top = `${((barWidth + borderSize) * i) + borderSize}px`;
      barDiv.style.right = `${meterTop}px`;
    });
  }
  return barDivs;
}

function createMasks(parent, config, meterData) {
  const { backgroundColor, borderSize, maskTransition } = config;
  const {
    channelCount, vertical, meterWidth, meterHeight, meterTop, tickWidth,
  } = meterData;
  const barDivs = Array.from(Array(channelCount).keys()).map(() => {
    const barDiv = document.createElement('div');
    parent.appendChild(barDiv);
    barDiv.style.position = 'absolute';
    barDiv.style.backgroundColor = backgroundColor;
    return barDiv;
  });
  if (vertical) {
    const barWidth = (meterWidth / channelCount) - borderSize;
    barDivs.forEach((barDiv, i) => {
      barDiv.style.height = `${meterHeight}px`;
      barDiv.style.width = `${barWidth}px`;
      barDiv.style.top = `${meterTop}px`;
      barDiv.style.left = `${((barWidth + borderSize) * i) + tickWidth + borderSize}px`;
      barDiv.style.transition = `height ${maskTransition}`;
    });
  } else {
    const barWidth = (meterHeight / channelCount) - borderSize;
    barDivs.forEach((barDiv, i) => {
      barDiv.style.height = `${barWidth}px`;
      barDiv.style.width = `${meterWidth}px`;
      barDiv.style.top = `${((barWidth + borderSize) * i) + borderSize}px`;
      barDiv.style.right = `${meterTop}px`;
      barDiv.style.transition = `width ${maskTransition}`;
    });
  }
  return barDivs;
}

function createPeakLabels(parent, config, meterData) {
  const { borderSize, labelColor, fontSize } = config;
  const {
    channelCount, vertical, meterWidth, meterHeight, tickWidth,
  } = meterData;
  const labelDivs = Array.from(Array(channelCount).keys()).map(() => {
    const label = document.createElement('div');
    parent.appendChild(label);
    label.style.textAlign = 'center';
    label.style.color = labelColor;
    label.style.fontSize = `${fontSize}px`;
    label.style.position = 'absolute';
    label.textContent = '-∞';
    return label;
  });
  if (vertical) {
    const barWidth = meterWidth / channelCount;
    labelDivs.forEach((label, i) => {
      label.style.width = `${barWidth}px`;
      label.style.top = `${borderSize}px`;
      label.style.left = `${(barWidth * i) + tickWidth}px`;
    });
  } else {
    const barHeight = meterHeight / channelCount;
    labelDivs.forEach((label, i) => {
      label.style.width = `${fontSize * 2}px`;
      label.style.right = `${borderSize}px`;
      label.style.top = `${(barHeight * i) + tickWidth}px`;
    });
  }
  return labelDivs;
}

function maskSize(floatVal, dbRange, meterDimension) {
  const d = dbRange * -1;
  const numPx = Math.floor((utils.dbFromFloat(floatVal) * meterDimension) / d);
  if (numPx > meterDimension) {
    return meterDimension;
  }
  if (numPx < 0) {
    return 0;
  }
  return numPx;
}

function paintMeter(config, meterData) {
  const { dbRange } = config;
  const {
    tempPeaks, heldPeaks, channelMasks, textLabels, meterHeight, meterWidth, vertical,
  } = meterData;
  // hopefully some day transition will work for clip path.
  // until then we use a mask div.
  // channelBars.forEach((barDiv, i) => {
  //   const tempPeak = utils.dbFromFloat(tempPeaks[i]);
  //   const clipPath = audioClipPath(tempPeak, dbRange, vertical);
  //   barDiv.style.clipPath = clipPath;
  //   barDiv.style.WebkitClipPath = clipPath;
  // });
  const meterDimension = vertical ? meterHeight : meterWidth;
  channelMasks.forEach((maskDiv, i) => {
    const channelSize = maskSize(tempPeaks[i], dbRange, meterDimension);
    if (vertical) {
      maskDiv.style.height = `${channelSize}px`;
    } else {
      maskDiv.style.width = `${channelSize}px`;
    }
  });
  textLabels.forEach((textLabel, i) => {
    if (heldPeaks[i] === 0.0) {
      textLabel.textContent = '-∞';
    } else {
      const heldPeak = utils.dbFromFloat(heldPeaks[i]);
      textLabel.textContent = heldPeak.toFixed(1);
    }
  });
  window.requestAnimationFrame(() => paintMeter(config, meterData));
}

module.exports = {
  audioClipPath,
  createContainerDiv,
  createTicks,
  createBars,
  createMasks,
  createPeakLabels,
  maskSize,
  paintMeter,
};
